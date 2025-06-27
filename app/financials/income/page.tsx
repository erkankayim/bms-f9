"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Search, Download, Eye, Edit, Trash2 } from 'lucide-react'
import Link from "next/link"
import { getIncomeEntries, deleteIncomeEntry, type IncomeEntry } from "../_actions/financial-entries-actions"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"

export default function IncomePage() {
  const [incomes, setIncomes] = useState<IncomeEntry[]>([])
  const [filteredIncomes, setFilteredIncomes] = useState<IncomeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all")
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    fetchIncomes()
  }, [])

  async function fetchIncomes() {
    try {
      setLoading(true)
      const result = await getIncomeEntries()
      if (result.data) {
        setIncomes(result.data)
        setFilteredIncomes(result.data)
      } else {
        setError(result.error || "Veri yüklenirken hata oluştu")
      }
    } catch (err) {
      setError("Beklenmeyen bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = incomes

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (income) =>
          income.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          income.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
          income.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          income.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Payment method filter
    if (selectedPaymentMethod !== "all") {
      filtered = filtered.filter((income) => income.payment_method === selectedPaymentMethod)
    }

    setFilteredIncomes(filtered)
  }, [incomes, searchTerm, selectedPaymentMethod])

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      const result = await deleteIncomeEntry(id)
      if (result.success) {
        toast({
          title: "Başarılı",
          description: result.message,
        })
        await fetchIncomes() // Refresh the list
      } else {
        toast({
          title: "Hata",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Beklenmeyen bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const totalAmount = filteredIncomes.reduce((sum, income) => sum + income.incoming_amount, 0)
  const paymentMethods = [...new Set(incomes.map((income) => income.payment_method))]

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
          <h1 className="text-3xl font-bold tracking-tight">Gelir Listesi</h1>
          <p className="text-muted-foreground">Tüm gelir kayıtlarınızı görüntüleyin ve yönetin</p>
        </div>
        <Link href="/financials/income/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Gelir Ekle
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₺{totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Filtrelenmiş kayıtlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kayıt Sayısı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredIncomes.length}</div>
            <p className="text-xs text-muted-foreground">Toplam {incomes.length} kayıt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Tutar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺
              {filteredIncomes.length > 0
                ? (totalAmount / filteredIncomes.length).toLocaleString("tr-TR", { minimumFractionDigits: 2 })
                : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">Kayıt başına</p>
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
                  placeholder="Açıklama, kaynak, müşteri veya fatura no ile ara..."
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

      {/* Income Table */}
      <Card>
        <CardHeader>
          <CardTitle>Gelir Kayıtları</CardTitle>
          <CardDescription>{filteredIncomes.length} kayıt gösteriliyor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Kaynak</TableHead>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Ödeme Şekli</TableHead>
                  <TableHead>Fatura No</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncomes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm || selectedPaymentMethod !== "all"
                          ? "Filtrelere uygun kayıt bulunamadı."
                          : "Henüz gelir kaydı bulunmuyor."}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIncomes.map((income) => (
                    <TableRow key={income.id}>
                      <TableCell className="font-medium">
                        {new Date(income.entry_date).toLocaleDateString("tr-TR")}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-48 truncate" title={income.description}>
                          {income.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-32 truncate" title={income.source}>
                          {income.source}
                        </div>
                      </TableCell>
                      <TableCell>
                        {income.customer_name ? (
                          <Badge variant="secondary">{income.customer_name}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {income.category_name ? (
                          <Badge variant="outline">{income.category_name}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        ₺{income.incoming_amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{income.payment_method}</Badge>
                      </TableCell>
                      <TableCell>
                        {income.invoice_number || <span className="text-muted-foreground text-sm">-</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/financials/income/${income.id}`}>
                            <Button variant="ghost" size="sm" title="Görüntüle">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/financials/income/${income.id}/edit`}>
                            <Button variant="ghost" size="sm" title="Düzenle">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                                title="Sil"
                                disabled={deletingId === income.id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Gelir Kaydını Sil</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bu gelir kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                                  <br />
                                  <br />
                                  <strong>Açıklama:</strong> {income.description}
                                  <br />
                                  <strong>Tutar:</strong> ₺{income.incoming_amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(income.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Sil
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
