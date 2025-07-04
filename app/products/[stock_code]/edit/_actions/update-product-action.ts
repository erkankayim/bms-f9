"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface UpdateProductData {
  stock_code: string
  name: string
  description: string
  category_name: string
  purchase_price: number
  purchase_price_currency: string
  sale_price: number
  sale_price_currency: string
  stock_quantity: number
  min_stock_level: number
  supplier_id: string | null
  variants: Array<{
    id: string
    name: string
    values: string[]
  }>
  image_urls: string[]
}

export async function updateProduct(productId: number, data: UpdateProductData) {
  try {
    const supabase = await createClient()

    // Check if stock code already exists for other products
    const { data: existingProduct } = await supabase
      .from("products")
      .select("id, stock_code")
      .eq("stock_code", data.stock_code)
      .neq("id", productId)
      .single()

    if (existingProduct) {
      return {
        success: false,
        error: "Bu stok kodu başka bir ürün tarafından kullanılıyor",
      }
    }

    // Update the product
    const { data: product, error } = await supabase
      .from("products")
      .update({
        stock_code: data.stock_code,
        name: data.name,
        description: data.description,
        category_name: data.category_name,
        purchase_price: data.purchase_price,
        purchase_price_currency: data.purchase_price_currency,
        sale_price: data.sale_price,
        sale_price_currency: data.sale_price_currency,
        stock_quantity: data.stock_quantity,
        min_stock_level: data.min_stock_level,
        supplier_id: data.supplier_id ? Number.parseInt(data.supplier_id) : null,
        variants: data.variants,
        image_urls: data.image_urls,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select()
      .single()

    if (error) {
      console.error("Product update error:", error)
      return {
        success: false,
        error: "Ürün güncellenirken hata oluştu",
      }
    }

    revalidatePath("/products")
    revalidatePath(`/products/${data.stock_code}`)
    return {
      success: true,
      data: product,
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      success: false,
      error: "Beklenmeyen bir hata oluştu",
    }
  }
}
