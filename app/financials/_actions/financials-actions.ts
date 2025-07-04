"use server"

import { createClient } from "@/lib/supabase/server"

export async function getFinancialSummary() {
  const supabase = createClient()

  try {
    // Get income summary
    const { data: incomeData, error: incomeError } = await supabase.from("income_entries").select("incoming_amount")

    if (incomeError) throw incomeError

    // Get expense summary
    const { data: expenseData, error: expenseError } = await supabase.from("expense_entries").select("expense_amount")

    if (expenseError) throw expenseError

    // Get recent incomes with customer info
    const { data: recentIncomes, error: recentIncomesError } = await supabase
      .from("income_entries")
      .select(`
        id,
        description,
        incoming_amount,
        entry_date,
        customers!customer_id (
          contact_name
        )
      `)
      .order("entry_date", { ascending: false })
      .limit(5)

    if (recentIncomesError) throw recentIncomesError

    // Get recent expenses with supplier info
    const { data: recentExpenses, error: recentExpensesError } = await supabase
      .from("expense_entries")
      .select(`
        id,
        description,
        expense_amount,
        entry_date,
        suppliers!supplier_id (
          name
        )
      `)
      .order("entry_date", { ascending: false })
      .limit(5)

    if (recentExpensesError) throw recentExpensesError

    const totalIncome = incomeData?.reduce((sum, item) => sum + (item.incoming_amount || 0), 0) || 0
    const totalExpenses = expenseData?.reduce((sum, item) => sum + (item.expense_amount || 0), 0) || 0
    const netProfit = totalIncome - totalExpenses

    return {
      data: {
        totalIncome,
        totalExpenses,
        netProfit,
        incomeCount: incomeData?.length || 0,
        expenseCount: expenseData?.length || 0,
        recentIncomes:
          recentIncomes?.map((income) => ({
            id: income.id,
            description: income.description,
            incoming_amount: income.incoming_amount,
            entry_date: income.entry_date,
            customer_name: income.customers?.contact_name || null,
          })) || [],
        recentExpenses:
          recentExpenses?.map((expense) => ({
            id: expense.id,
            description: expense.description,
            expense_amount: expense.expense_amount,
            entry_date: expense.entry_date,
            supplier_name: expense.suppliers?.name || null,
          })) || [],
      },
    }
  } catch (error) {
    console.error("Financial summary error:", error)
    return {
      error: error instanceof Error ? error.message : "Finansal özet alınırken hata oluştu",
    }
  }
}
