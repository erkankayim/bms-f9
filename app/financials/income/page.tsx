"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Search, Download, Edit, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import {
  getIncomeEntries,
  deleteIncomeEntryAction,
  type IncomeEntryWithDetails,
} from "../_actions/financial-entries-actions"
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
import { useToast } from "@/hooks/use-toast"

export default function IncomePage() {
  const [incomes, setIncomes] = useState<IncomeEntryWithDetails[]>([])
  const [filteredIncomes, setFilteredIncomes] = useState<IncomeEntryWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const { toast } = useToast()

  const fetchIncomes = async () => {
    setLoading(true)
    const data = await getIncomeEntries()
    setIncomes(data)
    setFilteredIncomes(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchIncomes()
  }, [])

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase()
    const filtered = incomes.filter(
      (income) =>
        income.description.toLowerCase().includes(lowercasedFilter) ||
        income.source.toLowerCase().includes(lowercasedFilter) ||
        income.customer_name?.toLowerCase().includes(lowercasedFilter) ||
        income.invoice_number?.toLowerCase().includes(lowercasedFilter),
    )
    setFilteredIncomes(filtered)
  }, [searchTerm, incomes])

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    const result = await deleteIncomeEntryAction(id)
    toast({
      title: result.success ? "Başarılı" : "Hata",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
    if (result.success) {
      await fetchIncomes()
    }
    setDeletingId(null)
  }

  const totalAmount = filteredIncomes.reduce((sum, income) => sum + income.incoming_amount, 0)

  return (
    <div className="container mx-auto py-8 space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtrele ve Ara</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Açıklama, kaynak, müşteri veya fatura no ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Dışa Aktar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gelir Kayıtları</CardTitle>
          <CardDescription>
            Toplam {filteredIncomes.length} kayıt bulundu. Toplam Tutar:{" "}
            <span className="font-bold text-green-600">
              ₺{totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                  <TableHead className="text-center">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredIncomes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Kayıt bulunamadı.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIncomes.map((income) => (
                    <TableRow key={income.id}>
                      <TableCell>{new Date(income.entry_date).toLocaleDateString("tr-TR")}</TableCell>
                      <TableCell className="font-medium">{income.description}</TableCell>
                      <TableCell>
                        {income.customer_name ? (
                          <Badge variant="secondary">{income.customer_name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{income.category_name || "Belirtilmemiş"}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        ₺{income.incoming_amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/financials/income/${income.id}/edit`}>
                            <Button variant="ghost" size="icon" title="Düzenle">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Sil"
                                className="text-red-600 hover:text-red-700"
                                disabled={deletingId === income.id}
                              >
                                {deletingId === income.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bu gelir kaydını kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri
                                  alınamaz.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(income.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Evet, Sil
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
