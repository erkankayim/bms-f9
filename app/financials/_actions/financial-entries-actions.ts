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

export type IncomeEntryWithDetails = {
  id: number
  description: string
  incoming_amount: number
  entry_date: string
  source: string
  invoice_number: string | null
  payment_method: string
  notes: string | null
  customer_id: string | null
  category_id: number
  customer_name: string | null
  category_name: string | null
  created_at: string
}

export type ExpenseEntryWithDetails = {
  id: number
  description: string
  expense_amount: number
  payment_amount: number
  expense_title: string
  expense_source: string
  entry_date: string
  invoice_number: string | null
  payment_method: string
  receipt_url: string | null
  notes: string | null
  supplier_id: number | null
  category_id: number
  supplier_name: string | null
  category_name: string | null
  created_at: string
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
      .order("name", { ascending: true })

    if (error) {
      console.error("Kategoriler alınırken hata:", error)

      // Return default categories if database fails
      const defaultIncomeCategories = [
        {
          id: 1,
          name: "Ürün Satışları",
          type: "income" as const,
          description: "Ürün satışlarından elde edilen gelirler",
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Hizmet Gelirleri",
          type: "income" as const,
          description: "Sunulan hizmetlerden elde edilen gelirler",
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 3,
          name: "Danışmanlık Geliri",
          type: "income" as const,
          description: "Danışmanlık hizmetlerinden elde edilen gelir",
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 4,
          name: "Diğer Gelirler",
          type: "income" as const,
          description: "Diğer çeşitli gelir kaynakları",
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ]

      const defaultExpenseCategories = [
        {
          id: 5,
          name: "Ofis Giderleri",
          type: "expense" as const,
          description: "Ofis kirası, elektrik, su, internet vb.",
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 6,
          name: "Personel Giderleri",
          type: "expense" as const,
          description: "Maaş, SGK, vergi vb. personel maliyetleri",
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 7,
          name: "Pazarlama Giderleri",
          type: "expense" as const,
          description: "Reklam, tanıtım ve pazarlama faaliyetleri",
          is_active: true,
          created_at: new Date().toISOString(),
        },
        {
          id: 8,
          name: "Diğer Giderler",
          type: "expense" as const,
          description: "Diğer çeşitli gider kalemleri",
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ]

      const defaultCategories = type === "income" ? defaultIncomeCategories : defaultExpenseCategories
      return { data: defaultCategories }
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
    const { data: entries } = await supabase
      .from("financial_entries")
      .select("id")
      .eq("category_id", categoryId)
      .limit(1)

    if (entries && entries.length > 0) {
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
export async function getIncomeEntries(): Promise<{ data?: IncomeEntryWithDetails[]; error?: string }> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("financial_entries")
      .select(`
        id,
        description,
        incoming_amount,
        entry_date,
        source,
        invoice_number,
        payment_method,
        notes,
        customer_id,
        category_id,
        created_at,
        customers(contact_name),
        financial_categories(name)
      `)
      .eq("entry_type", "income")
      .order("entry_date", { ascending: false })

    if (error) {
      console.error("Gelir kayıtları alınırken hata:", error)
      return { error: `Gelir kayıtları alınırken hata: ${error.message}` }
    }

    const formattedData =
      data?.map((entry: any) => ({
        id: entry.id,
        description: entry.description,
        incoming_amount: entry.incoming_amount,
        entry_date: entry.entry_date,
        source: entry.source,
        invoice_number: entry.invoice_number,
        payment_method: entry.payment_method,
        notes: entry.notes,
        customer_id: entry.customer_id,
        category_id: entry.category_id,
        customer_name: entry.customers?.contact_name,
        category_name: entry.financial_categories?.name,
        created_at: entry.created_at,
      })) || []

    return { data: formattedData }
  } catch (error: any) {
    console.error("Gelir kayıtları alınırken hata:", error)
    return { error: `Gelir kayıtları alınırken hata: ${error.message}` }
  }
}

export async function getIncomeEntryById(id: number): Promise<{ data?: IncomeEntryWithDetails; error?: string }> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("financial_entries")
      .select(`
        id,
        description,
        incoming_amount,
        entry_date,
        source,
        invoice_number,
        payment_method,
        notes,
        customer_id,
        category_id,
        created_at,
        customers(contact_name),
        financial_categories(name)
      `)
      .eq("entry_type", "income")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Gelir kaydı alınırken hata:", error)
      return { error: `Gelir kaydı alınırken hata: ${error.message}` }
    }

    const formattedData = {
      id: data.id,
      description: data.description,
      incoming_amount: data.incoming_amount,
      entry_date: data.entry_date,
      source: data.source,
      invoice_number: data.invoice_number,
      payment_method: data.payment_method,
      notes: data.notes,
      customer_id: data.customer_id,
      category_id: data.category_id,
      customer_name: data.customers?.contact_name,
      category_name: data.financial_categories?.name,
      created_at: data.created_at,
    }

    return { data: formattedData }
  } catch (error: any) {
    console.error("Gelir kaydı alınırken hata:", error)
    return { error: `Gelir kaydı alınırken hata: ${error.message}` }
  }
}

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

export async function updateIncomeEntryAction(
  id: number,
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string; errors?: any }> {
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

    const { error } = await supabase.from("financial_entries").update(entryData).eq("id", id).eq("entry_type", "income")

    if (error) {
      console.error("Gelir kaydı güncellenirken hata:", error)
      return {
        success: false,
        message: "Gelir kaydı güncellenirken bir hata oluştu",
        errors: [{ path: ["general"], message: error.message }],
      }
    }

    revalidatePath("/financials/income")
    return {
      success: true,
      message: "Gelir kaydı başarıyla güncellendi",
      errors: undefined,
    }
  } catch (error: any) {
    console.error("Gelir kaydı güncellenirken hata:", error)
    if (error.errors) {
      return {
        success: false,
        message: "Form verilerinde hata var",
        errors: error.errors,
      }
    }
    return {
      success: false,
      message: "Gelir kaydı güncellenirken beklenmeyen bir hata oluştu",
      errors: [{ path: ["general"], message: error.message }],
    }
  }
}

export async function deleteIncomeEntry(id: number): Promise<{ success: boolean; message: string }> {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("financial_entries").delete().eq("id", id).eq("entry_type", "income")

    if (error) {
      console.error("Gelir kaydı silinirken hata:", error)
      return {
        success: false,
        message: "Gelir kaydı silinirken bir hata oluştu",
      }
    }

    revalidatePath("/financials/income")
    return {
      success: true,
      message: "Gelir kaydı başarıyla silindi",
    }
  } catch (error: any) {
    console.error("Gelir kaydı silinirken hata:", error)
    return {
      success: false,
      message: "Gelir kaydı silinirken beklenmeyen bir hata oluştu",
    }
  }
}

// Expense entry functions
export async function getExpenseEntries(): Promise<{ data?: ExpenseEntryWithDetails[]; error?: string }> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("financial_entries")
      .select(`
        id,
        description,
        expense_amount,
        payment_amount,
        expense_title,
        expense_source,
        entry_date,
        invoice_number,
        payment_method,
        receipt_url,
        notes,
        supplier_id,
        category_id,
        created_at,
        suppliers(name),
        financial_categories(name)
      `)
      .eq("entry_type", "expense")
      .order("entry_date", { ascending: false })

    if (error) {
      console.error("Gider kayıtları alınırken hata:", error)
      return { error: `Gider kayıtları alınırken hata: ${error.message}` }
    }

    const formattedData =
      data?.map((entry: any) => ({
        id: entry.id,
        description: entry.description,
        expense_amount: entry.expense_amount,
        payment_amount: entry.payment_amount,
        expense_title: entry.expense_title,
        expense_source: entry.expense_source,
        entry_date: entry.entry_date,
        invoice_number: entry.invoice_number,
        payment_method: entry.payment_method,
        receipt_url: entry.receipt_url,
        notes: entry.notes,
        supplier_id: entry.supplier_id,
        category_id: entry.category_id,
        supplier_name: entry.suppliers?.name,
        category_name: entry.financial_categories?.name,
        created_at: entry.created_at,
      })) || []

    return { data: formattedData }
  } catch (error: any) {
    console.error("Gider kayıtları alınırken hata:", error)
    return { error: `Gider kayıtları alınırken hata: ${error.message}` }
  }
}

export async function getExpenseEntryById(id: number): Promise<{ data?: ExpenseEntryWithDetails; error?: string }> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("financial_entries")
      .select(`
        id,
        description,
        expense_amount,
        payment_amount,
        expense_title,
        expense_source,
        entry_date,
        invoice_number,
        payment_method,
        receipt_url,
        notes,
        supplier_id,
        category_id,
        created_at,
        suppliers(name),
        financial_categories(name)
      `)
      .eq("entry_type", "expense")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Gider kaydı alınırken hata:", error)
      return { error: `Gider kaydı alınırken hata: ${error.message}` }
    }

    const formattedData = {
      id: data.id,
      description: data.description,
      expense_amount: data.expense_amount,
      payment_amount: data.payment_amount,
      expense_title: data.expense_title,
      expense_source: data.expense_source,
      entry_date: data.entry_date,
      invoice_number: data.invoice_number,
      payment_method: data.payment_method,
      receipt_url: data.receipt_url,
      notes: data.notes,
      supplier_id: data.supplier_id,
      category_id: data.category_id,
      supplier_name: data.suppliers?.name,
      category_name: data.financial_categories?.name,
      created_at: data.created_at,
    }

    return { data: formattedData }
  } catch (error: any) {
    console.error("Gider kaydı alınırken hata:", error)
    return { error: `Gider kaydı alınırken hata: ${error.message}` }
  }
}

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

export async function updateExpenseEntryAction(
  id: number,
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string; errors?: any }> {
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

    const { error } = await supabase
      .from("financial_entries")
      .update(entryData)
      .eq("id", id)
      .eq("entry_type", "expense")

    if (error) {
      console.error("Gider kaydı güncellenirken hata:", error)
      return {
        success: false,
        message: "Gider kaydı güncellenirken bir hata oluştu",
        errors: [{ path: ["general"], message: error.message }],
      }
    }

    revalidatePath("/financials/expenses")
    return {
      success: true,
      message: "Gider kaydı başarıyla güncellendi",
      errors: undefined,
    }
  } catch (error: any) {
    console.error("Gider kaydı güncellenirken hata:", error)
    if (error.errors) {
      return {
        success: false,
        message: "Form verilerinde hata var",
        errors: error.errors,
      }
    }
    return {
      success: false,
      message: "Gider kaydı güncellenirken beklenmeyen bir hata oluştu",
      errors: [{ path: ["general"], message: error.message }],
    }
  }
}

export async function deleteExpenseEntry(id: number): Promise<{ success: boolean; message: string }> {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("financial_entries").delete().eq("id", id).eq("entry_type", "expense")

    if (error) {
      console.error("Gider kaydı silinirken hata:", error)
      return {
        success: false,
        message: "Gider kaydı silinirken bir hata oluştu",
      }
    }

    revalidatePath("/financials/expenses")
    return {
      success: true,
      message: "Gider kaydı başarıyla silindi",
    }
  } catch (error: any) {
    console.error("Gider kaydı silinirken hata:", error)
    return {
      success: false,
      message: "Gider kaydı silinirken beklenmeyen bir hata oluştu",
    }
  }
}
