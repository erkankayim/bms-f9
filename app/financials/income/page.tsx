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
import { Plus, Search, TrendingUp, AlertCircle, Eye, Edit, Trash2, Users } from "lucide-react"
import { getIncomeEntries, deleteIncome } from "./_actions/income-actions"
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

type IncomeEntry = Awaited<ReturnType<typeof getIncomeEntries>>[0]

export default function IncomePage() {
  const [income, setIncome] = useState<IncomeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const fetchIncome = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getIncomeEntries()
      setIncome(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Gelir kayıtları yüklenirken bilinmeyen bir hata oluştu"
      setError(errorMessage)
      console.error("Error fetching income:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncome()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteIncome(id)
      toast({
        title: "Başarılı",
        description: "Gelir kaydı başarıyla silindi.",
        variant: "default",
      })
      fetchIncome() // Re-fetch income after deletion
    } catch (err) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "Gelir silinirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  const filteredIncome = useMemo(() => {
    return income.filter(
      (entry) =>
        entry.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.financial_categories?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.customers?.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [income, searchTerm])

  const totalIncome = useMemo(() => filteredIncome.reduce((sum, e) => sum + e.incoming_amount, 0), [filteredIncome])

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-48" />
          </CardContent>
        </Card>
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
        <Button onClick={fetchIncome} className="mt-4">
          Tekrar Dene
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gelirler</h1>
          <p className="text-muted-foreground">Gelir kayıtlarınızı görüntüleyin ve yönetin</p>
        </div>
        <Button asChild>
          <Link href="/financials/income/new">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Gelir Ekle
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{totalIncome.toFixed(2)} TL</div>
          <p className="text-xs text-muted-foreground">{filteredIncome.length} gelir kaydı</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gelir Kayıtları</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Gelir ara..."
                className="pl-8 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredIncome.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">
                {searchTerm ? "Aramayla eşleşen gelir bulunamadı." : "Henüz gelir kaydı yok."}
              </h3>
              <p className="text-muted-foreground mt-2">
                {searchTerm ? "Farklı bir arama terimi deneyin." : "Yeni bir gelir ekleyerek başlayın."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Kaynak</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncome.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{new Date(entry.entry_date).toLocaleDateString("tr-TR")}</TableCell>
                    <TableCell>
                      <div className="font-medium">{entry.source}</div>
                      <div className="text-sm text-muted-foreground">{entry.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{entry.financial_categories?.name}</Badge>
                    </TableCell>
                    <TableCell>{entry.customers?.contact_name || "-"}</TableCell>
                    <TableCell className="font-medium text-green-600">{entry.incoming_amount.toFixed(2)} TL</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/financials/income/${entry.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/financials/income/${entry.id}/edit`}>
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
                                Bu gelir kaydını kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri
                                alınamaz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>İptal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(entry.id.toString())}>
                                Sil
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
