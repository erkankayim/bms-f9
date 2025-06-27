"use client"

import { useEffect, useState } from "react"
import { getFinancialCategories, type FinancialCategory } from "../_actions/financial-entries-actions"
import { CategoryManager } from "../_components/category-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle, Tag } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CategoriesPage() {
  const [incomeCategories, setIncomeCategories] = useState<FinancialCategory[]>([])
  const [expenseCategories, setExpenseCategories] = useState<FinancialCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    setLoading(true)
    setError(null)

    try {
      const [incomeResult, expenseResult] = await Promise.all([
        getFinancialCategories("income"),
        getFinancialCategories("expense"),
      ])

      if (incomeResult.error) {
        throw new Error(incomeResult.error)
      }
      if (expenseResult.error) {
        throw new Error(expenseResult.error)
      }

      setIncomeCategories(incomeResult.data || [])
      setExpenseCategories(expenseResult.data || [])
    } catch (err: any) {
      setError(err.message || "Kategoriler yüklenirken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Kategoriler yükleniyor...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-2">
        <Tag className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Kategori Yönetimi</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Finansal Kategoriler</CardTitle>
          <CardDescription>
            Gelir ve gider kategorilerinizi yönetin. Bu kategoriler finansal kayıtlarınızı organize etmenize yardımcı
            olur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="income" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="income">Gelir Kategorileri ({incomeCategories.length})</TabsTrigger>
              <TabsTrigger value="expense">Gider Kategorileri ({expenseCategories.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="income" className="mt-6">
              <CategoryManager categories={incomeCategories} type="income" onCategoryCreated={fetchCategories} />
            </TabsContent>
            <TabsContent value="expense" className="mt-6">
              <CategoryManager categories={expenseCategories} type="expense" onCategoryCreated={fetchCategories} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
