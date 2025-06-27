"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { IncomeFormSchema, ExpenseFormSchema } from "../_lib/schema"

// DATA FETCHING
export async function getFinancialSummary() {
  const supabase = createClient()
  const { data: incomeData } = await supabase.from("income_entries").select("incoming_amount")
  const { data: expenseData } = await supabase.from("expense_entries").select("expense_amount")

  const totalIncome = incomeData?.reduce((sum, entry) => sum + entry.incoming_amount, 0) || 0
  const totalExpense = expenseData?.reduce((sum, entry) => sum + entry.expense_amount, 0) || 0

  return {
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense,
    incomeCount: incomeData?.length || 0,
    expenseCount: expenseData?.length || 0,
  }
}

export async function getIncomeEntries() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("income_entries")
    .select("*, customers(contact_name), financial_categories(name)")
    .order("entry_date", { ascending: false })

  if (error) {
    console.error("Error fetching income entries:", error)
    return []
  }
  return data
}

export async function getExpenseEntries() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("expense_entries")
    .select("*, suppliers(name), financial_categories(name)")
    .order("entry_date", { ascending: false })

  if (error) {
    console.error("Error fetching expense entries:", error)
    return []
  }
  return data
}

export async function getFinancialCategories(type: "income" | "expense") {
  const supabase = createClient()
  const { data, error } = await supabase.from("financial_categories").select("*").eq("type", type).order("name")
  if (error) return []
  return data
}

export async function getCustomers() {
  const supabase = createClient()
  const { data, error } = await supabase.from("customers").select("mid, contact_name").order("contact_name")
  if (error) return []
  return data
}

export async function getSuppliers() {
  const supabase = createClient()
  const { data, error } = await supabase.from("suppliers").select("id, name").order("name")
  if (error) return []
  return data
}

// FORM ACTIONS
export async function createIncomeEntry(formData: FormData) {
  const validatedFields = IncomeFormSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = createClient()
  const { error } = await supabase.from("income_entries").insert({
    ...validatedFields.data,
    customer_id: validatedFields.data.customer_id === "none" ? null : validatedFields.data.customer_id,
  })

  if (error) {
    return { message: `Database Error: ${error.message}` }
  }

  revalidatePath("/financials/income")
  redirect("/financials/income")
}

export async function createExpenseEntry(formData: FormData) {
  const validatedFields = ExpenseFormSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = createClient()
  const { error } = await supabase.from("expense_entries").insert({
    ...validatedFields.data,
    supplier_id: validatedFields.data.supplier_id === "none" ? null : validatedFields.data.supplier_id,
    description: validatedFields.data.notes, // Mapping notes to description for now
    expense_source: "Manual", // Default value
  })

  if (error) {
    return { message: `Database Error: ${error.message}` }
  }

  revalidatePath("/financials/expenses")
  redirect("/financials/expenses")
}

// ---------- Income ----------
export async function createIncome(form: FormData) {
  console.log("createIncome →", Object.fromEntries(form))
  revalidatePath("/financials/income")
}
export async function deleteIncome(id: string) {
  console.log("deleteIncome →", id)
  revalidatePath("/financials/income")
}

// ---------- Expense ----------
export async function createExpense(form: FormData) {
  console.log("createExpense →", Object.fromEntries(form))
  revalidatePath("/financials/expenses")
}
export async function deleteExpense(id: string) {
  console.log("deleteExpense →", id)
  revalidatePath("/financials/expenses")
}
