"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createProduct(formData: FormData) {
  const supabase = getSupabaseServerClient()

  const productData = {
    stock_code: formData.get("stock_code") as string,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    category_id: formData.get("category_id") ? Number.parseInt(formData.get("category_id") as string) : null,
    quantity_on_hand: formData.get("quantity_on_hand")
      ? Number.parseFloat(formData.get("quantity_on_hand") as string)
      : 0,
    minimum_stock_level: formData.get("minimum_stock_level")
      ? Number.parseFloat(formData.get("minimum_stock_level") as string)
      : 0,
    purchase_price: formData.get("purchase_price") ? Number.parseFloat(formData.get("purchase_price") as string) : 0,
    selling_price: formData.get("selling_price") ? Number.parseFloat(formData.get("selling_price") as string) : 0,
  }

  // Stok kodu benzersizlik kontrolü
  const { data: existingProduct } = await supabase
    .from("products")
    .select("stock_code")
    .eq("stock_code", productData.stock_code)
    .is("deleted_at", null)
    .single()

  if (existingProduct) {
    return {
      success: false,
      error: "Bu stok kodu zaten kullanılmaktadır. Lütfen farklı bir stok kodu seçin.",
    }
  }

  const { error } = await supabase.from("products").insert([productData])

  if (error) {
    console.error("Error creating product:", error)
    return {
      success: false,
      error: "Ürün oluşturulurken bir hata oluştu.",
    }
  }

  revalidatePath("/products")
  return { success: true }
}

export async function updateProduct(id: number, formData: FormData) {
  const supabase = getSupabaseServerClient()

  const productData = {
    stock_code: formData.get("stock_code") as string,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    category_id: formData.get("category_id") ? Number.parseInt(formData.get("category_id") as string) : null,
    quantity_on_hand: formData.get("quantity_on_hand")
      ? Number.parseFloat(formData.get("quantity_on_hand") as string)
      : 0,
    minimum_stock_level: formData.get("minimum_stock_level")
      ? Number.parseFloat(formData.get("minimum_stock_level") as string)
      : 0,
    purchase_price: formData.get("purchase_price") ? Number.parseFloat(formData.get("purchase_price") as string) : 0,
    selling_price: formData.get("selling_price") ? Number.parseFloat(formData.get("selling_price") as string) : 0,
    updated_at: new Date().toISOString(),
  }

  // Stok kodu benzersizlik kontrolü (mevcut ürün hariç)
  const { data: existingProduct } = await supabase
    .from("products")
    .select("id, stock_code")
    .eq("stock_code", productData.stock_code)
    .neq("id", id)
    .is("deleted_at", null)
    .single()

  if (existingProduct) {
    return {
      success: false,
      error: "Bu stok kodu başka bir ürün tarafından kullanılmaktadır.",
    }
  }

  const { error } = await supabase.from("products").update(productData).eq("id", id)

  if (error) {
    console.error("Error updating product:", error)
    return {
      success: false,
      error: "Ürün güncellenirken bir hata oluştu.",
    }
  }

  revalidatePath("/products")
  revalidatePath(`/products/${id}`)
  return { success: true }
}

export async function deleteProduct(id: number) {
  const supabase = getSupabaseServerClient()

  const { error } = await supabase.from("products").update({ deleted_at: new Date().toISOString() }).eq("id", id)

  if (error) {
    console.error("Error deleting product:", error)
    return {
      success: false,
      error: "Ürün silinirken bir hata oluştu.",
    }
  }

  revalidatePath("/products")
  return { success: true }
}
