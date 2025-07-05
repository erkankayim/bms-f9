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
})

export type StockAdjustmentFormState = {
  success: boolean
  message: string
  errors?: {
    productStockCode?: string[]
    changeQuantity?: string[]
    notes?: string[]
    general?: string[]
  }
}

export type ProductSearchResult = {
  id: string
  name: string
  stock_code: string
  current_stock: number
}

export async function adjustStockQuantityAction(
  prevState: StockAdjustmentFormState,
  formData: FormData,
): Promise<StockAdjustmentFormState> {
  const cookieStore = cookies()
  // Simplified cookie logging for brevity
  // console.log("[SERVER ACTION adjustStockQuantityAction] Cookies received:", cookieStore.getAll().map(c => c.name));

  const supabase = createClient()
  // console.log("[SERVER ACTION adjustStockQuantityAction] Attempting to get user...")

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user || !user.email) {
    // Ensure user.email is available
    console.error("[SERVER ACTION adjustStockQuantityAction] Auth Error, no user, or no email:", authError, user)
    return {
      success: false,
      message: "Kullanıcı yetkilendirmesi başarısız veya e-posta bilgisi eksik.",
      errors: { general: ["Lütfen giriş yapın ve tekrar deneyin."] },
    }
  }
  // console.log("[SERVER ACTION adjustStockQuantityAction] User authenticated:", user.id, user.email)

  const userId = user.id
  const userEmail = user.email // Get user email

  const validatedFields = stockAdjustmentSchema.safeParse({
    productStockCode: formData.get("productId"),
    changeQuantity: formData.get("quantity") ? Number(formData.get("quantity")) : undefined,
    notes: formData.get("notes"),
  })

  if (!validatedFields.success) {
    console.error("Validation Errors in adjustStockQuantityAction:", validatedFields.error.flatten().fieldErrors)
    return {
      success: false,
      message: "Form verileri geçersiz.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { productStockCode, changeQuantity, notes } = validatedFields.data
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

    // Düşük stok uyarısını kontrol et ve yönet
    if (product.stock_code) {
      // Ensure product.stock_code is available
      const { data: productDetailsForAlert, error: productDetailsError } = await supabase
        .from("products")
        .select("min_stock_level")
        .eq("stock_code", product.stock_code)
        .single()

      if (productDetailsError) {
        console.warn(
          `[adjustStockQuantityAction] Minimum stok seviyesi alınamadı (${product.stock_code}): ${productDetailsError.message}`,
        )
        // Uyarı oluşturma adımını atla ama işleme devam et
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
          // Bu bir uyarı, ana işlem başarısız olmamalı
        } else if (alertResult.alertCreated) {
          console.log(`[adjustStockQuantityAction] Düşük stok uyarısı oluşturuldu: ${product.stock_code}`)
          revalidatePath("/inventory/alerts") // Uyarılar sayfasını yenile (varsayımsal)
        } else if (alertResult.alertResolved) {
          console.log(`[adjustStockQuantityAction] Düşük stok uyarısı çözüldü: ${product.stock_code}`)
          revalidatePath("/inventory/alerts") // Uyarılar sayfasını yenile
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
      user_email: userEmail, // Add user_email here
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
  // console.log("[SERVER ACTION searchProductsForAdjustment] called with searchTerm:", searchTerm)
  if (!searchTerm.trim() || searchTerm.length < 2) {
    return { success: true, data: [] }
  }
  const supabase = createClient()

  const { data, error } = await supabase
    .from("products")
    .select("name, stock_code, quantity_on_hand")
    .or(`name.ilike.%${searchTerm}%,stock_code.ilike.%${searchTerm}%`)
    .is("deleted_at", null)
    .limit(10)

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
