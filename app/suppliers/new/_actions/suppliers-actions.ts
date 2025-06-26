"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import * as z from "zod"

// Tedarikçi formu için Zod şeması (Geliştirilmiş Doğrulamalarla)
const supplierFormSchema = z.object({
  supplier_code: z.string().optional().nullable(),
  name: z.string().min(1, "Tedarikçi adı gereklidir."),
  contact_name: z.string().optional().nullable(),
  email: z.string().email("Geçersiz e-posta adresi.").optional().or(z.literal("")).nullable(),
  phone: z
    .string()
    .regex(
      /^(\+\d{1,3}[\s-]?)?(0?\d{3}[\s-]?\d{3}[\s-]?\d{4})$/,
      "Geçersiz telefon numarası. Örnekler: +90 555 123 4567, 05551234567, 5321234567 (boşluk/tire isteğe bağlı).",
    )
    .optional()
    .or(z.literal(""))
    .nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  tax_office: z.string().optional().nullable(),
  tax_number: z
    .string()
    .regex(/^\d{10}$/, "Vergi numarası 10 haneli bir sayı olmalıdır.")
    .optional()
    .or(z.literal(""))
    .nullable(),
  iban: z
    .string()
    .regex(/^TR\d{24}$/, "Geçersiz IBAN formatı. (Örn: TRXXXXXXXXXXXXXXXXXXXXXXXXXX şeklinde 26 karakter)")
    .optional()
    .or(z.literal(""))
    .nullable(),
  website: z.string().url("Geçersiz URL.").optional().or(z.literal("")).nullable(),
  notes: z.string().optional().nullable(),
})

type SupplierFormValues = z.infer<typeof supplierFormSchema>

// YENİ TEDARİKÇİ EKLEME EYLEMİ
export async function addSupplierAction(
  data: SupplierFormValues,
): Promise<{ success: boolean; error?: string | null; data?: any }> {
  const supabase = createClient()
  const validationResult = supplierFormSchema.safeParse(data)

  if (!validationResult.success) {
    console.error("Doğrulama hataları (addSupplierAction):", validationResult.error.flatten().fieldErrors)
    const fieldErrors = validationResult.error.flatten().fieldErrors
    const errorMessages = Object.values(fieldErrors)
      .map((errArray) => errArray?.join(", "))
      .join("; ")
    return {
      success: false,
      error: `Geçersiz veri: ${errorMessages || "Lütfen form alanlarını kontrol edin."}`,
    }
  }

  const { supplier_code, ...insertData } = validationResult.data

  // supplier_code benzersizliğini kontrol et (eğer girildiyse)
  if (supplier_code && supplier_code.trim() !== "") {
    const { data: existingCode, error: codeError } = await supabase
      .from("suppliers")
      .select("id")
      .eq("supplier_code", supplier_code.trim())
      .maybeSingle()

    if (codeError) {
      console.error("Tedarikçi kodu kontrol hatası:", codeError)
      return { success: false, error: "Tedarikçi kodu kontrol edilirken bir hata oluştu." }
    }
    if (existingCode) {
      return { success: false, error: `Tedarikçi kodu "${supplier_code.trim()}" zaten kullanılıyor.` }
    }
  }

  const dataToInsert =
    supplier_code && supplier_code.trim() !== "" ? { ...insertData, supplier_code: supplier_code.trim() } : insertData

  const { data: newSupplier, error } = await supabase.from("suppliers").insert([dataToInsert]).select().single()

  if (error) {
    console.error("Tedarikçi eklenirken hata:", error)
    if (error.code === "23505" && error.message.includes("suppliers_supplier_code_key") && supplier_code) {
      return { success: false, error: `Tedarikçi kodu "${supplier_code.trim()}" zaten mevcut.` }
    }
    return { success: false, error: error.message }
  }

  revalidatePath("/suppliers")
  if (newSupplier) {
    revalidatePath(`/suppliers/${newSupplier.id}`)
  }

  return { success: true, data: newSupplier }
}

// TEDARİKÇİ GÜNCELLEME EYLEMİ
export async function updateSupplierAction(
  supplierId: string,
  data: SupplierFormValues,
): Promise<{ success: boolean; error?: string | null; data?: any }> {
  const supabase = createClient()
  const validationResult = supplierFormSchema.safeParse(data)

  if (!validationResult.success) {
    console.error("Doğrulama hataları (updateSupplierAction):", validationResult.error.flatten().fieldErrors)
    const fieldErrors = validationResult.error.flatten().fieldErrors
    const errorMessages = Object.values(fieldErrors)
      .map((errArray) => errArray?.join(", "))
      .join("; ")
    return {
      success: false,
      error: `Geçersiz veri: ${errorMessages || "Lütfen form alanlarını kontrol edin."}`,
    }
  }

  const { supplier_code, ...updateData } = validationResult.data
  const dataToUpdate: Partial<SupplierFormValues> & { supplier_code?: string | null } = { ...updateData }

  // supplier_code'un undefined olup olmadığını kontrol et, boş string olabilir.
  if (supplier_code !== undefined) {
    const trimmedSupplierCode = supplier_code === null ? null : (supplier_code || "").trim()

    const { data: currentSupplier, error: fetchError } = await supabase
      .from("suppliers")
      .select("supplier_code")
      .eq("id", supplierId)
      .single()

    if (fetchError) {
      console.error("Mevcut tedarikçi kodu getirilirken hata:", fetchError)
      return { success: false, error: "Tedarikçi bilgileri getirilirken bir hata oluştu." }
    }

    if (trimmedSupplierCode !== (currentSupplier?.supplier_code || null)) {
      // Mevcut kodla karşılaştır
      if (trimmedSupplierCode && trimmedSupplierCode !== "") {
        // Yeni kod boş değilse benzersizlik kontrolü
        const { data: conflictingCode, error: codeError } = await supabase
          .from("suppliers")
          .select("id")
          .eq("supplier_code", trimmedSupplierCode)
          .not("id", "eq", supplierId) // Kendisi hariç
          .maybeSingle()

        if (codeError) {
          console.error("Tedarikçi kodu kontrol hatası:", codeError)
          return { success: false, error: "Tedarikçi kodu kontrol edilirken bir hata oluştu." }
        }
        if (conflictingCode) {
          return {
            success: false,
            error: `Tedarikçi kodu "${trimmedSupplierCode}" zaten başka bir tedarikçi tarafından kullanılıyor.`,
          }
        }
      }
    }
    // supplier_code'u güncelleme verisine ekle (boşsa null yap)
    dataToUpdate.supplier_code = trimmedSupplierCode === "" ? null : trimmedSupplierCode
  }

  const { data: updatedSupplier, error } = await supabase
    .from("suppliers")
    .update(dataToUpdate)
    .eq("id", supplierId)
    .select()
    .single()

  if (error) {
    console.error("Tedarikçi güncellenirken hata:", error)
    if (error.code === "23505" && error.message.includes("suppliers_supplier_code_key") && dataToUpdate.supplier_code) {
      return { success: false, error: `Tedarikçi kodu "${dataToUpdate.supplier_code}" zaten mevcut.` }
    }
    return { success: false, error: error.message }
  }

  revalidatePath("/suppliers")
  revalidatePath(`/suppliers/${supplierId}`)
  revalidatePath(`/suppliers/${supplierId}/edit`)

  return { success: true, data: updatedSupplier }
}

// TEDARİKÇİ ARŞİVLEME (SOFT DELETE) EYLEMİ
export async function deleteSupplierAction(supplierId: string): Promise<{ success: boolean; error?: string | null }> {
  if (!supplierId) {
    return { success: false, error: "Tedarikçi ID'si gereklidir." }
  }

  const supabase = createClient()

  const { error } = await supabase
    .from("suppliers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", supplierId)
    .is("deleted_at", null) // Sadece aktif olanları arşivle

  if (error) {
    console.error("Tedarikçi arşivlenirken hata:", error)
    return { success: false, error: `Tedarikçi arşivlenemedi: ${error.message}` }
  }

  revalidatePath("/suppliers")
  revalidatePath(`/suppliers/${supplierId}`)
  revalidatePath("/suppliers?filter=archived") // Arşivlenmiş listesini de yenilemek için

  return { success: true }
}

// TEDARİKÇİ GERİ YÜKLEME EYLEMİ
export async function restoreSupplierAction(supplierId: string): Promise<{ success: boolean; error?: string | null }> {
  if (!supplierId) {
    return { success: false, error: "Tedarikçi ID'si gereklidir." }
  }
  const supabase = createClient()

  const { error } = await supabase
    .from("suppliers")
    .update({ deleted_at: null })
    .eq("id", supplierId)
    .not("deleted_at", "is", null) // Sadece zaten arşivlenmiş olanları geri yükle

  if (error) {
    console.error("Tedarikçi geri yüklenirken hata:", error)
    return { success: false, error: `Tedarikçi geri yüklenemedi: ${error.message}` }
  }

  revalidatePath("/suppliers")
  revalidatePath(`/suppliers/${supplierId}`)
  revalidatePath("/suppliers?filter=active") // Aktif listesini de yenilemek için
  revalidatePath("/suppliers?filter=archived")

  return { success: true }
}
