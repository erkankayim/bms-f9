"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Search, Receipt, TrendingDown, DollarSign, AlertCircle, Eye, Edit, Trash2 } from "lucide-react"
import { getExpenseEntries, deleteExpense } from "./_actions/expense-actions"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type ExpenseEntry = Awaited<ReturnType<typeof getExpenseEntries>>[0]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getExpenseEntries()
      setExpenses(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gider kayıtları yüklenirken bilinmeyen bir hata oluştu"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id)
      toast({
        title: "Başarılı",
        description: "Gider kaydı başarıyla silindi.",
      })
      fetchExpenses()
    } catch (err) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "Gider silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const filteredExpenses = useMemo(() => {
    return expenses.filter(
      (expense) =>
        expense.expense_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.expense_source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.financial_categories?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.suppliers?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [expenses, searchTerm])

  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + e.expense_amount, 0),
    [filteredExpenses],
  )
  const totalPaid = useMemo(() => filteredExpenses.reduce((sum, e) => sum + e.payment_amount, 0), [filteredExpenses])
  const totalDebt = totalExpenses - totalPaid

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-full" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
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
        <Button onClick={fetchExpenses} className="mt-4">
          Tekrar Dene
        </Button>
      </div>
    )
  }

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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExpenses.toFixed(2)} TL</div>
            <p className="text-xs text-muted-foreground">{filteredExpenses.length} gider kaydı</p>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gider Kayıtları</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Gider ara..."
                className="pl-8 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-16">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">
                {searchTerm ? "Aramayla eşleşen gider bulunamadı." : "Henüz gider kaydı yok."}
              </h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm ? "Farklı bir arama terimi deneyin." : "Yeni bir gider ekleyerek başlayın."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tedarikçi</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => {
                  const isPaid = expense.payment_amount >= expense.expense_amount
                  const isPartiallyPaid = expense.payment_amount > 0 && expense.payment_amount < expense.expense_amount
                  return (
                    <TableRow key={expense.id}>
                      <TableCell>{new Date(expense.entry_date).toLocaleDateString("tr-TR")}</TableCell>
                      <TableCell>
                        <div className="font-medium">{expense.expense_title}</div>
                        <div className="text-sm text-muted-foreground">{expense.expense_source}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.financial_categories?.name}</Badge>
                      </TableCell>
                      <TableCell>{expense.suppliers?.name || "-"}</TableCell>
                      <TableCell className="font-medium">{expense.expense_amount.toFixed(2)} TL</TableCell>
                      <TableCell>
                        {isPaid ? (
                          <Badge className="bg-green-100 text-green-800">Ödendi</Badge>
                        ) : isPartiallyPaid ? (
                          <Badge className="bg-yellow-100 text-yellow-800">Kısmi</Badge>
                        ) : (
                          <Badge variant="destructive">Ödenmedi</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/financials/expenses/${expense.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/financials/expenses/${expense.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bu gider kaydını kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri
                                  alınamaz.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(expense.id.toString())}>
                                  Sil
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
