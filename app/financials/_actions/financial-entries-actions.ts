"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Helper function to get financial categories
export async function getFinancialCategories(type: "income" | "expense" = "income") {
  const supabase = createClient()

  try {
    console.log(`Fetching ${type} categories...`)

    // Try to get categories from chart_of_accounts table
    const { data, error } = await supabase.from("chart_of_accounts").select("id, name, type, description").order("name")

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

    // Transform chart_of_accounts data to match expected format
    const transformedData =
      data?.map((item) => ({
        id: item.id,
        name: item.name,
        type: type,
        description: item.description,
      })) || []

    console.log(`Found ${transformedData.length} ${type} categories in database`)
    return { data: transformedData }
  } catch (error) {
    console.error("Unexpected error fetching financial categories:", error)
    return { error: `Finansal kategoriler alınırken beklenmeyen hata: ${error}` }
  }
}

// Helper function to get customers for dropdown
export async function getCustomersForDropdown() {
  const supabase = createClient()

  try {
    const { data: customers, error } = await supabase
      .from("customers")
      .select("mid, contact_name, email")
      .order("contact_name")

    if (error) {
      console.error("Error fetching customers:", error)
      return { error: "Müşteriler yüklenemedi" }
    }

    return { data: customers || [] }
  } catch (error) {
    console.error("Error in getCustomersForDropdown:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Helper function to get suppliers for dropdown
export async function getSuppliersForDropdown() {
  const supabase = createClient()

  try {
    const { data: suppliers, error } = await supabase
      .from("suppliers")
      .select("id, company_name, contact_name")
      .order("company_name")

    if (error) {
      console.error("Error fetching suppliers:", error)
      return { error: "Tedarikçiler yüklenemedi" }
    }

    return { data: suppliers || [] }
  } catch (error) {
    console.error("Error in getSuppliersForDropdown:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Income entries functions
export async function getIncomeEntries() {
  const supabase = createClient()

  try {
    const { data: entries, error } = await supabase
      .from("income_entries")
      .select(`
        id,
        entry_date,
        description,
        incoming_amount,
        source,
        invoice_number,
        payment_method,
        notes,
        customer_id,
        customers!customer_id(contact_name),
        created_at
      `)
      .order("entry_date", { ascending: false })

    if (error) {
      console.error("Error fetching income entries:", error)
      return { error: "Gelir kayıtları yüklenemedi" }
    }

    // Transform the data to match expected format
    const transformedEntries =
      entries?.map((entry) => ({
        id: entry.id,
        entry_date: entry.entry_date,
        description: entry.description,
        incoming_amount: entry.incoming_amount,
        source: entry.source,
        invoice_number: entry.invoice_number,
        payment_method: entry.payment_method,
        notes: entry.notes,
        customer_id: entry.customer_id,
        category_id: 1, // Default category
        customer_name: entry.customers?.contact_name || null,
        category_name: entry.source || "Gelir",
        created_at: entry.created_at,
      })) || []

    return { data: transformedEntries }
  } catch (error) {
    console.error("Error in getIncomeEntries:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function getIncomeEntryById(id: string) {
  const supabase = createClient()

  try {
    const { data: entry, error } = await supabase
      .from("income_entries")
      .select(`
        id,
        entry_date,
        description,
        incoming_amount,
        source,
        invoice_number,
        payment_method,
        notes,
        customer_id,
        customers!customer_id(contact_name),
        created_at
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching income entry:", error)
      return { error: "Gelir kaydı bulunamadı" }
    }

    // Transform the data
    const transformedEntry = {
      id: entry.id,
      entry_date: entry.entry_date,
      description: entry.description,
      incoming_amount: entry.incoming_amount,
      source: entry.source,
      invoice_number: entry.invoice_number,
      payment_method: entry.payment_method,
      notes: entry.notes,
      customer_id: entry.customer_id,
      category_id: 1, // Default category
      customer_name: entry.customers?.contact_name || null,
      category_name: entry.source || "Gelir",
      created_at: entry.created_at,
    }

    return { data: transformedEntry }
  } catch (error) {
    console.error("Error in getIncomeEntryById:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function createIncomeEntryAction(prevState: any, formData: FormData) {
  const supabase = createClient()

  try {
    const entryDate = formData.get("entry_date") as string
    const description = formData.get("description") as string
    const incomingAmount = Number.parseFloat(formData.get("incoming_amount") as string)
    const source = formData.get("source") as string
    const invoiceNumber = formData.get("invoice_number") as string
    const paymentMethod = formData.get("payment_method") as string
    const notes = formData.get("notes") as string
    const customerId = formData.get("customer_id") as string

    // Validation
    const errors = []
    if (!entryDate) errors.push({ path: ["entry_date"], message: "Tarih gereklidir" })
    if (!description) errors.push({ path: ["description"], message: "Açıklama gereklidir" })
    if (!incomingAmount || incomingAmount <= 0)
      errors.push({ path: ["incoming_amount"], message: "Geçerli bir tutar giriniz" })
    if (!source) errors.push({ path: ["source"], message: "Gelir kaynağı gereklidir" })
    if (!paymentMethod) errors.push({ path: ["payment_method"], message: "Ödeme şekli gereklidir" })

    if (errors.length > 0) {
      return {
        success: false,
        message: "Form hatası",
        errors,
      }
    }

    const { error } = await supabase.from("income_entries").insert({
      entry_date: entryDate,
      description,
      incoming_amount: incomingAmount,
      source,
      invoice_number: invoiceNumber || null,
      payment_method: paymentMethod,
      notes: notes || null,
      customer_id: customerId && customerId !== "none" ? customerId : null,
    })

    if (error) {
      console.error("Error creating income entry:", error)
      return {
        success: false,
        message: "Gelir kaydı oluşturulamadı",
        errors: [],
      }
    }

    revalidatePath("/financials/income")
    return {
      success: true,
      message: "Gelir kaydı başarıyla oluşturuldu",
      errors: [],
    }
  } catch (error) {
    console.error("Error in createIncomeEntryAction:", error)
    return {
      success: false,
      message: "Beklenmeyen bir hata oluştu",
      errors: [],
    }
  }
}

export async function updateIncomeEntryAction(id: string, prevState: any, formData: FormData) {
  const supabase = createClient()

  try {
    const entryDate = formData.get("entry_date") as string
    const description = formData.get("description") as string
    const incomingAmount = Number.parseFloat(formData.get("incoming_amount") as string)
    const source = formData.get("source") as string
    const invoiceNumber = formData.get("invoice_number") as string
    const paymentMethod = formData.get("payment_method") as string
    const notes = formData.get("notes") as string
    const customerId = formData.get("customer_id") as string

    // Validation
    const errors = []
    if (!entryDate) errors.push({ path: ["entry_date"], message: "Tarih gereklidir" })
    if (!description) errors.push({ path: ["description"], message: "Açıklama gereklidir" })
    if (!incomingAmount || incomingAmount <= 0)
      errors.push({ path: ["incoming_amount"], message: "Geçerli bir tutar giriniz" })
    if (!source) errors.push({ path: ["source"], message: "Gelir kaynağı gereklidir" })
    if (!paymentMethod) errors.push({ path: ["payment_method"], message: "Ödeme şekli gereklidir" })

    if (errors.length > 0) {
      return {
        success: false,
        message: "Form hatası",
        errors,
      }
    }

    const { error } = await supabase
      .from("income_entries")
      .update({
        entry_date: entryDate,
        description,
        incoming_amount: incomingAmount,
        source,
        invoice_number: invoiceNumber || null,
        payment_method: paymentMethod,
        notes: notes || null,
        customer_id: customerId && customerId !== "none" ? customerId : null,
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating income entry:", error)
      return {
        success: false,
        message: "Gelir kaydı güncellenemedi",
        errors: [],
      }
    }

    revalidatePath("/financials/income")
    revalidatePath(`/financials/income/${id}`)
    return {
      success: true,
      message: "Gelir kaydı başarıyla güncellendi",
      errors: [],
    }
  } catch (error) {
    console.error("Error in updateIncomeEntryAction:", error)
    return {
      success: false,
      message: "Beklenmeyen bir hata oluştu",
      errors: [],
    }
  }
}

export async function deleteIncomeEntry(id: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("income_entries").delete().eq("id", id)

    if (error) {
      console.error("Error deleting income entry:", error)
      return { error: "Gelir kaydı silinemedi" }
    }

    revalidatePath("/financials/income")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteIncomeEntry:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Expense entries functions
export async function getExpenseEntries() {
  const supabase = createClient()

  try {
    const { data: entries, error } = await supabase
      .from("expense_entries")
      .select(`
        id,
        entry_date,
        description,
        outgoing_amount,
        category,
        payment_method,
        notes,
        supplier_id,
        suppliers!supplier_id(company_name),
        created_at
      `)
      .order("entry_date", { ascending: false })

    if (error) {
      console.error("Error fetching expense entries:", error)
      return { error: "Gider kayıtları yüklenemedi" }
    }

    // Transform the data
    const transformedEntries =
      entries?.map((entry) => ({
        id: entry.id,
        entry_date: entry.entry_date,
        description: entry.description,
        expense_amount: entry.outgoing_amount,
        payment_amount: entry.outgoing_amount,
        expense_title: entry.description,
        expense_source: entry.category,
        invoice_number: null,
        payment_method: entry.payment_method,
        notes: entry.notes,
        supplier_id: entry.supplier_id,
        supplier_name: entry.suppliers?.company_name || null,
        category_name: entry.category,
        created_at: entry.created_at,
      })) || []

    return { data: transformedEntries }
  } catch (error) {
    console.error("Error in getExpenseEntries:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function getExpenseEntryById(id: string) {
  const supabase = createClient()

  try {
    const { data: entry, error } = await supabase
      .from("expense_entries")
      .select(`
        id,
        entry_date,
        description,
        outgoing_amount,
        category,
        payment_method,
        notes,
        supplier_id,
        suppliers!supplier_id(company_name),
        created_at
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching expense entry:", error)
      return { error: "Gider kaydı bulunamadı" }
    }

    // Transform the data
    const transformedEntry = {
      id: entry.id,
      entry_date: entry.entry_date,
      description: entry.description,
      expense_amount: entry.outgoing_amount,
      payment_amount: entry.outgoing_amount,
      expense_title: entry.description,
      expense_source: entry.category,
      invoice_number: null,
      payment_method: entry.payment_method,
      notes: entry.notes,
      supplier_id: entry.supplier_id,
      supplier_name: entry.suppliers?.company_name || null,
      category_name: entry.category,
      created_at: entry.created_at,
    }

    return { data: transformedEntry }
  } catch (error) {
    console.error("Error in getExpenseEntryById:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

export async function createExpenseEntryAction(prevState: any, formData: FormData) {
  const supabase = createClient()

  try {
    const entryDate = formData.get("entry_date") as string
    const description = formData.get("description") as string
    const outgoingAmount = Number.parseFloat(formData.get("outgoing_amount") as string)
    const category = formData.get("category") as string
    const paymentMethod = formData.get("payment_method") as string
    const notes = formData.get("notes") as string
    const supplierId = formData.get("supplier_id") as string

    // Validation
    const errors = []
    if (!entryDate) errors.push({ path: ["entry_date"], message: "Tarih gereklidir" })
    if (!description) errors.push({ path: ["description"], message: "Açıklama gereklidir" })
    if (!outgoingAmount || outgoingAmount <= 0)
      errors.push({ path: ["outgoing_amount"], message: "Geçerli bir tutar giriniz" })
    if (!category) errors.push({ path: ["category"], message: "Kategori gereklidir" })
    if (!paymentMethod) errors.push({ path: ["payment_method"], message: "Ödeme şekli gereklidir" })

    if (errors.length > 0) {
      return {
        success: false,
        message: "Form hatası",
        errors,
      }
    }

    const { error } = await supabase.from("expense_entries").insert({
      entry_date: entryDate,
      description,
      outgoing_amount: outgoingAmount,
      category,
      payment_method: paymentMethod,
      notes: notes || null,
      supplier_id: supplierId || null,
    })

    if (error) {
      console.error("Error creating expense entry:", error)
      return {
        success: false,
        message: "Gider kaydı oluşturulamadı",
        errors: [],
      }
    }

    revalidatePath("/financials/expenses")
    return {
      success: true,
      message: "Gider kaydı başarıyla oluşturuldu",
      errors: [],
    }
  } catch (error) {
    console.error("Error in createExpenseEntryAction:", error)
    return {
      success: false,
      message: "Beklenmeyen bir hata oluştu",
      errors: [],
    }
  }
}

export async function updateExpenseEntryAction(id: string, prevState: any, formData: FormData) {
  const supabase = createClient()

  try {
    const entryDate = formData.get("entry_date") as string
    const description = formData.get("description") as string
    const outgoingAmount = Number.parseFloat(formData.get("outgoing_amount") as string)
    const category = formData.get("category") as string
    const paymentMethod = formData.get("payment_method") as string
    const notes = formData.get("notes") as string
    const supplierId = formData.get("supplier_id") as string

    // Validation
    const errors = []
    if (!entryDate) errors.push({ path: ["entry_date"], message: "Tarih gereklidir" })
    if (!description) errors.push({ path: ["description"], message: "Açıklama gereklidir" })
    if (!outgoingAmount || outgoingAmount <= 0)
      errors.push({ path: ["outgoing_amount"], message: "Geçerli bir tutar giriniz" })
    if (!category) errors.push({ path: ["category"], message: "Kategori gereklidir" })
    if (!paymentMethod) errors.push({ path: ["payment_method"], message: "Ödeme şekli gereklidir" })

    if (errors.length > 0) {
      return {
        success: false,
        message: "Form hatası",
        errors,
      }
    }

    const { error } = await supabase
      .from("expense_entries")
      .update({
        entry_date: entryDate,
        description,
        outgoing_amount: outgoingAmount,
        category,
        payment_method: paymentMethod,
        notes: notes || null,
        supplier_id: supplierId || null,
      })
      .eq("id", id)

    if (error) {
      console.error("Error updating expense entry:", error)
      return {
        success: false,
        message: "Gider kaydı güncellenemedi",
        errors: [],
      }
    }

    revalidatePath("/financials/expenses")
    revalidatePath(`/financials/expenses/${id}`)
    return {
      success: true,
      message: "Gider kaydı başarıyla güncellendi",
      errors: [],
    }
  } catch (error) {
    console.error("Error in updateExpenseEntryAction:", error)
    return {
      success: false,
      message: "Beklenmeyen bir hata oluştu",
      errors: [],
    }
  }
}

export async function deleteExpenseEntry(id: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("expense_entries").delete().eq("id", id)

    if (error) {
      console.error("Error deleting expense entry:", error)
      return { error: "Gider kaydı silinemedi" }
    }

    revalidatePath("/financials/expenses")
    return { success: true }
  } catch (error) {
    console.error("Error in deleteExpenseEntry:", error)
    return { error: "Beklenmeyen bir hata oluştu" }
  }
}

// Legacy aliases for backward compatibility
export const createIncomeEntry = createIncomeEntryAction
export const createExpenseEntry = createExpenseEntryAction
export const updateIncomeEntry = updateIncomeEntryAction
export const updateExpenseEntry = updateExpenseEntryAction

// Bu fonksiyonlar veritabanından çekilebilir, şimdilik sabit.
export async function getIncomeCategories() {
  return [
    { id: "sales", name: "Satış Geliri" },
    { id: "service", name: "Hizmet Bedeli" },
    { id: "consulting", name: "Danışmanlık" },
    { id: "other", name: "Diğer" },
  ]
}

export async function getExpenseCategories() {
  return [
    { id: "rent", name: "Kira" },
    { id: "salary", name: "Maaş Ödemeleri" },
    { id: "utilities", name: "Faturalar (Elektrik, Su, İnternet)" },
    { id: "marketing", name: "Pazarlama ve Reklam" },
    { id: "supplies", name: "Ofis Malzemeleri" },
    { id: "raw_material", name: "Hammadde Alımı" },
    { id: "other", name: "Diğer" },
  ]
}

export async function getSuppliersForSelect() {
  const supabase = createClient()
  const { data, error } = await supabase.from("suppliers").select("id, name").is("deleted_at", null)
  if (error) return []
  return data
}

export async function getCustomersForSelect() {
  const supabase = createClient()
  const { data, error } = await supabase.from("customers").select("mid, contact_name").is("deleted_at", null)
  if (error) return []
  return data
}
