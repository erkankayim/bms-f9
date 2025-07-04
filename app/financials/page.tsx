"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Users, Building, Calendar } from "lucide-react"
import Link from "next/link"
import { getFinancialSummary } from "./_actions/financials-actions"

type FinancialSummary = {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  incomeCount: number
  expenseCount: number
  recentIncomes: Array<{
    id: number
    description: string
    incoming_amount: number
    entry_date: string
    customer_name?: string
  }>
  recentExpenses: Array<{
    id: number
    description: string
    expense_amount: number
    entry_date: string
    supplier_name?: string
  }>
}

export default function FinancialsPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSummary() {
      try {
        const result = await getFinancialSummary()
        if (result.data) {
          setSummary(result.data)
        } else {
          setError(result.error || "Veri yüklenirken hata oluştu")
        }
      } catch (err) {
        setError("Beklenmeyen bir hata oluştu")
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finansal Yönetim</h1>
          <p className="text-muted-foreground">Gelir ve giderlerinizi takip edin, raporlarınızı görüntüleyin</p>
        </div>
        <div className="flex gap-2">
          <Link href="/financials/income/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Gelir Ekle
            </Button>
          </Link>
          <Link href="/financials/expenses/new">
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Gider Ekle
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₺{summary?.totalIncome.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">{summary?.incomeCount || 0} kayıt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₺{summary?.totalExpenses.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">{summary?.expenseCount || 0} kayıt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Kâr/Zarar</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(summary?.netProfit || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₺{summary?.netProfit.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Bu ay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hızlı İşlemler</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/financials/chart-of-accounts">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                Hesap Planı
              </Button>
            </Link>
            <Link href="/customers">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Users className="mr-2 h-3 w-3" />
                Müşteriler
              </Button>
            </Link>
            <Link href="/suppliers">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Building className="mr-2 h-3 w-3" />
                Tedarikçiler
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Son Gelirler
            </CardTitle>
            <CardDescription>En son kaydedilen gelir işlemleri</CardDescription>
          </CardHeader>
          <CardContent>
            {summary?.recentIncomes && summary.recentIncomes.length > 0 ? (
              <div className="space-y-3">
                {summary.recentIncomes.map((income) => (
                  <div key={income.id} className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{income.description}</p>
                      {income.customer_name && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {income.customer_name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(income.entry_date).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      +₺{income.incoming_amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Henüz gelir kaydı bulunmuyor.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Son Giderler
            </CardTitle>
            <CardDescription>En son kaydedilen gider işlemleri</CardDescription>
          </CardHeader>
          <CardContent>
            {summary?.recentExpenses && summary.recentExpenses.length > 0 ? (
              <div className="space-y-3">
                {summary.recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{expense.description}</p>
                      {expense.supplier_name && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {expense.supplier_name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(expense.entry_date).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-red-600">
                      -₺{expense.expense_amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Henüz gider kaydı bulunmuyor.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
