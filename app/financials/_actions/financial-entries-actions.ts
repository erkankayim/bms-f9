"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Types
export type FinancialCategory = {
  id: number
  name: string
  type: "income" | "expense"
  description?: string
  is_active: boolean
  created_at: string
}

export type CustomerForDropdown = {
  mid: string
  contact_name: string | null
  email: string | null
}

export type SupplierForDropdown = {
  id: number
  name: string
  contact_name: string | null
}

// Validation schemas
const IncomeEntrySchema = z.object({
  incoming_amount: z.coerce.number().positive("Gelen tutar pozitif olmalıdır"),
  entry_date: z.string().min(1, "Tarih gereklidir"),
  category_id: z.coerce.number().positive("Kategori seçimi gereklidir"),
  customer_id: z.string().optional().nullable(),
  source: z.string().min(1, "Kaynak gereklidir"),
  description: z.string().min(1, "Açıklama gereklidir"),
  invoice_number: z.string().optional().nullable(),
  payment_method: z.string().min(1, "Ödeme şekli gereklidir"),
  notes: z.string().optional().nullable(),
})

const ExpenseEntrySchema = z.object({
  expense_amount: z.coerce.number().positive("Gider tutarı pozitif olmalıdır"),
  payment_amount: z.coerce.number().positive("Ödenen tutar pozitif olmalıdır"),
  entry_date: z.string().min(1, "Tarih gereklidir"),
  category_id: z.coerce.number().positive("Kategori seçimi gereklidir"),
  supplier_id: z.coerce.number().optional().nullable(),
  expense_title: z.string().min(1, "Gider başlığı gereklidir"),
  expense_source: z.string().min(1, "Gider kaynağı gereklidir"),
  description: z.string().min(1, "Açıklama gereklidir"),
  invoice_number: z.string().optional().nullable(),
  payment_method: z.string().min(1, "Ödeme şekli gereklidir"),
  receipt_url: z.string().url().optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable(),
})

const CategorySchema = z.object({
  name: z.string().min(1, "Kategori adı gereklidir").max(100, "Kategori adı en fazla 100 karakter olabilir"),
  type: z.enum(["income", "expense"], { errorMap: () => ({ message: "Geçerli bir kategori türü seçin" }) }),
  description: z.string().optional().nullable(),
})

// Category functions
export async function getFinancialCategories(
  type: "income" | "expense",
): Promise<{ data?: FinancialCategory[]; error?: string }> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("financial_categories")
      .select("*")
      .eq("type", type)
      .eq("is_active", true)
      .order("name", { ascending: true })

    if (error) {
      console.error("Kategoriler alınırken hata:", error)
      return { error: `Kategoriler alınırken hata: ${error.message}` }
    }

    return { data: data || [] }
  } catch (error: any) {
    console.error("Kategoriler alınırken hata:", error)
    return { error: `Kategoriler alınırken hata: ${error.message}` }
  }
}

export async function createFinancialCategory(formData: FormData) {
  const supabase = createClient()

  try {
    const rawData = {
      name: formData.get("name") as string,
      type: formData.get("type") as "income" | "expense",
      description: (formData.get("description") as string) || null,
    }

    const validatedData = CategorySchema.parse(rawData)

    // Check if category already exists
    const { data: existingCategory } = await supabase
      .from("financial_categories")
      .select("id")
      .eq("name", validatedData.name)
      .eq("type", validatedData.type)
      .single()

    if (existingCategory) {
      return {
        success: false,
        message: "Bu isimde bir kategori zaten mevcut",
        errors: [{ path: ["name"], message: "Bu isimde bir kategori zaten mevcut" }],
      }
    }

    const { data, error } = await supabase
      .from("financial_categories")
      .insert([{ ...validatedData, is_active: true }])
      .select()
      .single()

    if (error) {
      console.error("Kategori oluşturulurken hata:", error)
      return {
        success: false,
        message: "Kategori oluşturulurken bir hata oluştu",
        errors: [{ path: ["general"], message: error.message }],
      }
    }

    revalidatePath("/financials")
    return {
      success: true,
      message: "Kategori başarıyla oluşturuldu",
      data: data,
    }
  } catch (error: any) {
    console.error("Kategori oluşturulurken hata:", error)
    if (error.errors) {
      return {
        success: false,
        message: "Form verilerinde hata var",
        errors: error.errors,
      }
    }
    return {
      success: false,
      message: "Kategori oluşturulurken beklenmeyen bir hata oluştu",
      errors: [{ path: ["general"], message: error.message }],
    }
  }
}

export async function deleteFinancialCategory(categoryId: number) {
  const supabase = createClient()

  try {
    // Check if category is being used
    const { data: incomeEntries } = await supabase
      .from("financial_entries")
      .select("id")
      .eq("category_id", categoryId)
      .eq("entry_type", "income")
      .limit(1)

    const { data: expenseEntries } = await supabase
      .from("financial_entries")
      .select("id")
      .eq("category_id", categoryId)
      .eq("entry_type", "expense")
      .limit(1)

    if ((incomeEntries && incomeEntries.length > 0) || (expenseEntries && expenseEntries.length > 0)) {
      return {
        success: false,
        message: "Bu kategori kullanımda olduğu için silinemez. Önce bu kategoriye ait kayıtları silin.",
      }
    }

    const { error } = await supabase.from("financial_categories").delete().eq("id", categoryId)

    if (error) {
      console.error("Kategori silinirken hata:", error)
      return {
        success: false,
        message: "Kategori silinirken bir hata oluştu",
      }
    }

    revalidatePath("/financials")
    return {
      success: true,
      message: "Kategori başarıyla silindi",
    }
  } catch (error: any) {
    console.error("Kategori silinirken hata:", error)
    return {
      success: false,
      message: "Kategori silinirken beklenmeyen bir hata oluştu",
    }
  }
}

// Customer functions
export async function getCustomersForDropdown(): Promise<{ data?: CustomerForDropdown[]; error?: string }> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("customers")
      .select("mid, contact_name, email")
      .order("contact_name", { ascending: true })

    if (error) {
      console.error("Müşteriler alınırken hata:", error)
      return { error: `Müşteriler alınırken hata: ${error.message}` }
    }

    return { data: data || [] }
  } catch (error: any) {
    console.error("Müşteriler alınırken hata:", error)
    return { error: `Müşteriler alınırken hata: ${error.message}` }
  }
}

// Supplier functions
export async function getSuppliersForDropdown(): Promise<{ data?: SupplierForDropdown[]; error?: string }> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("suppliers")
      .select("id, name, contact_name")
      .order("name", { ascending: true })

    if (error) {
      console.error("Tedarikçiler alınırken hata:", error)
      return { error: `Tedarikçiler alınırken hata: ${error.message}` }
    }

    return { data: data || [] }
  } catch (error: any) {
    console.error("Tedarikçiler alınırken hata:", error)
    return { error: `Tedarikçiler alınırken hata: ${error.message}` }
  }
}

// Income entry functions
export async function createIncomeEntryAction(prevState: any, formData: FormData) {
  const supabase = createClient()

  try {
    const rawData = {
      incoming_amount: formData.get("incoming_amount"),
      entry_date: formData.get("entry_date"),
      category_id: formData.get("category_id"),
      customer_id: formData.get("customer_id"),
      source: formData.get("source"),
      description: formData.get("description"),
      invoice_number: formData.get("invoice_number"),
      payment_method: formData.get("payment_method"),
      notes: formData.get("notes"),
    }

    const validatedData = IncomeEntrySchema.parse(rawData)

    // Handle customer_id
    let customerMid = null
    if (
      validatedData.customer_id &&
      validatedData.customer_id !== "none" &&
      validatedData.customer_id !== "no-customers"
    ) {
      customerMid = validatedData.customer_id
    }

    const entryData = {
      entry_type: "income" as const,
      incoming_amount: validatedData.incoming_amount,
      entry_date: validatedData.entry_date,
      category_id: validatedData.category_id,
      customer_id: customerMid,
      source: validatedData.source,
      description: validatedData.description,
      invoice_number: validatedData.invoice_number || null,
      payment_method: validatedData.payment_method,
      notes: validatedData.notes || null,
    }

    const { error } = await supabase.from("financial_entries").insert([entryData])

    if (error) {
      console.error("Gelir kaydı oluşturulurken hata:", error)
      return {
        success: false,
        message: "Gelir kaydı oluşturulurken bir hata oluştu",
        errors: [{ path: ["general"], message: error.message }],
      }
    }

    revalidatePath("/financials/income")
    return {
      success: true,
      message: "Gelir kaydı başarıyla oluşturuldu",
      errors: undefined,
    }
  } catch (error: any) {
    console.error("Gelir kaydı oluşturulurken hata:", error)
    if (error.errors) {
      return {
        success: false,
        message: "Form verilerinde hata var",
        errors: error.errors,
      }
    }
    return {
      success: false,
      message: "Gelir kaydı oluşturulurken beklenmeyen bir hata oluştu",
      errors: [{ path: ["general"], message: error.message }],
    }
  }
}

// Expense entry functions
export async function createExpenseEntryAction(prevState: any, formData: FormData) {
  const supabase = createClient()

  try {
    const rawData = {
      expense_amount: formData.get("expense_amount"),
      payment_amount: formData.get("payment_amount"),
      entry_date: formData.get("entry_date"),
      category_id: formData.get("category_id"),
      supplier_id: formData.get("supplier_id"),
      expense_title: formData.get("expense_title"),
      expense_source: formData.get("expense_source"),
      description: formData.get("description"),
      invoice_number: formData.get("invoice_number"),
      payment_method: formData.get("payment_method"),
      receipt_url: formData.get("receipt_url"),
      notes: formData.get("notes"),
    }

    const validatedData = ExpenseEntrySchema.parse(rawData)

    // Handle supplier_id
    let supplierId = null
    if (validatedData.supplier_id && validatedData.supplier_id > 0) {
      supplierId = validatedData.supplier_id
    }

    const entryData = {
      entry_type: "expense" as const,
      expense_amount: validatedData.expense_amount,
      payment_amount: validatedData.payment_amount,
      entry_date: validatedData.entry_date,
      category_id: validatedData.category_id,
      supplier_id: supplierId,
      expense_title: validatedData.expense_title,
      expense_source: validatedData.expense_source,
      description: validatedData.description,
      invoice_number: validatedData.invoice_number || null,
      payment_method: validatedData.payment_method,
      receipt_url: validatedData.receipt_url || null,
      notes: validatedData.notes || null,
    }

    const { error } = await supabase.from("financial_entries").insert([entryData])

    if (error) {
      console.error("Gider kaydı oluşturulurken hata:", error)
      return {
        success: false,
        message: "Gider kaydı oluşturulurken bir hata oluştu",
        errors: [{ path: ["general"], message: error.message }],
      }
    }

    revalidatePath("/financials/expenses")
    return {
      success: true,
      message: "Gider kaydı başarıyla oluşturuldu",
      errors: undefined,
    }
  } catch (error: any) {
    console.error("Gider kaydı oluşturulurken hata:", error)
    if (error.errors) {
      return {
        success: false,
        message: "Form verilerinde hata var",
        errors: error.errors,
      }
    }
    return {
      success: false,
      message: "Gider kaydı oluşturulurken beklenmeyen bir hata oluştu",
      errors: [{ path: ["general"], message: error.message }],
    }
  }
}
