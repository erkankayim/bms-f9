"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import * as z from "zod"

const currencySchema = z.enum(["TRY", "USD", "EUR", "GBP"])

const variantValueSchema = z.object({
  value: z.string().min(1, "Varyant değeri boş olamaz"),
})

const variantSchema = z.object({
  type: z.string().min(1, "Varyant tipi boş olamaz"),
  values: z.array(variantValueSchema).min(1, "En az bir varyant değeri gereklidir"),
})

const productActionSchema = z.object({
  stock_code: z.string().min(1),
  name: z.string().min(1, "Ürün adı gereklidir"),
  description: z.string().optional().nullable(),
  quantity_on_hand: z.coerce.number().int().min(0).optional().default(0),
  min_stock_level: z.coerce.number().int().min(0, "Minimum stok seviyesi negatif olamaz").optional().default(0), // YENİ ALAN
  purchase_price: z.coerce.number().min(0).optional().nullable(),
  purchase_price_currency: currencySchema.default("TRY"),
  sale_price: z.coerce.number().min(0).optional().nullable(),
  sale_price_currency: currencySchema.default("TRY"),
  vat_rate: z.coerce.number().min(0).max(1).optional().default(0.18),
  barcode: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  image_urls: z
    .array(z.object({ url: z.string().url("Geçerli bir resim URL'si olmalıdır") }))
    .optional()
    .nullable(),
  variants: z.array(variantSchema).optional().nullable(),
  imagesToDelete: z.array(z.string().url()).optional().nullable(),
  category_id: z.coerce.number().int().positive("Kategori ID'si pozitif bir sayı olmalıdır.").optional().nullable(),
})

type ProductActionPayload = z.infer<typeof productActionSchema>

export async function addProductAction(
  payload: ProductActionPayload,
): Promise<{ success: boolean; error?: string | null; data?: any }> {
  const supabase = createClient()

  const validationResult = productActionSchema.safeParse(payload)
  if (!validationResult.success) {
    console.error("Eylemdeki doğrulama hataları (addProductAction):", validationResult.error.flatten().fieldErrors)
    const errors = validationResult.error.flatten().fieldErrors
    let errorMessage = "Geçersiz veri: "
    for (const key in errors) {
      // @ts-ignore
      errorMessage += `${key}: ${errors[key].join(", ")}. `
    }
    return {
      success: false,
      error: errorMessage.trim(),
    }
  }

  const { data: validatedData } = validationResult

  const { data: existingStockCode, error: stockCodeError } = await supabase
    .from("products")
    .select("stock_code")
    .eq("stock_code", validatedData.stock_code)
    .maybeSingle()

  if (stockCodeError) {
    console.error("Stok kodu kontrol hatası:", stockCodeError)
    return { success: false, error: "Stok kodu kontrol edilirken bir hata oluştu." }
  }
  if (existingStockCode) {
    return { success: false, error: `Stok kodu "${validatedData.stock_code}" zaten kullanılıyor.` }
  }

  if (validatedData.barcode && validatedData.barcode.trim() !== "") {
    const { data: existingBarcode, error: barcodeError } = await supabase
      .from("products")
      .select("barcode")
      .eq("barcode", validatedData.barcode)
      .maybeSingle()

    if (barcodeError) {
      console.error("Barkod kontrol hatası:", barcodeError)
      return { success: false, error: "Barkod kontrol edilirken bir hata oluştu." }
    }
    if (existingBarcode) {
      return {
        success: false,
        error: `Barkod "${validatedData.barcode}" zaten başka bir ürün tarafından kullanılıyor.`,
      }
    }
  }

  const { data: newProduct, error } = await supabase
    .from("products")
    .insert([
      {
        stock_code: validatedData.stock_code,
        name: validatedData.name,
        description: validatedData.description,
        quantity_on_hand: validatedData.quantity_on_hand,
        min_stock_level: validatedData.min_stock_level, // YENİ ALAN
        purchase_price: validatedData.purchase_price,
        purchase_price_currency: validatedData.purchase_price_currency,
        sale_price: validatedData.sale_price,
        sale_price_currency: validatedData.sale_price_currency,
        vat_rate: validatedData.vat_rate,
        barcode: validatedData.barcode,
        tags: validatedData.tags,
        image_urls: validatedData.image_urls,
        variants: validatedData.variants,
        category_id: validatedData.category_id,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Ürün eklenirken hata:", error)
    if (error.code === "23505") {
      return { success: false, error: `"${validatedData.stock_code}" stok kodlu ürün zaten mevcut.` }
    }
    return { success: false, error: error.message }
  }

  revalidatePath("/products")
  revalidatePath(`/products/${validatedData.stock_code}`)

  return { success: true, data: newProduct }
}

export async function updateProductAction(
  productId: string, // This is actually stock_code
  payload: ProductActionPayload,
): Promise<{ success: boolean; error?: string | null; data?: any }> {
  const supabase = createClient()

  const validationResult = productActionSchema.safeParse(payload)
  if (!validationResult.success) {
    console.error("Eylemdeki doğrulama hataları (updateProductAction):", validationResult.error.flatten().fieldErrors)
    const errors = validationResult.error.flatten().fieldErrors
    let errorMessage = "Geçersiz veri: "
    for (const key in errors) {
      // @ts-ignore
      errorMessage += `${key}: ${errors[key].join(", ")}. `
    }
    return {
      success: false,
      error: errorMessage.trim(),
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { stock_code, imagesToDelete, ...updateDataFromPayload } = validationResult.data

  // Ensure min_stock_level is included in the update data
  const updateData = {
    ...updateDataFromPayload,
    min_stock_level: validationResult.data.min_stock_level, // YENİ ALAN
  }

  if (payload.barcode && payload.barcode.trim() !== "") {
    const { data: productWithSameBarcode, error: barcodeError } = await supabase
      .from("products")
      .select("stock_code, barcode")
      .eq("barcode", payload.barcode)
      .not("stock_code", "eq", productId) // productId is stock_code
      .maybeSingle()

    if (barcodeError) {
      console.error("Güncelleme sırasında barkod kontrol hatası:", barcodeError)
      return { success: false, error: "Barkod kontrol edilirken bir hata oluştu." }
    }
    if (productWithSameBarcode) {
      return {
        success: false,
        error: `Barkod "${payload.barcode}" zaten başka bir ürün (${productWithSameBarcode.stock_code}) tarafından kullanılıyor.`,
      }
    }
  }

  if (imagesToDelete && imagesToDelete.length > 0) {
    const filePathsToDelete: string[] = []
    for (const imageUrl of imagesToDelete) {
      try {
        const urlParts = imageUrl.split("/")
        const fileName = urlParts.pop()
        const bucketNameGuess = urlParts.pop()

        if (fileName && bucketNameGuess === "product_images") {
          filePathsToDelete.push(fileName)
        } else {
          console.warn(`Geçersiz resim URL formatı, silinemedi: ${imageUrl}`)
        }
      } catch (e) {
        console.error(`Resim URL'si ayrıştırılırken hata: ${imageUrl}`, e)
      }
    }

    if (filePathsToDelete.length > 0) {
      const { error: storageError } = await supabase.storage.from("product_images").remove(filePathsToDelete)
      if (storageError) {
        console.error("Supabase Storage'dan resimler silinirken hata:", storageError)
      } else {
        console.log("Şu resimler Supabase Storage'dan silindi:", filePathsToDelete)
      }
    }
  }

  const { data: updatedProduct, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("stock_code", productId) // productId is stock_code
    .select()
    .single()

  if (error) {
    console.error("Ürün güncellenirken hata:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/products")
  revalidatePath(`/products/${productId}`) // productId is stock_code
  revalidatePath(`/products/${productId}/edit`) // productId is stock_code

  return { success: true, data: updatedProduct }
}

export async function deleteProductAction(productId: string): Promise<{ success: boolean; error?: string | null }> {
  if (!productId) {
    return { success: false, error: "Ürün ID'si (stok kodu) gereklidir." }
  }
  const supabase = createClient()
  const { error: softDeleteError } = await supabase
    .from("products")
    .update({ deleted_at: new Date().toISOString() })
    .eq("stock_code", productId)
    .is("deleted_at", null)

  if (softDeleteError) {
    console.error("Ürün geçici silinirken hata:", softDeleteError)
    return { success: false, error: `Ürün geçici olarak silinemedi: ${softDeleteError.message}` }
  }
  revalidatePath("/products")
  revalidatePath(`/products/${productId}`)
  return { success: true }
}

export async function restoreProductAction(productId: string): Promise<{ success: boolean; error?: string | null }> {
  if (!productId) {
    return { success: false, error: "Ürün ID'si (stok kodu) gereklidir." }
  }
  const supabase = createClient()
  const { error } = await supabase.from("products").update({ deleted_at: null }).eq("stock_code", productId)

  if (error) {
    console.error("Ürün geri yüklenirken hata:", error)
    return { success: false, error: `Ürün geri yüklenemedi: ${error.message}` }
  }
  revalidatePath("/products")
  revalidatePath(`/products/${productId}`)
  return { success: true }
}
