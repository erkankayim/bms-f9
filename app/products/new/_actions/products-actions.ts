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
  const supabase = createClient()

  try {
    // Extract form data
    const productData = {
      stock_code: formData.get("stock_code") as string,
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      category_name: formData.get("category_name") as string,
      purchase_price: Number.parseFloat(formData.get("purchase_price") as string) || 0,
      purchase_price_currency: (formData.get("purchase_price_currency") as string) || "TRY",
      sale_price: Number.parseFloat(formData.get("sale_price") as string) || 0,
      sale_price_currency: (formData.get("sale_price_currency") as string) || "TRY",
      stock_quantity: Number.parseInt(formData.get("stock_quantity") as string) || 0,
      min_stock_level: Number.parseInt(formData.get("min_stock_level") as string) || 5,
      vat_rate: Number.parseFloat(formData.get("vat_rate") as string) || 0.18,
      barcode: (formData.get("barcode") as string) || null,
      tags: (formData.get("tags") as string) || null,
      supplier_id: (formData.get("supplier_id") as string) || null,
    }

    // Handle variants
    const variantsString = formData.get("variants") as string
    let variants = null
    if (variantsString) {
      try {
        variants = JSON.parse(variantsString)
      } catch (error) {
        console.error("Error parsing variants:", error)
      }
    }

    // Handle image uploads
    const imageUrls: { url: string }[] = []
    const imageFiles: File[] = []

    // Collect image files
    for (let i = 0; i < 5; i++) {
      const imageFile = formData.get(`image_${i}`) as File
      if (imageFile && imageFile.size > 0) {
        imageFiles.push(imageFile)
      }
    }

    // Upload images to Supabase Storage
    for (const imageFile of imageFiles) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${imageFile.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile)

      if (uploadError) {
        console.error("Image upload error:", uploadError)
        continue
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(fileName)

      imageUrls.push({ url: publicUrl })
    }

    // Insert product
    const { data: product, error } = await supabase
      .from("products")
      .insert([
        {
          ...productData,
          image_urls: imageUrls.length > 0 ? imageUrls : null,
          variants: variants,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: `Ürün oluşturulurken hata: ${error.message}` }
    }

    revalidatePath("/products")
    return { success: true, data: product }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function updateProductAction(productId: string, formData: FormData) {
  const supabase = createClient()

  try {
    // Extract form data
    const productData = {
      stock_code: formData.get("stock_code") as string,
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      category_name: formData.get("category_name") as string,
      purchase_price: Number.parseFloat(formData.get("purchase_price") as string) || 0,
      purchase_price_currency: (formData.get("purchase_price_currency") as string) || "TRY",
      sale_price: Number.parseFloat(formData.get("sale_price") as string) || 0,
      sale_price_currency: (formData.get("sale_price_currency") as string) || "TRY",
      stock_quantity: Number.parseInt(formData.get("stock_quantity") as string) || 0,
      min_stock_level: Number.parseInt(formData.get("min_stock_level") as string) || 5,
      vat_rate: Number.parseFloat(formData.get("vat_rate") as string) || 0.18,
      barcode: (formData.get("barcode") as string) || null,
      tags: (formData.get("tags") as string) || null,
      supplier_id: (formData.get("supplier_id") as string) || null,
    }

    // Handle variants
    const variantsString = formData.get("variants") as string
    let variants = null
    if (variantsString) {
      try {
        variants = JSON.parse(variantsString)
      } catch (error) {
        console.error("Error parsing variants:", error)
      }
    }

    // Get existing product to preserve existing images
    const { data: existingProduct } = await supabase
      .from("products")
      .select("image_urls")
      .eq("stock_code", productId)
      .single()

    const imageUrls = existingProduct?.image_urls || []

    // Handle new image uploads
    const imageFiles: File[] = []

    // Collect new image files
    for (let i = 0; i < 5; i++) {
      const imageFile = formData.get(`image_${i}`) as File
      if (imageFile && imageFile.size > 0) {
        imageFiles.push(imageFile)
      }
    }

    // Upload new images to Supabase Storage
    for (const imageFile of imageFiles) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${imageFile.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile)

      if (uploadError) {
        console.error("Image upload error:", uploadError)
        continue
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(fileName)

      imageUrls.push({ url: publicUrl })
    }

    // Update product
    const { data: product, error } = await supabase
      .from("products")
      .update({
        ...productData,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        variants: variants,
        updated_at: new Date().toISOString(),
      })
      .eq("stock_code", productId)
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: `Ürün güncellenirken hata: ${error.message}` }
    }

    revalidatePath("/products")
    revalidatePath(`/products/${productId}`)
    return { success: true, data: product }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function deleteProductAction(productId: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString() })
      .eq("stock_code", productId)

    if (error) {
      console.error("Delete error:", error)
      return { success: false, error: `Ürün silinirken hata: ${error.message}` }
    }

    revalidatePath("/products")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function restoreProductAction(productId: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("products").update({ deleted_at: null }).eq("stock_code", productId)

    if (error) {
      console.error("Restore error:", error)
      return { success: false, error: `Ürün geri yüklenirken hata: ${error.message}` }
    }

    revalidatePath("/products")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}
