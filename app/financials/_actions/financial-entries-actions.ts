"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { IncomeEntrySchema, ExpenseEntrySchema } from "../_lib/financial-entry-shared"
import type { z } from "zod"

// Types
export type FinancialCategory = {
  id: number
  name: string
  type: "income" | "expense"
  description?: string
  is_active?: boolean
}

export interface CustomerForDropdown {
  mid: string
  contact_name: string
  email: string | null
}

export interface SupplierForDropdown {
  id: string
  name: string
  company_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
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
  customer_mid: string | null
  created_at: string
}

export type ExpenseEntry = {
  id: number
  description: string
  expense_amount: number
  payment_amount: number
  expense_title: string
  expense_source: string
  entry_date: string
  invoice_number?: string
  payment_method: string
  notes?: string
  supplier_id?: string
  supplier_name?: string
  category_name?: string
  created_at: string
}

// Data fetching functions
export async function getFinancialCategories(
  type: "income" | "expense",
): Promise<{ data?: FinancialCategory[]; error?: string }> {
  try {
    const supabase = createClient()

    console.log(`Fetching ${type} categories...`)

    // First, try to get categories from the database
    const { data, error } = await supabase
      .from("financial_categories")
      .select("id, name, type, description")
      .eq("type", type)
      .order("name")

    if (error) {
      console.error("Database error for financial categories:", error)

      // Return default categories if database fails
      const defaultIncomeCategories = [
        {
          id: 1,
          name: "Ürün Satışları",
          type: "income" as const,
          description: "Ürün satışlarından elde edilen gelirler",
        },
        {
          id: 2,
          name: "Hizmet Gelirleri",
          type: "income" as const,
          description: "Sunulan hizmetlerden elde edilen gelirler",
        },
        { id: 3, name: "Faiz Gelirleri", type: "income" as const, description: "Banka faizleri ve yatırım gelirleri" },
        { id: 4, name: "Diğer Gelirler", type: "income" as const, description: "Diğer çeşitli gelir kaynakları" },
        {
          id: 12,
          name: "Danışmanlık Geliri",
          type: "income" as const,
          description: "Sağlanan danışmanlık hizmetlerinden elde edilen gelir",
        },
      ]

      const defaultExpenseCategories = [
        {
          id: 5,
          name: "Ofis Giderleri",
          type: "expense" as const,
          description: "Ofis kirası, elektrik, su, internet vb.",
        },
        {
          id: 6,
          name: "Personel Giderleri",
          type: "expense" as const,
          description: "Maaş, SGK, vergi vb. personel maliyetleri",
        },
        { id: 7, name: "Malzeme Giderleri", type: "expense" as const, description: "Hammadde ve malzeme alımları" },
        {
          id: 8,
          name: "Pazarlama Giderleri",
          type: "expense" as const,
          description: "Reklam, tanıtım ve pazarlama faaliyetleri",
        },
        { id: 9, name: "Diğer Giderler", type: "expense" as const, description: "Diğer çeşitli gider kalemleri" },
      ]

      const defaultCategories = type === "income" ? defaultIncomeCategories : defaultExpenseCategories
      console.log(`Returning ${defaultCategories.length} default ${type} categories`)
      return { data: defaultCategories }
    }

    console.log(`Found ${data?.length || 0} ${type} categories in database`)
    return { data: data as FinancialCategory[] }
  } catch (error) {
    console.error("Unexpected error fetching financial categories:", error)
    return { error: `Finansal kategoriler alınırken beklenmeyen hata: ${error}` }
  }
}

export async function getCustomersForDropdown(): Promise<{ data: CustomerForDropdown[] | null; error: string | null }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("customers").select("mid, contact_name, email").order("contact_name")

    if (error) {
      console.error("Database error:", error)
      return { data: null, error: `Müşteriler alınırken hata: ${error.message}` }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { data: null, error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function getSuppliersForDropdown(): Promise<{ data: SupplierForDropdown[] | null; error: string | null }> {
  try {
    const supabase = createClient()

    console.log("🔍 Fetching suppliers for dropdown...")

    // Suppliers tablosundan tüm gerekli alanları çek
    const { data, error } = await supabase
      .from("suppliers")
      .select("id, name, company_name, contact_name, email, phone")
      .order("name")

    if (error) {
      console.error("❌ Database error fetching suppliers:", error)
      return { data: null, error: `Tedarikçiler alınırken hata: ${error.message}` }
    }

    console.log(`✅ Raw supplier data:`, data)
    console.log(`📊 Found ${data?.length || 0} suppliers in database`)

    if (!data || data.length === 0) {
      console.log("⚠️ No suppliers found in database")
      return { data: [], error: null }
    }

    // Format the data to ensure we have the right structure
    const formattedData = data.map((supplier) => {
      const formatted = {
        id: supplier.id,
        name: supplier.name || supplier.company_name || "İsimsiz Tedarikçi",
        company_name: supplier.company_name || supplier.name || "İsimsiz Şirket",
        contact_name: supplier.contact_name,
        email: supplier.email,
        phone: supplier.phone,
      }
      console.log(`📝 Formatted supplier:`, formatted)
      return formatted
    })

    console.log(`🎯 Returning ${formattedData.length} formatted suppliers`)
    return { data: formattedData, error: null }
  } catch (error) {
    console.error("💥 Unexpected error fetching suppliers:", error)
    return { data: null, error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function getIncomeEntries(): Promise<{ data?: IncomeEntryWithDetails[]; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("income_entries")
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
        customers(mid, contact_name),
        financial_categories(name)
      `)
      .order("entry_date", { ascending: false })

    if (error) {
      console.error("Database error for income entries:", error)
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
        customer_mid: entry.customers?.mid,
        customer_name: entry.customers?.contact_name,
        category_name: entry.financial_categories?.name,
        created_at: entry.created_at,
      })) || []

    return { data: formattedData }
  } catch (error) {
    console.error("Unexpected error fetching income entries:", error)
    return { error: `Gelir kayıtları alınırken beklenmeyen hata: ${error}` }
  }
}

export async function getIncomeEntryById(id: number): Promise<{ data?: IncomeEntryWithDetails; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("income_entries")
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
        customers(mid, contact_name),
        financial_categories(name)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error(`Database error for income entry ${id}:`, error)
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
      customer_mid: data.customers?.mid,
      customer_name: data.customers?.contact_name,
      category_name: data.financial_categories?.name,
      created_at: data.created_at,
    }

    return { data: formattedData }
  } catch (error) {
    console.error("Unexpected error fetching income entry:", error)
    return { error: `Gelir kaydı alınırken beklenmeyen hata: ${error}` }
  }
}

export async function getExpenseEntries(): Promise<{ data?: ExpenseEntry[]; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("expense_entries")
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
        notes,
        supplier_id,
        category_id,
        created_at,
        suppliers(name),
        financial_categories(name)
      `)
      .order("entry_date", { ascending: false })

    if (error) {
      console.error("Database error for expense entries:", error)
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
        notes: entry.notes,
        supplier_id: entry.supplier_id,
        supplier_name: entry.suppliers?.name,
        category_name: entry.financial_categories?.name,
        created_at: entry.created_at,
      })) || []

    return { data: formattedData }
  } catch (error) {
    console.error("Unexpected error fetching expense entries:", error)
    return { error: `Gider kayıtları alınırken beklenmeyen hata: ${error}` }
  }
}

export async function getExpenseEntryById(id: number): Promise<{ data?: ExpenseEntry; error?: string }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("expense_entries")
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
        notes,
        supplier_id,
        category_id,
        created_at,
        suppliers(name),
        financial_categories(name)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error(`Database error for expense entry ${id}:`, error)
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
      notes: data.notes,
      supplier_id: data.supplier_id,
      supplier_name: data.suppliers?.name,
      category_name: data.financial_categories?.name,
      created_at: data.created_at,
    }

    return { data: formattedData }
  } catch (error) {
    console.error("Unexpected error fetching expense entry:", error)
    return { error: `Gider kaydı alınırken beklenmeyen hata: ${error}` }
  }
}

export async function deleteIncomeEntry(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("income_entries").delete().eq("id", id)

    if (error) {
      console.error(`Database error deleting income entry ${id}:`, error)
      return { success: false, message: `Gelir kaydı silinirken hata: ${error.message}` }
    }

    revalidatePath("/financials/income")
    return { success: true, message: "Gelir kaydı başarıyla silindi." }
  } catch (error) {
    console.error("Unexpected error deleting income entry:", error)
    return { success: false, message: `Gelir kaydı silinirken beklenmeyen hata: ${error}` }
  }
}

export async function deleteExpenseEntry(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("expense_entries").delete().eq("id", id)

    if (error) {
      console.error(`Database error deleting expense entry ${id}:`, error)
      return { success: false, message: `Gider kaydı silinirken hata: ${error.message}` }
    }

    revalidatePath("/financials/expenses")
    return { success: true, message: "Gider kaydı başarıyla silindi." }
  } catch (error) {
    console.error("Unexpected error deleting expense entry:", error)
    return { success: false, message: `Gider kaydı silinirken beklenmeyen hata: ${error}` }
  }
}

// Helper function to verify customer exists by MID
async function verifyCustomerByMID(supabase: any, mid: string): Promise<boolean> {
  try {
    const { data: customer, error } = await supabase.from("customers").select("mid").eq("mid", mid).single()

    if (error || !customer) {
      console.error(`Customer with MID ${mid} not found.`, error)
      return false
    }
    return true
  } catch (error) {
    console.error(`Error verifying customer MID ${mid}:`, error)
    return false
  }
}

// Helper function to verify supplier exists by ID
async function verifySupplierById(supabase: any, id: string): Promise<boolean> {
  try {
    const { data: supplier, error } = await supabase.from("suppliers").select("id").eq("id", id).single()

    if (error || !supplier) {
      console.error(`Supplier with ID ${id} not found.`, error)
      return false
    }
    return true
  } catch (error) {
    console.error(`Error verifying supplier ID ${id}:`, error)
    return false
  }
}

// Server Actions
export async function createIncomeEntryAction(
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string; errors?: z.ZodIssue[] }> {
  try {
    const supabase = createClient()
    const rawData = Object.fromEntries(formData)

    console.log("Raw form data:", rawData)

    const validatedFields = IncomeEntrySchema.safeParse(rawData)

    if (!validatedFields.success) {
      console.log("Validation errors:", validatedFields.error.issues)
      return {
        success: false,
        message: "Lütfen aşağıdaki hataları düzeltin ve tekrar deneyin.",
        errors: validatedFields.error.issues,
      }
    }

    const {
      description,
      incoming_amount,
      entry_date,
      category_id,
      source,
      customer_id,
      invoice_number,
      payment_method,
      notes,
    } = validatedFields.data

    console.log("Validated data:", validatedFields.data)

    // Handle customer_id - if provided and not "none", verify it exists
    let finalCustomerId: string | null = null
    if (customer_id && customer_id !== "none") {
      const customerExists = await verifyCustomerByMID(supabase, customer_id)
      if (!customerExists) {
        return { success: false, message: `Seçilen müşteri (${customer_id}) bulunamadı.` }
      }
      finalCustomerId = customer_id // Use MID directly as customer_id
    }

    const { error } = await supabase.from("income_entries").insert({
      description,
      incoming_amount,
      entry_date,
      category_id,
      source,
      customer_id: finalCustomerId,
      invoice_number,
      payment_method,
      notes,
      amount: incoming_amount,
    })

    if (error) {
      console.error("Income entry creation error:", error)
      return { success: false, message: `Gelir kaydı oluşturulurken hata: ${error.message}` }
    }

    revalidatePath("/financials")
    revalidatePath("/financials/income")
    return { success: true, message: "Gelir kaydı başarıyla oluşturuldu." }
  } catch (error) {
    console.error("Unexpected error creating income entry:", error)
    return { success: false, message: `Gelir kaydı oluşturulurken beklenmeyen hata: ${error}` }
  }
}

export async function updateIncomeEntryAction(
  id: number,
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string; errors?: z.ZodIssue[] }> {
  try {
    const supabase = createClient()
    const rawData = Object.fromEntries(formData)

    console.log("Raw update form data:", rawData)

    const validatedFields = IncomeEntrySchema.safeParse(rawData)

    if (!validatedFields.success) {
      console.log("Update validation errors:", validatedFields.error.issues)
      return {
        success: false,
        message: "Lütfen aşağıdaki hataları düzeltin ve tekrar deneyin.",
        errors: validatedFields.error.issues,
      }
    }

    const {
      description,
      incoming_amount,
      entry_date,
      category_id,
      source,
      customer_id,
      invoice_number,
      payment_method,
      notes,
    } = validatedFields.data

    // Handle customer_id - if provided and not "none", verify it exists
    let finalCustomerId: string | null = null
    if (customer_id && customer_id !== "none") {
      const customerExists = await verifyCustomerByMID(supabase, customer_id)
      if (!customerExists) {
        return { success: false, message: `Seçilen müşteri (${customer_id}) bulunamadı.` }
      }
      finalCustomerId = customer_id // Use MID directly as customer_id
    }

    const { error } = await supabase
      .from("income_entries")
      .update({
        description,
        incoming_amount,
        entry_date,
        category_id,
        source,
        customer_id: finalCustomerId,
        invoice_number,
        payment_method,
        notes,
        amount: incoming_amount,
      })
      .eq("id", id)

    if (error) {
      console.error("Income entry update error:", error)
      return { success: false, message: `Gelir kaydı güncellenirken hata: ${error.message}` }
    }

    revalidatePath("/financials")
    revalidatePath("/financials/income")
    revalidatePath(`/financials/income/${id}`)
    return { success: true, message: "Gelir kaydı başarıyla güncellendi." }
  } catch (error) {
    console.error("Unexpected error updating income entry:", error)
    return { success: false, message: `Gelir kaydı güncellenirken beklenmeyen hata: ${error}` }
  }
}

export async function createExpenseEntryAction(
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string; errors?: z.ZodIssue[] }> {
  try {
    const supabase = createClient()
    const rawData = Object.fromEntries(formData)

    console.log("🔍 Raw expense form data:", rawData)

    const validatedFields = ExpenseEntrySchema.safeParse(rawData)

    if (!validatedFields.success) {
      console.log("❌ Expense validation errors:", validatedFields.error.issues)
      return {
        success: false,
        message: "Lütfen aşağıdaki hataları düzeltin ve tekrar deneyin.",
        errors: validatedFields.error.issues,
      }
    }

    const {
      description,
      expense_amount,
      payment_amount,
      expense_title,
      expense_source,
      entry_date,
      category_id,
      supplier_id,
      invoice_number,
      payment_method,
      notes,
    } = validatedFields.data

    console.log("✅ Validated expense data:", validatedFields.data)

    // Handle supplier_id - if provided and not "none", verify it exists
    let finalSupplierId: string | null = null
    if (supplier_id && supplier_id !== "none" && supplier_id !== "no-supplier") {
      console.log(`🔍 Verifying supplier ID: ${supplier_id}`)
      const supplierExists = await verifySupplierById(supabase, supplier_id)
      if (!supplierExists) {
        console.log(`❌ Supplier ${supplier_id} not found`)
        return { success: false, message: `Seçilen tedarikçi bulunamadı.` }
      }
      finalSupplierId = supplier_id
      console.log(`✅ Supplier verified: ${finalSupplierId}`)
    } else {
      console.log("ℹ️ No supplier selected or 'no-supplier' selected")
    }

    const insertData = {
      description,
      expense_amount,
      payment_amount,
      expense_title,
      expense_source,
      entry_date,
      category_id,
      supplier_id: finalSupplierId,
      invoice_number,
      payment_method,
      notes,
      amount: expense_amount,
    }

    console.log("📝 Inserting expense data:", insertData)

    const { error } = await supabase.from("expense_entries").insert(insertData)

    if (error) {
      console.error("❌ Expense entry creation error:", error)
      return { success: false, message: `Gider kaydı oluşturulurken hata: ${error.message}` }
    }

    console.log("✅ Expense entry created successfully")

    revalidatePath("/financials")
    revalidatePath("/financials/expenses")
    return { success: true, message: "Gider kaydı başarıyla oluşturuldu." }
  } catch (error) {
    console.error("💥 Unexpected error creating expense entry:", error)
    return { success: false, message: `Gider kaydı oluşturulurken beklenmeyen hata: ${error}` }
  }
}

export async function createIncomeEntry(formData: FormData) {
  try {
    const supabase = await createClient()

    // Get form data
    const amount = Number.parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const customerMid = formData.get("customer_mid") as string
    const paymentMethod = formData.get("payment_method") as string

    // Validate required fields
    if (!amount || !description || !date) {
      return { success: false, error: "Gerekli alanlar eksik" }
    }

    // Verify customer exists if provided
    if (customerMid && customerMid !== "") {
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("mid")
        .eq("mid", customerMid)
        .single()

      if (customerError || !customer) {
        return { success: false, error: "Seçilen müşteri bulunamadı" }
      }
    }

    // Insert income entry
    const { error } = await supabase.from("financial_entries").insert({
      type: "income",
      amount,
      description,
      date,
      customer_mid: customerMid || null,
      payment_method: paymentMethod || null,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: `Gelir kaydı oluşturulurken hata: ${error.message}` }
    }

    revalidatePath("/financials/income")
    return { success: true, error: null }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function createExpenseEntry(formData: FormData) {
  try {
    const supabase = await createClient()

    // Get form data
    const amount = Number.parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const date = formData.get("date") as string
    const supplierIdStr = formData.get("supplier_id") as string
    const paymentMethod = formData.get("payment_method") as string

    // Validate required fields
    if (!amount || !description || !date) {
      return { success: false, error: "Gerekli alanlar eksik" }
    }

    // Convert supplier_id to UUID if provided
    let supplierId: string | null = null
    if (supplierIdStr && supplierIdStr !== "") {
      supplierId = supplierIdStr

      // Verify supplier exists
      const { data: supplier, error: supplierError } = await supabase
        .from("suppliers")
        .select("id")
        .eq("id", supplierId)
        .single()

      if (supplierError || !supplier) {
        return { success: false, error: "Seçilen tedarikçi bulunamadı" }
      }
    }

    // Insert expense entry
    const { error } = await supabase.from("financial_entries").insert({
      type: "expense",
      amount,
      description,
      date,
      supplier_id: supplierId,
      payment_method: paymentMethod || null,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: `Gider kaydı oluşturulurken hata: ${error.message}` }
    }

    revalidatePath("/financials/expenses")
    return { success: true, error: null }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}
