import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Checks if a product's stock has fallen below its minimum level and creates/updates an alert.
 * Also resolves active alerts if stock is back above minimum.
 *
 * @param supabase The Supabase client instance.
 * @param productStockCode The stock code of the product.
 * @param newQuantityOnHand The new quantity on hand after a stock change.
 * @param minStockLevel The minimum stock level defined for the product. If null or 0, no alert is triggered.
 */
export async function checkAndManageLowStockAlert(
  supabase: SupabaseClient,
  productStockCode: string,
  newQuantityOnHand: number,
  minStockLevel: number | null | undefined,
): Promise<{ alertCreated?: boolean; alertResolved?: boolean; error?: string }> {
  if (minStockLevel === null || minStockLevel === undefined || minStockLevel <= 0) {
    // No minimum stock level defined, or it's not positive, so no alert.
    // Check if there's an active alert that needs to be resolved because min_stock_level was removed/set to 0.
    const { data: existingActiveAlertForRemovedMinStock, error: fetchExistingError } = await supabase
      .from("low_stock_alerts")
      .select("id")
      .eq("product_stock_code", productStockCode)
      .eq("status", "active")
      .maybeSingle()

    if (fetchExistingError) {
      console.error(
        `Error fetching existing active alert for ${productStockCode} (min_stock_level removed/zeroed):`,
        fetchExistingError.message,
      )
      // Non-critical, proceed without resolving
    }

    if (existingActiveAlertForRemovedMinStock) {
      const { error: resolveError } = await supabase
        .from("low_stock_alerts")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          notes: "Minimum stok seviyesi kaldırıldığı/sıfırlandığı için çözüldü.",
        })
        .eq("id", existingActiveAlertForRemovedMinStock.id)

      if (resolveError) {
        console.error(
          `Error resolving active alert for ${productStockCode} (min_stock_level removed/zeroed):`,
          resolveError.message,
        )
        return { error: `Uyarı çözülürken hata: ${resolveError.message}` }
      }
      return { alertResolved: true }
    }
    return {} // No action needed
  }

  if (newQuantityOnHand < minStockLevel) {
    // Stock is below minimum level. Check if an active alert already exists.
    const { data: existingActiveAlert, error: fetchError } = await supabase
      .from("low_stock_alerts")
      .select("id")
      .eq("product_stock_code", productStockCode)
      .eq("status", "active")
      .maybeSingle()

    if (fetchError) {
      console.error(`Error fetching existing active alert for ${productStockCode}:`, fetchError.message)
      return { error: `Mevcut uyarı kontrol edilirken hata: ${fetchError.message}` }
    }

    if (!existingActiveAlert) {
      // No active alert exists, create a new one.
      const { error: insertError } = await supabase.from("low_stock_alerts").insert({
        product_stock_code: productStockCode,
        current_stock_at_alert: newQuantityOnHand,
        min_stock_level_at_alert: minStockLevel,
        status: "active",
      })

      if (insertError) {
        console.error(`Error creating low stock alert for ${productStockCode}:`, insertError.message)
        return { error: `Düşük stok uyarısı oluşturulurken hata: ${insertError.message}` }
      }
      return { alertCreated: true }
    }
    // Active alert already exists, do nothing.
    return {}
  } else {
    // Stock is at or above minimum level. Check if there's an active alert to resolve.
    const { data: existingActiveAlertToResolve, error: fetchError } = await supabase
      .from("low_stock_alerts")
      .select("id")
      .eq("product_stock_code", productStockCode)
      .eq("status", "active")
      .maybeSingle()

    if (fetchError) {
      console.error(`Error fetching existing active alert for resolution for ${productStockCode}:`, fetchError.message)
      // Non-critical, proceed without resolving
    }

    if (existingActiveAlertToResolve) {
      const { error: resolveError } = await supabase
        .from("low_stock_alerts")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          notes: "Stok seviyesi minimumun üzerine çıktı.",
        })
        .eq("id", existingActiveAlertToResolve.id)

      if (resolveError) {
        console.error(`Error resolving active alert for ${productStockCode}:`, resolveError.message)
        return { error: `Uyarı çözülürken hata: ${resolveError.message}` }
      }
      return { alertResolved: true }
    }
    return {} // No action needed
  }
}
