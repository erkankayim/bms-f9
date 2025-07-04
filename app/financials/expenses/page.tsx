"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Search, Receipt, TrendingDown, CreditCard, AlertCircle, Eye, Edit, Trash2 } from "lucide-react"
import { getExpenseEntries } from "./_actions/expense-actions"
import { DeleteExpenseDialog } from "./[id]/_components/delete-expense-dialog"

interface ExpenseEntry {
  id: string
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
  created_at: string
  supplier_name: string | null
  category_name: string | null
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null)

  useEffect(() => {
    async function fetchExpenses() {
      try {
        setLoading(true)
        setError(null)
        const data = await getExpenseEntries()
        setExpenses(data)
        setFilteredExpenses(data)
      } catch (err) {
        console.error("Error fetching expenses:", err)
        setError(err instanceof Error ? err.message : "Gider kayıtları yüklenirken hata oluştu")
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [])

  useEffect(() => {
    let filtered = expenses

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (expense) =>
          expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.expense_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.expense_source.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.category_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Payment method filter
    if (paymentMethodFilter !== "all") {
      filtered = filtered.filter((expense) => expense.payment_method === paymentMethodFilter)
    }

    setFilteredExpenses(filtered)
  }, [expenses, searchTerm, paymentMethodFilter])

  const handleDeleteExpense = (expenseId: string) => {
    setExpenseToDelete(expenseId)
    setDeleteDialogOpen(true)
  }

  const onDeleteSuccess = () => {
    // Refresh the expenses list
    setExpenses((prev) => prev.filter((expense) => expense.id !== expenseToDelete))
    setDeleteDialogOpen(false)
    setExpenseToDelete(null)
  }

  // Calculate summary statistics
  const totalExpenseAmount = filteredExpenses.reduce((sum, expense) => sum + expense.expense_amount, 0)
  const totalPaymentAmount = filteredExpenses.reduce((sum, expense) => sum + expense.payment_amount, 0)
  const totalOutstanding = totalExpenseAmount - totalPaymentAmount

  const paymentMethods = Array.from(new Set(expenses.map((expense) => expense.payment_method)))

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
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
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gider Yönetimi</h1>
          <p className="text-muted-foreground">Gider kayıtlarınızı görüntüleyin ve yönetin</p>
        </div>
        <Button asChild>
          <Link href="/financials/expenses/new">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Gider
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpenseAmount.toLocaleString("tr-TR")} ₺</div>
            <p className="text-xs text-muted-foreground">{filteredExpenses.length} kayıt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ödeme</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalPaymentAmount.toLocaleString("tr-TR")} ₺</div>
            <p className="text-xs text-muted-foreground">Ödenen tutar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kalan Borç</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalOutstanding > 0 ? "text-red-600" : "text-green-600"}`}>
              {totalOutstanding.toLocaleString("tr-TR")} ₺
            </div>
            <p className="text-xs text-muted-foreground">Ödenmemiş tutar</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
          <CardDescription>Gider kayıtlarını filtrelemek için aşağıdaki seçenekleri kullanın</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Gider ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Ödeme yöntemi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Ödeme Yöntemleri</SelectItem>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gider Kayıtları</CardTitle>
          <CardDescription>
            {filteredExpenses.length} kayıt gösteriliyor
            {searchTerm || paymentMethodFilter !== "all" ? ` (${expenses.length} toplam kayıt)` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gider kaydı bulunamadı</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || paymentMethodFilter !== "all"
                  ? "Arama kriterlerinize uygun gider kaydı bulunamadı."
                  : "Henüz hiç gider kaydı eklenmemiş."}
              </p>
              {!searchTerm && paymentMethodFilter === "all" && (
                <Button asChild>
                  <Link href="/financials/expenses/new">
                    <Plus className="mr-2 h-4 w-4" />
                    İlk Gider Kaydını Ekle
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Başlık</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Tedarikçi</TableHead>
                    <TableHead>Gider Tutarı</TableHead>
                    <TableHead>Ödenen</TableHead>
                    <TableHead>Ödeme Yöntemi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => {
                    const isFullyPaid = expense.payment_amount >= expense.expense_amount
                    const outstandingAmount = expense.expense_amount - expense.payment_amount

                    return (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">
                          {new Date(expense.entry_date).toLocaleDateString("tr-TR")}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{expense.expense_title}</div>
                            <div className="text-sm text-muted-foreground">{expense.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.category_name || "Kategori Yok"}</Badge>
                        </TableCell>
                        <TableCell>{expense.supplier_name || "-"}</TableCell>
                        <TableCell className="font-medium">
                          {expense.expense_amount.toLocaleString("tr-TR")} ₺
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {expense.payment_amount.toLocaleString("tr-TR")} ₺
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{expense.payment_method}</Badge>
                        </TableCell>
                        <TableCell>
                          {isFullyPaid ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Ödendi
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Borç: {outstandingAmount.toLocaleString("tr-TR")} ₺</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/financials/expenses/${expense.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/financials/expenses/${expense.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <DeleteExpenseDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        expenseId={expenseToDelete || ""}
        onSuccess={onDeleteSuccess}
      />
    </div>
  )
}
