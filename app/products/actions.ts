"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  const productData = {
    stock_code: formData.get("stock_code") as string,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    category_id: Number.parseInt(formData.get("category_id") as string),
    quantity_on_hand: Number.parseFloat(formData.get("quantity_on_hand") as string) || 0,
    minimum_stock_level: Number.parseFloat(formData.get("minimum_stock_level") as string) || 0,
    purchase_price: Number.parseFloat(formData.get("purchase_price") as string),
    selling_price: Number.parseFloat(formData.get("selling_price") as string) || 0,
  }

  const { error } = await supabase.from("products").insert([productData])

  if (error) {
    throw new Error(`Ürün oluşturulurken hata: ${error.message}`)
  }

  revalidatePath("/products")
}

export async function updateProduct(id: number, formData: FormData) {
  const supabase = await createClient()

  const productData = {
    stock_code: formData.get("stock_code") as string,
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    category_id: Number.parseInt(formData.get("category_id") as string),
    quantity_on_hand: Number.parseFloat(formData.get("quantity_on_hand") as string) || 0,
    minimum_stock_level: Number.parseFloat(formData.get("minimum_stock_level") as string) || 0,
    purchase_price: Number.parseFloat(formData.get("purchase_price") as string),
    selling_price: Number.parseFloat(formData.get("selling_price") as string) || 0,
  }

  const { error } = await supabase.from("products").update(productData).eq("id", id)

  if (error) {
    throw new Error(`Ürün güncellenirken hata: ${error.message}`)
  }

  revalidatePath("/products")
}

export async function deleteProduct(id: number) {
  const supabase = await createClient()

  const { error } = await supabase.from("products").delete().eq("id", id)

  if (error) {
    throw new Error(`Ürün silinirken hata: ${error.message}`)
  }

  revalidatePath("/products")
}

export async function getProducts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Ürünler getirilirken hata: ${error.message}`)
  }

  return data
}

export async function getProduct(id: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    throw new Error(`Ürün getirilirken hata: ${error.message}`)
  }

  return data
}

export async function getCategories() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    throw new Error(`Kategoriler getirilirken hata: ${error.message}`)
  }

  return data
}

export async function updateProductStock(productId: number, newQuantity: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("products")
    .update({
      quantity_on_hand: newQuantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)

  if (error) {
    throw new Error(`Stok güncellenirken hata: ${error.message}`)
  }

  revalidatePath("/products")
}
