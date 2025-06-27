"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2, Search, ChevronLeft, ChevronRight, Calendar, User } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { format } from "date-fns"

type Sale = {
  id: number
  sale_date: string
  customer_mid: string | null
  total_amount: number
  discount_amount: number
  tax_amount: number
  final_amount: number
  payment_method: string | null
  status: string
  customers?: {
    contact_name: string | null
  } | null
}

const ITEMS_PER_PAGE = 10

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "success"
    case "pending":
    case "pending_installment":
      return "warning"
    case "cancelled":
      return "destructive"
    case "refunded":
      return "outline"
    default:
      return "secondary"
  }
}

const formatPaymentMethod = (method: string | null) => {
  if (!method) return "-"
  switch (method.toLowerCase()) {
    case "cash":
      return "Nakit"
    case "credit_card":
      return "Kredi Kartı"
    case "bank_transfer":
      return "Banka Havalesi"
    case "other":
      return "Diğer"
    default:
      return method
  }
}

export default function SalesPage() {
  const supabase = getSupabaseBrowserClient()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalSales, setTotalSales] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const totalPages = useMemo(() => Math.ceil(totalSales / ITEMS_PER_PAGE), [totalSales])

  const fetchSales = useCallback(async () => {
    setLoading(true)
    setError(null)

    const from = (currentPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    let query = supabase
      .from("sales")
      .select("*, customers(contact_name)", {
        count: "exact",
      })
      .is("deleted_at", null)
      .order("sale_date", { ascending: false })

    if (debouncedSearchTerm) {
      if (!isNaN(Number(debouncedSearchTerm))) {
        query = query.eq("id", Number(debouncedSearchTerm))
      } else {
        query = query.textSearch("customers.contact_name", debouncedSearchTerm, {
          type: "websearch",
          config: "english",
        })
      }
    }

    query = query.range(from, to)

    const { data, error: fetchError, count } = await query

    if (fetchError) {
      console.error("Error fetching sales:", fetchError)
      setError(`Satışlar yüklenirken bir hata oluştu: ${fetchError.message}`)
      setSales([])
      setTotalSales(0)
    } else {
      setSales((data as Sale[] | null) || [])
      setTotalSales(count || 0)
    }
    setLoading(false)
  }, [supabase, currentPage, debouncedSearchTerm])

  useEffect(() => {
    fetchSales()
  }, [fetchSales])

  useEffect(() => {
    if (debouncedSearchTerm && currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [debouncedSearchTerm])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const formatStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "Tamamlandı"
      case "pending":
        return "Beklemede"
      case "pending_installment":
        return "Taksit Bekleniyor"
      case "cancelled":
        return "İptal Edildi"
      case "refunded":
        return "İade Edildi"
      default:
        return status
    }
  }

  if (error && !loading) {
    return (
      <div className="container mx-auto py-2">
        <Card>
          <CardHeader>
            <CardTitle>Hata</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <Button variant="outline" className="mt-4 bg-transparent" onClick={() => fetchSales()}>
              Tekrar Dene
            </Button>
            <Link href="/">
              <Button variant="link" className="mt-4 ml-2">
                Ana Sayfaya Dön
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-2">
      <Card>
        <CardHeader className="px-7">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Satışlar</CardTitle>
              <CardDescription>Satışlarınızı yönetin ve detaylarını görüntüleyin.</CardDescription>
            </div>
            <div className="flex w-full sm:w-auto items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Müşteri veya ID ile ara..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <Link href="/sales/new">
                <Button className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Yeni Satış
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && sales.length === 0 ? (
            <div className="h-64 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-2 text-muted-foreground">Satışlar yükleniyor...</p>
            </div>
          ) : !loading && sales.length === 0 && (debouncedSearchTerm || totalSales === 0) ? (
            <div className="text-center py-10">
              <p className="text-lg font-semibold">
                {debouncedSearchTerm ? "Aramanızla eşleşen satış bulunamadı." : "Henüz satış kaydı yok."}
              </p>
              <p className="text-muted-foreground">
                {debouncedSearchTerm ? "Farklı bir arama terimi deneyin veya " : "Başlamak için "}
                <Link href="/sales/new" className="text-primary hover:underline">
                  yeni bir satış oluşturun
                </Link>
                .
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Tarih
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Müşteri
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Toplam</TableHead>
                  <TableHead className="text-right">İndirim</TableHead>
                  <TableHead className="text-right">Son Tutar</TableHead>
                  <TableHead>Ödeme Yöntemi</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.id}</TableCell>
                    <TableCell>{format(new Date(sale.sale_date), "dd.MM.yyyy HH:mm")}</TableCell>
                    <TableCell>
                      {sale.customers?.contact_name ? (
                        <Link href={`/customers/${sale.customer_mid}`} className="hover:underline">
                          {sale.customers.contact_name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">₺{sale.total_amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {sale.discount_amount > 0 ? `₺${sale.discount_amount.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium">₺{sale.final_amount.toFixed(2)}</TableCell>
                    <TableCell>{formatPaymentMethod(sale.payment_method)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(sale.status)}>{formatStatus(sale.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/sales/${sale.id}`}>
                        <Button variant="outline" size="sm">
                          Görüntüle
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-between border-t px-7 py-4">
            <div className="text-xs text-muted-foreground">
              Sayfa {currentPage} / {totalPages} ({totalSales} satış)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Önceki
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                Sonraki
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
