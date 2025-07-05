"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

// Zod şemaları
const createInvoiceSchema = z.object({
  invoice_number: z.string().min(1, "Fatura numarası gereklidir"),
  invoice_type: z.enum(["incoming", "outgoing"], { required_error: "Fatura türü seçimi gereklidir" }),
  document_type: z.enum(["invoice", "receipt", "credit_note", "debit_note", "proforma", "other"]).default("invoice"),
  document_number: z.string().optional(),
  issue_date: z.string().min(1, "Düzenleme tarihi gereklidir"),
  due_date: z.string().optional(),
  customer_id: z.string().nullable().optional(), // null veya undefined kabul edilir
  supplier_id: z.string().nullable().optional(), // null veya undefined kabul edilir
  total_amount: z.coerce.number().min(0, "Toplam tutar 0 veya daha büyük olmalıdır"),
  tax_amount: z.coerce.number().min(0, "Vergi tutarı 0 veya daha büyük olmalıdır").default(0),
  discount_amount: z.coerce.number().min(0, "İndirim tutarı 0 veya daha büyük olmalıdır").default(0),
  notes: z.string().optional(),
})

const addPaymentSchema = z.object({
  invoice_id: z.string().min(1, "Fatura ID gereklidir"),
  payment_date: z.string().min(1, "Ödeme tarihi gereklidir"),
  amount: z.coerce.number().min(0.01, "Tutar 0’dan büyük olmalıdır"),
  payment_method: z.string().min(1, "Ödeme şekli gereklidir"),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
})

export async function createInvoice(prevState: any, formData: FormData) {
  const supabase = createClient()

  // Form verilerini logla
  console.log("FormData:", Object.fromEntries(formData))

  try {
    const validatedFields = createInvoiceSchema.safeParse({
      invoice_number: formData.get("invoice_number")?.toString(),
      invoice_type: formData.get("invoice_type")?.toString(),
      document_type: formData.get("document_type")?.toString(),
      document_number: formData.get("document_number")?.toString(),
      issue_date: formData.get("issue_date")?.toString(),
      due_date: formData.get("due_date")?.toString(),
      customer_id: formData.get("customer_id")?.toString(),
      supplier_id: formData.get("supplier_id")?.toString(),
      total_amount: formData.get("total_amount"),
      tax_amount: formData.get("tax_amount"),
      discount_amount: formData.get("discount_amount"),
      notes: formData.get("notes")?.toString(),
    })

    if (!validatedFields.success) {
      console.log("Validation errors:", validatedFields.error.flatten().fieldErrors)
      return {
        error: "Geçersiz form verileri",
        details: validatedFields.error.flatten().fieldErrors,
      }
    }

    const data = validatedFields.data

    // Fatura türüne göre müşteri/tedarikçi kontrolü
    if (data.invoice_type === "outgoing" && !data.customer_id) {
      return { error: "Giden fatura için müşteri seçimi gereklidir" }
    }

    if (data.invoice_type === "incoming" && !data.supplier_id) {
      return { error: "Gelen fatura için tedarikçi seçimi gereklidir" }
    }

    const { data: invoice, error } = await supabase
      .from("invoices")
      .insert({
        invoice_number: data.invoice_number,
        invoice_type: data.invoice_type,
        document_type: data.document_type,
        document_number: data.document_number || null,
        issue_date: data.issue_date,
        due_date: data.due_date || null,
        customer_id: data.invoice_type === "outgoing" ? data.customer_id : null,
        supplier_id: data.invoice_type === "incoming" ? data.supplier_id : null,
        total_amount: data.total_amount,
        tax_amount: data.tax_amount,
        discount_amount: data.discount_amount,
        notes: data.notes || null,
        status: "draft",
      })
      .select()
      .single()

    if (error) {
      console.error("Fatura oluşturma hatası:", error)
      return { error: "Fatura oluşturulamadı", details: error.message }
    }

    revalidatePath("/invoices")
    redirect(`/invoices/${invoice.id}`)
  } catch (error) {
    console.error("Beklenmeyen hata:", error)
    return { error: "Beklenmeyen bir hata oluştu", details: error.message }
  }
}

export async function addPayment(prevState: any, formData: FormData) {
  const supabase = createClient()

  try {
    const validatedFields = addPaymentSchema.safeParse({
      invoice_id: formData.get("invoice_id")?.toString(),
      payment_date: formData.get("payment_date")?.toString(),
      amount: formData.get("amount"),
      payment_method: formData.get("payment_method")?.toString(),
      reference_number: formData.get("reference_number")?.toString(),
      notes: formData.get("notes")?.toString(),
    })

    if (!validatedFields.success) {
      console.log("Validation errors:", validatedFields.error.flatten().fieldErrors)
      return {
        error: "Geçersiz form verileri",
        details: validatedFields.error.flatten().fieldErrors,
      }
    }

    const data = validatedFields.data
    const invoiceId = Number.parseInt(data.invoice_id)

    // Ödeme kaydını ekle
    const { error: paymentError } = await supabase.from("invoice_payments").insert({
      invoice_id: invoiceId,
      payment_date: data.payment_date,
      amount: data.amount,
      payment_method: data.payment_method,
      reference_number: data.reference_number || null,
      notes: data.notes || null,
    })

    if (paymentError) {
      console.error("Ödeme ekleme hatası:", paymentError)
      return { error: "Ödeme eklenemedi", details: paymentError.message }
    }

    // Fatura durumunu güncelle
    await updateInvoiceStatus(invoiceId)

    revalidatePath(`/invoices/${invoiceId}`)
    return { success: "Ödeme başarıyla eklendi" }
  } catch (error) {
    console.error("Beklenmeyen hata:", error)
    return { error: "Beklenmeyen bir hata oluştu", details: error.message }
  }
}

async function updateInvoiceStatus(invoiceId: number) {
  const supabase = createClient()

  // Fatura ve ödemelerini al
  const { data: invoice } = await supabase.from("invoices").select("total_amount").eq("id", invoiceId).single()

  const { data: payments } = await supabase.from("invoicewatch").select("amount").eq("invoice_id", invoiceId)

  if (!invoice || !payments) return

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)

  let status = "draft"
  if (totalPaid >= invoice.total_amount) {
    status = "paid"
  } else if (totalPaid > 0) {
    status = "partially_paid"
  }

  await supabase.from("invoices").update({ status }).eq("id", invoiceId)
}

export async function getInvoices() {
  const supabase = createClient()

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select(`
      *,
      customers (
        mid,
        service_name,
        contact_name
      ),
      suppliers (
        id,
        name,
        contact_name
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Fatura listesi alınamadı:", error)
    return []
  }

  return invoices || []
}

export async function getInvoiceById(id: number) {
  const supabase = createClient()

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(`
      *,
      customers (
        mid,
        service_name,
        contact_name,
        phone,
        email,
        address
      ),
      suppliers (
        id,
        name,
        contact_name,
        phone,
        email,
        address
      ),
      invoice_payments (
        id,
        payment_date,
        amount,
        payment_method,
        reference_number,
        notes
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Fatura detayı alınamadı:", error)
    return null
  }

  return invoice
}

export async function getCustomersForInvoice() {
  const supabase = createClient()

  const { data: customers, error } = await supabase
    .from("customers")
    .select("mid, service_name, contact_name")
    .is("deleted_at", null)
    .order("service_name")

  if (error) {
    console.error("Müşteri listesi alınamadı:", error)
    return []
  }

  return customers || []
}

export async function getSuppliersForInvoice() {
  const supabase = createClient()

  const { data: suppliers, error } = await supabase.from("suppliers").select("id, name, contact_name").order("name")

  if (error) {
    console.error("Tedarikçi listesi alınamadı:", error)
    return []
  }

  return suppliers || []
}
