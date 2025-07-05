"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

// Zod şemaları
const invoiceSchema = z.object({
  invoice_number: z.string().min(1, "Fatura numarası zorunludur"),
  invoice_type: z.enum(["incoming", "outgoing"], {
    required_error: "Fatura türü seçimi zorunludur",
  }),
  document_type: z.enum(["invoice", "receipt", "credit_note", "debit_note", "proforma", "other"]).default("invoice"),
  document_number: z.string().optional(),
  issue_date: z.string().min(1, "Düzenleme tarihi zorunludur"),
  due_date: z.string().optional(),
  customer_id: z.string().nullable().optional(), // null veya undefined kabul edilir
  supplier_id: z.string().nullable().optional(), // null veya undefined kabul edilir
  total_amount: z.coerce.number().min(0, "Toplam tutar 0 veya daha büyük olmalıdır"),
  tax_amount: z.coerce.number().min(0, "Vergi tutarı 0 veya daha büyük olmalıdır").default(0),
  discount_amount: z.coerce.number().min(0, "İndirim tutarı 0 veya daha büyük olmalıdır").default(0),
  notes: z.string().optional(),
})

const invoiceItemSchema = z.object({
  description: z.string().min(1, "Açıklama zorunludur"),
  quantity: z.number().min(0.01, "Miktar 0'dan büyük olmalıdır"),
  unit_price: z.number().min(0, "Birim fiyat 0 veya daha büyük olmalıdır"),
  tax_rate: z.number().min(0).max(100, "Vergi oranı 0-100 arasında olmalıdır").default(0),
  discount_rate: z.number().min(0).max(100, "İndirim oranı 0-100 arasında olmalıdır").default(0),
  product_id: z.string().optional(),
})

const paymentSchema = z.object({
  invoice_id: z.number(),
  payment_date: z.string().min(1, "Ödeme tarihi zorunludur"),
  amount: z.number().min(0.01, "Ödeme tutarı 0'dan büyük olmalıdır"),
  payment_method: z.string().min(1, "Ödeme şekli zorunludur"),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
})

// Müşterileri getir
export async function getCustomersForInvoice() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("customers")
    .select("mid, service_name, contact_name")
    .is("deleted_at", null)
    .order("service_name")

  if (error) {
    console.error("Error fetching customers:", error)
    return []
  }

  return data || []
}

// Tedarikçileri getir
export async function getSuppliersForInvoice() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("suppliers").select("id, name, contact_name").order("name")

  if (error) {
    console.error("Error fetching suppliers:", error)
    return []
  }

  return data || []
}

// Ürünleri getir
export async function getProductsForInvoice() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("products").select("stock_code, name, selling_price").order("name")

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data || []
}

// Fatura oluştur
export async function createInvoice(formData: FormData) {
  const supabase = await createClient()

  // Form verilerini logla
  console.log("FormData:", Object.fromEntries(formData))

  // Form verilerini parse et
  const rawData = {
    invoice_number: formData.get("invoice_number")?.toString() || "",
    invoice_type: formData.get("invoice_type")?.toString() as "incoming" | "outgoing" | undefined,
    document_type: formData.get("document_type")?.toString() || "invoice",
    document_number: formData.get("document_number")?.toString(),
    issue_date: formData.get("issue_date")?.toString() || "",
    due_date: formData.get("due_date")?.toString(),
    customer_id: formData.get("customer_id")?.toString(),
    supplier_id: formData.get("supplier_id")?.toString(),
    total_amount: formData.get("total_amount"),
    tax_amount: formData.get("tax_amount"),
    discount_amount: formData.get("discount_amount"),
    notes: formData.get("notes")?.toString(),
  }

  // Validasyon
  const validatedFields = invoiceSchema.safeParse(rawData)

  if (!validatedFields.success) {
    console.log("Validation errors:", validatedFields.error.flatten().fieldErrors)
    return {
      error: "Geçersiz form verileri",
      details: validatedFields.error.flatten().fieldErrors,
    }
  }

  const validatedData = validatedFields.data

  // Fatura türüne göre müşteri/tedarikçi kontrolü
  if (validatedData.invoice_type === "outgoing" && !validatedData.customer_id) {
    return { error: "Giden fatura için müşteri seçimi gereklidir" }
  }
  if (validatedData.invoice_type === "incoming" && !validatedData.supplier_id) {
    return { error: "Gelen fatura için tedarikçi seçimi gereklidir" }
  }

  // Faturayı veritabanına ekle
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      ...validatedData,
      customer_id: validatedData.customer_id || null,
      supplier_id: validatedData.supplier_id || null,
      due_date: validatedData.due_date || null,
      document_number: validatedData.document_number || null,
      notes: validatedData.notes || null,
      status: "draft",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating invoice:", error)
    return { error: "Fatura oluşturulurken bir hata oluştu", details: error.message }
  }

  revalidatePath("/invoices")
  redirect(`/invoices/${data.id}`)
}

// Faturaları listele
export async function getInvoices() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      customers(service_name, contact_name),
      suppliers(name, contact_name)
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching invoices:", error)
    return []
  }

  return data || []
}

// Fatura detayını getir
export async function getInvoiceById(id: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      customers(service_name, contact_name, phone, email),
      suppliers(name, contact_name, phone, email),
      invoice_items(*),
      invoice_payments(*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching invoice:", error)
    return null
  }

  return data
}

// Ödeme ekle
export async function addPayment(formData: FormData) {
  const supabase = await createClient()

  const rawData = {
    invoice_id: Number.parseInt(formData.get("invoice_id")?.toString() || "0"),
    payment_date: formData.get("payment_date")?.toString() || "",
    amount: Number.parseFloat(formData.get("amount")?.toString() || "0"),
    payment_method: formData.get("payment_method")?.toString() || "",
    reference_number: formData.get("reference_number")?.toString(),
    notes: formData.get("notes")?.toString(),
  }

  const validatedData = paymentSchema.parse(rawData)

  const { error } = await supabase.from("invoice_payments").insert({
    ...validatedData,
    reference_number: validatedData.reference_number || null,
    notes: validatedData.notes || null,
  })

  if (error) {
    console.error("Error adding payment:", error)
    return { error: "Ödeme eklenirken bir hata oluştu", details: error.message }
  }

  revalidatePath(`/invoices/${validatedData.invoice_id}`)
}
```
