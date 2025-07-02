"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { ExpenseEntrySchema, IncomeEntrySchema } from "../_lib/financial-entry-shared"

export async function createExpenseEntry(prevState: any, formData: FormData) {
  try {
    const supabase = createClient()

    // Form verilerini al
    const rawData = {
      description: formData.get("description") as string,
      amount: formData.get("amount") as string,
      category: formData.get("category") as string,
      account_id: formData.get("account_id") as string,
      entry_date: formData.get("entry_date") as string,
    }

    // Validation
    const validatedData = ExpenseEntrySchema.parse(rawData)

    // Kullanıcı bilgisini al
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return {
        success: false,
        message: "Kullanıcı doğrulaması başarısız",
      }
    }

    // Veritabanına kaydet
    const { error } = await supabase.from("expense_entries").insert({
      description: validatedData.description,
      amount: Number.parseFloat(validatedData.amount),
      category: validatedData.category,
      account_id: validatedData.account_id,
      entry_date: validatedData.entry_date,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Expense creation error:", error)
      return {
        success: false,
        message: "Gider kaydı oluşturulamadı: " + error.message,
      }
    }

    revalidatePath("/financials/expenses")
    return {
      success: true,
      message: "Gider kaydı başarıyla oluşturuldu",
    }
  } catch (error) {
    console.error("Expense creation error:", error)
    return {
      success: false,
      message: "Beklenmeyen bir hata oluştu",
    }
  }
}

export async function createIncomeEntry(prevState: any, formData: FormData) {
  try {
    const supabase = createClient()

    // Form verilerini al
    const rawData = {
      description: formData.get("description") as string,
      amount: formData.get("amount") as string,
      category: formData.get("category") as string,
      account_id: formData.get("account_id") as string,
      entry_date: formData.get("entry_date") as string,
    }

    // Validation
    const validatedData = IncomeEntrySchema.parse(rawData)

    // Kullanıcı bilgisini al
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return {
        success: false,
        message: "Kullanıcı doğrulaması başarısız",
      }
    }

    // Veritabanına kaydet
    const { error } = await supabase.from("income_entries").insert({
      description: validatedData.description,
      amount: Number.parseFloat(validatedData.amount),
      category: validatedData.category,
      account_id: validatedData.account_id,
      entry_date: validatedData.entry_date,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Income creation error:", error)
      return {
        success: false,
        message: "Gelir kaydı oluşturulamadı: " + error.message,
      }
    }

    revalidatePath("/financials/income")
    return {
      success: true,
      message: "Gelir kaydı başarıyla oluşturuldu",
    }
  } catch (error) {
    console.error("Income creation error:", error)
    return {
      success: false,
      message: "Beklenmeyen bir hata oluştu",
    }
  }
}

export async function updateExpenseEntry(id: string, prevState: any, formData: FormData) {
  try {
    const supabase = createClient()

    // Form verilerini al
    const rawData = {
      description: formData.get("description") as string,
      amount: formData.get("amount") as string,
      category: formData.get("category") as string,
      account_id: formData.get("account_id") as string,
      entry_date: formData.get("entry_date") as string,
    }

    // Validation
    const validatedData = ExpenseEntrySchema.parse(rawData)

    // Kullanıcı bilgisini al
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return {
        success: false,
        message: "Kullanıcı doğrulaması başarısız",
      }
    }

    // Veritabanını güncelle
    const { error } = await supabase
      .from("expense_entries")
      .update({
        description: validatedData.description,
        amount: Number.parseFloat(validatedData.amount),
        category: validatedData.category,
        account_id: validatedData.account_id,
        entry_date: validatedData.entry_date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Expense update error:", error)
      return {
        success: false,
        message: "Gider kaydı güncellenemedi: " + error.message,
      }
    }

    revalidatePath("/financials/expenses")
    revalidatePath(`/financials/expenses/${id}`)
    return {
      success: true,
      message: "Gider kaydı başarıyla güncellendi",
    }
  } catch (error) {
    console.error("Expense update error:", error)
    return {
      success: false,
      message: "Beklenmeyen bir hata oluştu",
    }
  }
}

export async function updateIncomeEntry(id: string, prevState: any, formData: FormData) {
  try {
    const supabase = createClient()

    // Form verilerini al
    const rawData = {
      description: formData.get("description") as string,
      amount: formData.get("amount") as string,
      category: formData.get("category") as string,
      account_id: formData.get("account_id") as string,
      entry_date: formData.get("entry_date") as string,
    }

    // Validation
    const validatedData = IncomeEntrySchema.parse(rawData)

    // Kullanıcı bilgisini al
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return {
        success: false,
        message: "Kullanıcı doğrulaması başarısız",
      }
    }

    // Veritabanını güncelle
    const { error } = await supabase
      .from("income_entries")
      .update({
        description: validatedData.description,
        amount: Number.parseFloat(validatedData.amount),
        category: validatedData.category,
        account_id: validatedData.account_id,
        entry_date: validatedData.entry_date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Income update error:", error)
      return {
        success: false,
        message: "Gelir kaydı güncellenemedi: " + error.message,
      }
    }

    revalidatePath("/financials/income")
    revalidatePath(`/financials/income/${id}`)
    return {
      success: true,
      message: "Gelir kaydı başarıyla güncellendi",
    }
  } catch (error) {
    console.error("Income update error:", error)
    return {
      success: false,
      message: "Beklenmeyen bir hata oluştu",
    }
  }
}
