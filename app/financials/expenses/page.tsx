"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Search, Download, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { getExpenseEntries } from "./_actions/expense-actions"
import { DeleteExpenseDialog } from "./[id]/_components/delete-expense-dialog"

type ExpenseEntry = {
  id: number
  description: string
  expense_amount: number
  payment_amount: number
  expense_title: string
  expense_source: string
  entry_date: string
  invoice_number?: string
  payment_method: string
  receipt_url?: string
  notes?: string
  supplier_name?: string
  category_name?: string
  created_at: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<ExpenseEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all")

  useEffect(() => {
    async function fetchExpenses() {
      try {
        const result = await getExpenseEntries()
        if (result.data) {
          setExpenses(result.data)
          setFilteredExpenses(result.data)
        } else {
          setError(result.error || "Veri yüklenirken hata oluştu")
        }
      } catch (err) {
        setError("Beklenmeyen bir hata oluştu")
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
          expense.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Payment method filter
    if (selectedPaymentMethod !== "all") {
      filtered = filtered.filter((expense) => expense.payment_method === selectedPaymentMethod)
    }

    setFilteredExpenses(filtered)
  }, [expenses, searchTerm, selectedPaymentMethod])

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.expense_amount, 0)
  const totalPayment = filteredExpenses.reduce((sum, expense) => sum + expense.payment_amount, 0)
  const paymentMethods = [...new Set(expenses.map((expense) => expense.payment_method))]

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
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gider Listesi</h1>
          <p className="text-muted-foreground">Tüm gider kayıtlarınızı görüntüleyin ve yönetin</p>
        </div>
        <Link href="/financials/expenses/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Gider Ekle
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₺{totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Filtrelenmiş kayıtlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ödeme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₺{totalPayment.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Ödenen tutar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kayıt Sayısı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredExpenses.length}</div>
            <p className="text-xs text-muted-foreground">Toplam {expenses.length} kayıt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borç Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ₺{(totalAmount - totalPayment).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Ödenmemiş tutar</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Açıklama, başlık, kaynak, tedarikçi veya fatura no ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">Tüm Ödeme Şekilleri</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Dışa Aktar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gider Kayıtları</CardTitle>
          <CardDescription>{filteredExpenses.length} kayıt gösteriliyor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Tedarikçi</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Gider Tutarı</TableHead>
                  <TableHead>Ödenen</TableHead>
                  <TableHead>Ödeme Şekli</TableHead>
                  <TableHead>Fatura No</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm || selectedPaymentMethod !== "all"
                          ? "Filtrelere uygun kayıt bulunamadı."
                          : "Henüz gider kaydı bulunmuyor."}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">
                        {new Date(expense.entry_date).toLocaleDateString("tr-TR")}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-32 truncate" title={expense.expense_title}>
                          {expense.expense_title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-48 truncate" title={expense.description}>
                          {expense.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        {expense.supplier_name ? (
                          <Badge variant="secondary">{expense.supplier_name}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {expense.category_name ? (
                          <Badge variant="outline">{expense.category_name}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-red-600">
                        ₺{expense.expense_amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="font-medium text-orange-600">
                        ₺{expense.payment_amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{expense.payment_method}</Badge>
                      </TableCell>
                      <TableCell>
                        {expense.invoice_number || <span className="text-muted-foreground text-sm">-</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/financials/expenses/${expense.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/financials/expenses/${expense.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DeleteExpenseDialog expenseId={expense.id.toString()} expenseTitle={expense.expense_title} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
