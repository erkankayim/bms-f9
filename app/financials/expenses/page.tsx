"use client"

import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Receipt, Search, Eye, Edit, Trash2, TrendingDown, DollarSign, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getExpenseEntries } from "./_actions/expense-actions"
import { DeleteExpenseDialog } from "./[id]/_components/delete-expense-dialog"

async function ExpensesSummary() {
  try {
    const expenses = await getExpenseEntries()

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.expense_amount, 0)
    const totalPaid = expenses.reduce((sum, expense) => sum + expense.payment_amount, 0)
    const totalDebt = totalExpenses - totalPaid

    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpenses.toFixed(2)} TL</div>
            <p className="text-xs text-muted-foreground">{expenses.length} gider kaydı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ödenen Tutar</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalPaid.toFixed(2)} TL</div>
            <p className="text-xs text-muted-foreground">Toplam ödeme</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kalan Borç</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalDebt.toFixed(2)} TL</div>
            <p className="text-xs text-muted-foreground">Ödenmemiş tutar</p>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
}

async function ExpensesTable() {
  try {
    const expenses = await getExpenseEntries()

    if (expenses.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Henüz gider kaydı yok</h3>
            <p className="text-muted-foreground text-center mb-4">
              İlk gider kaydınızı oluşturmak için aşağıdaki butona tıklayın.
            </p>
            <Button asChild>
              <Link href="/financials/expenses/new">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Gider Ekle
              </Link>
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gider Kayıtları</CardTitle>
              <CardDescription>Tüm gider kayıtlarınızı görüntüleyin ve yönetin</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Gider ara..." className="pl-8 w-64" />
              </div>
              <Button asChild>
                <Link href="/financials/expenses/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Gider
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tedarikçi</TableHead>
                <TableHead>Gider Tutarı</TableHead>
                <TableHead>Ödenen</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => {
                const isPaid = expense.payment_amount >= expense.expense_amount
                const isPartiallyPaid = expense.payment_amount > 0 && expense.payment_amount < expense.expense_amount

                return (
                  <TableRow key={expense.id}>
                    <TableCell>{new Date(expense.entry_date).toLocaleDateString("tr-TR")}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{expense.expense_title}</div>
                        <div className="text-sm text-muted-foreground">{expense.expense_source}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.category_name}</Badge>
                    </TableCell>
                    <TableCell>
                      {expense.supplier_name ? (
                        <Badge variant="secondary">{expense.supplier_name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{expense.expense_amount.toFixed(2)} TL</TableCell>
                    <TableCell className="font-medium text-green-600">{expense.payment_amount.toFixed(2)} TL</TableCell>
                    <TableCell>
                      {isPaid ? (
                        <Badge className="bg-green-100 text-green-800">Ödendi</Badge>
                      ) : isPartiallyPaid ? (
                        <Badge className="bg-yellow-100 text-yellow-800">Kısmi</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Ödenmedi</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
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
                        <DeleteExpenseDialog expenseId={expense.id.toString()}>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DeleteExpenseDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  } catch (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Veri Yükleme Hatası</h3>
          <p className="text-muted-foreground text-center mb-4">
            Gider kayıtları yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
          </p>
          <Button onClick={() => window.location.reload()}>Sayfayı Yenile</Button>
        </CardContent>
      </Card>
    )
  }
}

function ExpensesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ExpensesPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Giderler</h1>
          <p className="text-muted-foreground">Gider kayıtlarınızı görüntüleyin ve yönetin</p>
        </div>
        <Button asChild>
          <Link href="/financials/expenses/new">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Gider Ekle
          </Link>
        </Button>
      </div>

      <Suspense fallback={<ExpensesSkeleton />}>
        <ExpensesSummary />
      </Suspense>

      <Suspense fallback={<ExpensesSkeleton />}>
        <ExpensesTable />
      </Suspense>
    </div>
  )
}
