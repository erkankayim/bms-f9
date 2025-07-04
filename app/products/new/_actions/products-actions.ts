"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Sabit kategoriler
const CATEGORIES = [
  "Elektronik",
  "Bilgisayar & Teknoloji",
  "Telefon & Aksesuar",
  "Ev & Yaşam",
  "Mutfak Gereçleri",
  "Mobilya",
  "Giyim & Aksesuar",
  "Ayakkabı & Çanta",
  "Kozmetik & Kişisel Bakım",
  "Spor & Outdoor",
  "Otomotiv",
  "Bahçe & Yapı Market",
  "Kitap & Kırtasiye",
  "Oyuncak & Hobi",
  "Sağlık & Medikal",
  "Gıda & İçecek",
  "Pet Shop",
  "Bebek & Çocuk",
  "Takı & Saat",
  "Diğer",
]

interface CreateProductData {
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

export async function createProduct(data: CreateProductData) {
  try {
    const supabase = await createClient()

    // Check if stock code already exists
    const { data: existingProduct } = await supabase
      .from("products")
      .select("stock_code")
      .eq("stock_code", data.stock_code)
      .single()

    if (existingProduct) {
      return {
        success: false,
        error: "Bu stok kodu zaten kullanılıyor",
      }
    }

    // Insert the product
    const { data: product, error } = await supabase
      .from("products")
      .insert({
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Product creation error:", error)
      return {
        success: false,
        error: "Ürün eklenirken hata oluştu",
      }
    }

    revalidatePath("/products")
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

export async function addProductAction(formData: FormData) {
  try {
    const supabase = createClient()

    // Form verilerini al
    const stock_code = formData.get("stock_code") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const quantity_on_hand = Number.parseFloat(formData.get("quantity_on_hand") as string) || 0
    const purchase_price = formData.get("purchase_price")
      ? Number.parseFloat(formData.get("purchase_price") as string)
      : null
    const purchase_price_currency = formData.get("purchase_price_currency") as string
    const sale_price = formData.get("sale_price") ? Number.parseFloat(formData.get("sale_price") as string) : null
    const sale_price_currency = formData.get("sale_price_currency") as string
    const vat_rate = Number.parseFloat(formData.get("vat_rate") as string) || 0.18
    const barcode = formData.get("barcode") as string
    const tags = formData.get("tags") as string
    const category_id = formData.get("category_id") ? Number.parseInt(formData.get("category_id") as string) : null
    const variants = formData.get("variants") ? JSON.parse(formData.get("variants") as string) : null

    // Kategori adını al
    const category_name = category_id !== null ? CATEGORIES[category_id] : null

    // Stok kodu kontrolü
    const { data: existingProduct } = await supabase
      .from("products")
      .select("stock_code")
      .eq("stock_code", stock_code)
      .single()

    if (existingProduct) {
      return { success: false, error: "Bu stok kodu zaten kullanılıyor" }
    }

    // Resimleri yükle
    const images = formData.getAll("images") as File[]
    const image_urls: { url: string }[] = []

    if (images.length > 0) {
      for (const image of images) {
        if (image.size > 0) {
          const fileExt = image.name.split(".").pop()
          const fileName = `${stock_code}_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
          const filePath = `products/${fileName}`

          const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, image)

          if (uploadError) {
            console.error("Image upload error:", uploadError)
            continue
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from("product-images").getPublicUrl(filePath)

          image_urls.push({ url: publicUrl })
        }
      }
    }

    // Ürünü veritabanına ekle
    const { error } = await supabase.from("products").insert({
      stock_code,
      name,
      description: description || null,
      quantity_on_hand,
      purchase_price,
      purchase_price_currency,
      sale_price,
      sale_price_currency,
      vat_rate,
      barcode: barcode || null,
      tags: tags || null,
      category_id,
      category_name,
      image_urls: image_urls.length > 0 ? image_urls : null,
      variants,
    })

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: `Ürün eklenirken hata oluştu: ${error.message}` }
    }

    revalidatePath("/products")
    return { success: true }
  } catch (error) {
    console.error("Add product error:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function updateProductAction(productId: string, formData: FormData) {
  try {
    const supabase = createClient()

    // Form verilerini al
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const quantity_on_hand = Number.parseFloat(formData.get("quantity_on_hand") as string) || 0
    const purchase_price = formData.get("purchase_price")
      ? Number.parseFloat(formData.get("purchase_price") as string)
      : null
    const purchase_price_currency = formData.get("purchase_price_currency") as string
    const sale_price = formData.get("sale_price") ? Number.parseFloat(formData.get("sale_price") as string) : null
    const sale_price_currency = formData.get("sale_price_currency") as string
    const vat_rate = Number.parseFloat(formData.get("vat_rate") as string) || 0.18
    const barcode = formData.get("barcode") as string
    const tags = formData.get("tags") as string
    const category_id = formData.get("category_id") ? Number.parseInt(formData.get("category_id") as string) : null
    const variants = formData.get("variants") ? JSON.parse(formData.get("variants") as string) : null
    const existing_images = formData.get("existing_images") ? JSON.parse(formData.get("existing_images") as string) : []

    // Kategori adını al
    const category_name = category_id !== null ? CATEGORIES[category_id] : null

    // Yeni resimleri yükle
    const images = formData.getAll("images") as File[]
    const new_image_urls: { url: string }[] = []

    if (images.length > 0) {
      for (const image of images) {
        if (image.size > 0) {
          const fileExt = image.name.split(".").pop()
          const fileName = `${productId}_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
          const filePath = `products/${fileName}`

          const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, image)

          if (uploadError) {
            console.error("Image upload error:", uploadError)
            continue
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from("product-images").getPublicUrl(filePath)

          new_image_urls.push({ url: publicUrl })
        }
      }
    }

    // Tüm resimleri birleştir
    const all_images = [...existing_images, ...new_image_urls]

    // Ürünü güncelle
    const { error } = await supabase
      .from("products")
      .update({
        name,
        description: description || null,
        quantity_on_hand,
        purchase_price,
        purchase_price_currency,
        sale_price,
        sale_price_currency,
        vat_rate,
        barcode: barcode || null,
        tags: tags || null,
        category_id,
        category_name,
        image_urls: all_images.length > 0 ? all_images : null,
        variants,
        updated_at: new Date().toISOString(),
      })
      .eq("stock_code", productId)

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: `Ürün güncellenirken hata oluştu: ${error.message}` }
    }

    revalidatePath("/products")
    revalidatePath(`/products/${productId}`)
    return { success: true }
  } catch (error) {
    console.error("Update product error:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}
