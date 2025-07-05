"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { checkAndManageLowStockAlert } from "@/lib/inventory-utils"

const stockAdjustmentSchema = z.object({
  productStockCode: z.string().min(1, "Ürün (Stok Kodu) seçimi zorunludur."),
  changeQuantity: z
    .number()
    .int("Miktar tam sayı olmalıdır.")
    .refine((val) => val !== 0, "Değişim miktarı 0 olamaz."),
  notes: z.string().max(500, "Notlar en fazla 500 karakter olabilir.").optional().nullable(),
  supplierId: z.string().optional().nullable(), // Add supplier field
})

export type StockAdjustmentFormState = {
  success: boolean
  message: string
  errors?: {
    productStockCode?: string[]
    changeQuantity?: string[]
    notes?: string[]
    supplierId?: string[]
    general?: string[]
  }
}

export type ProductSearchResult = {
  id: string
  name: string
  stock_code: string
  current_stock: number
}

export type SupplierSearchResult = {
  id: string
  name: string
  supplier_code: string | null
  contact_name: string | null
}

export async function adjustStockQuantityAction(
  prevState: StockAdjustmentFormState,
  formData: FormData,
): Promise<StockAdjustmentFormState> {
  const cookieStore = cookies()
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user || !user.email) {
    console.error("[SERVER ACTION adjustStockQuantityAction] Auth Error, no user, or no email:", authError, user)
    return {
      success: false,
      message: "Kullanıcı yetkilendirmesi başarısız veya e-posta bilgisi eksik.",
      errors: { general: ["Lütfen giriş yapın ve tekrar deneyin."] },
    }
  }

  const userId = user.id
  const userEmail = user.email

  const validatedFields = stockAdjustmentSchema.safeParse({
    productStockCode: formData.get("productId"),
    changeQuantity: formData.get("quantity") ? Number(formData.get("quantity")) : undefined,
    notes: formData.get("notes"),
    supplierId: formData.get("supplierId") || null,
  })

  if (!validatedFields.success) {
    console.error("Validation Errors in adjustStockQuantityAction:", validatedFields.error.flatten().fieldErrors)
    return {
      success: false,
      message: "Form verileri geçersiz.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { productStockCode, changeQuantity, notes, supplierId } = validatedFields.data
  const movementType = changeQuantity > 0 ? "adjustment_positive" : "adjustment_negative"

  try {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("quantity_on_hand, stock_code")
      .eq("stock_code", productStockCode)
      .single()

    if (productError || !product) {
      console.error("Product not found error:", productError)
      return {
        success: false,
        message: "Ürün bulunamadı.",
        errors: { productStockCode: ["Seçilen ürün (stok kodu ile) sistemde bulunamadı."] },
      }
    }

    // Verify supplier if provided
    if (supplierId) {
      const { data: supplier, error: supplierError } = await supabase
        .from("suppliers")
        .select("id")
        .eq("id", supplierId)
        .is("deleted_at", null)
        .single()

      if (supplierError || !supplier) {
        return {
          success: false,
          message: "Seçilen tedarikçi bulunamadı.",
          errors: { supplierId: ["Seçilen tedarikçi sistemde bulunamadı."] },
        }
      }
    }

    const currentQuantityOnHand = product.quantity_on_hand || 0
    const newQuantityOnHand = currentQuantityOnHand + changeQuantity

    if (newQuantityOnHand < 0) {
      return {
        success: false,
        message: "Stok eksiye düşemez.",
        errors: {
          changeQuantity: [
            `Mevcut stok (${currentQuantityOnHand}) ile bu işlem yapılamaz. Son stok ${newQuantityOnHand} olurdu.`,
          ],
        },
      }
    }

    const { error: updateProductError } = await supabase
      .from("products")
      .update({ quantity_on_hand: newQuantityOnHand })
      .eq("stock_code", product.stock_code)

    if (updateProductError) {
      console.error("Error updating product stock:", updateProductError)
      return {
        success: false,
        message: "Ürün stok miktarı güncellenirken bir hata oluştu.",
        errors: { general: [updateProductError.message] },
      }
    }

    // Check and manage low stock alert
    if (product.stock_code) {
      const { data: productDetailsForAlert, error: productDetailsError } = await supabase
        .from("products")
        .select("min_stock_level")
        .eq("stock_code", product.stock_code)
        .single()

      if (productDetailsError) {
        console.warn(
          `[adjustStockQuantityAction] Minimum stok seviyesi alınamadı (${product.stock_code}): ${productDetailsError.message}`,
        )
      } else if (productDetailsForAlert) {
        const alertResult = await checkAndManageLowStockAlert(
          supabase,
          product.stock_code,
          newQuantityOnHand,
          productDetailsForAlert.min_stock_level,
        )
        if (alertResult.error) {
          console.warn(
            `[adjustStockQuantityAction] Düşük stok uyarısı yönetilirken hata (${product.stock_code}): ${alertResult.error}`,
          )
        } else if (alertResult.alertCreated) {
          console.log(`[adjustStockQuantityAction] Düşük stok uyarısı oluşturuldu: ${product.stock_code}`)
          revalidatePath("/inventory/alerts")
        } else if (alertResult.alertResolved) {
          console.log(`[adjustStockQuantityAction] Düşük stok uyarısı çözüldü: ${product.stock_code}`)
          revalidatePath("/inventory/alerts")
        }
      }
    }

    const { error: movementError } = await supabase.from("inventory_movements").insert({
      product_stock_code: product.stock_code,
      movement_type: movementType,
      quantity_changed: changeQuantity,
      quantity_after_movement: newQuantityOnHand,
      notes: notes,
      user_id: userId,
      user_email: userEmail,
      supplier_id: supplierId, // Add supplier_id to movement record
    })

    if (movementError) {
      console.error("Error inserting stock movement:", movementError)
      return {
        success: false,
        message:
          "Stok hareketi kaydedilirken bir hata oluştu, ancak ürün stoğu güncellenmiş olabilir. Lütfen kontrol edin.",
        errors: { general: [movementError.message] },
      }
    }

    revalidatePath("/inventory")
    revalidatePath(`/products/${product.stock_code}`)

    return { success: true, message: `Stok başarıyla ayarlandı. Yeni miktar: ${newQuantityOnHand}` }
  } catch (e: any) {
    console.error("Unexpected error in adjustStockQuantityAction:", e)
    return { success: false, message: "Beklenmedik bir hata oluştu.", errors: { general: [e.message] } }
  }
}

export async function searchProductsForAdjustment(
  searchTerm: string,
): Promise<{ success: boolean; data?: ProductSearchResult[]; error?: string }> {
  const supabase = createClient()

  let query = supabase
    .from("products")
    .select("name, stock_code, quantity_on_hand")
    .is("deleted_at", null)
    .order("name")

  if (searchTerm.trim()) {
    query = query.or(`name.ilike.%${searchTerm}%,stock_code.ilike.%${searchTerm}%`)
  }

  const { data, error } = await query.limit(10)

  if (error) {
    console.error("[SERVER ACTION searchProductsForAdjustment] Error searching products in Supabase:", error)
    return { success: false, error: error.message }
  }

  if (!data) {
    return { success: true, data: [] }
  }

  const results: ProductSearchResult[] = data.map((p) => ({
    id: p.stock_code,
    name: p.name,
    stock_code: p.stock_code,
    current_stock: p.quantity_on_hand || 0,
  }))
  return { success: true, data: results }
}

export async function searchSuppliersForAdjustment(
  searchTerm: string,
): Promise<{ success: boolean; data?: SupplierSearchResult[]; error?: string }> {
  const supabase = createClient()

  let query = supabase
    .from("suppliers")
    .select("id, name, supplier_code, contact_name")
    .is("deleted_at", null)
    .order("name")

  if (searchTerm.trim()) {
    query = query.or(
      `name.ilike.%${searchTerm}%,supplier_code.ilike.%${searchTerm}%,contact_name.ilike.%${searchTerm}%`,
    )
  }

  const { data, error } = await query.limit(10)

  if (error) {
    console.error("[SERVER ACTION searchSuppliersForAdjustment] Error searching suppliers in Supabase:", error)
    return { success: false, error: error.message }
  }

  if (!data) {
    return { success: true, data: [] }
  }

  const results: SupplierSearchResult[] = data.map((s) => ({
    id: s.id,
    name: s.name,
    supplier_code: s.supplier_code,
    contact_name: s.contact_name,
  }))
  return { success: true, data: results }
}
