"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  PlusCircle,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Building,
  FilterIcon,
} from "lucide-react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDebounce } from "@/hooks/use-debounce"
import { useToast } from "@/components/ui/use-toast"
import { DeleteSupplierDialog } from "./_components/delete-supplier-dialog"
import { useRouter, useSearchParams } from "next/navigation"

type Supplier = {
  id: string // UUID
  supplier_code: string | null
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  deleted_at: string | null // Arşivlenme durumu için eklendi
}

type FilterStatus = "active" | "archived" | "all"

const ITEMS_PER_PAGE = 10

export default function SuppliersPage() {
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supplierToArchive, setSupplierToArchive] = useState<{ id: string; name: string | null } | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalSuppliers, setTotalSuppliers] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(
    (searchParams.get("filter") as FilterStatus) || "active",
  )

  const totalPages = useMemo(() => Math.ceil(totalSuppliers / ITEMS_PER_PAGE), [totalSuppliers])

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    setError(null)

    const from = (currentPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    let query = supabase.from("suppliers").select("id, supplier_code, name, contact_name, email, phone, deleted_at", {
      count: "exact",
    })

    if (filterStatus === "active") {
      query = query.is("deleted_at", null)
    } else if (filterStatus === "archived") {
      query = query.not("deleted_at", "is", null)
    }
    // "all" durumunda deleted_at filtresi uygulanmaz

    if (debouncedSearchTerm) {
      const searchPattern = `%${debouncedSearchTerm}%`
      query = query.or(
        `supplier_code.ilike.${searchPattern},name.ilike.${searchPattern},contact_name.ilike.${searchPattern},email.ilike.${searchPattern}`,
      )
    }

    query = query.order("name", { ascending: true }).range(from, to)

    const { data: suppliersData, error: fetchError, count } = await query

    if (fetchError) {
      console.error("Error fetching suppliers:", fetchError)
      setError(`Tedarikçiler yüklenirken bir hata oluştu: ${fetchError.message}`)
      setSuppliers([])
      setTotalSuppliers(0)
    } else {
      setSuppliers((suppliersData as Supplier[] | null) || [])
      setTotalSuppliers(count || 0)
    }
    setLoading(false)
  }, [supabase, currentPage, debouncedSearchTerm, filterStatus])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  useEffect(() => {
    const currentFilterInUrl = searchParams.get("filter") as FilterStatus
    if (currentFilterInUrl && currentFilterInUrl !== filterStatus) {
      setFilterStatus(currentFilterInUrl)
    }
  }, [searchParams, filterStatus])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("filter", filterStatus)
    if (debouncedSearchTerm) {
      params.set("search", debouncedSearchTerm)
    } else {
      params.delete("search")
    }
    params.set("page", "1") // Filtre veya arama değiştiğinde 1. sayfaya git

    // Sadece sayfa değişiyorsa page parametresini güncelle
    if (currentPage !== 1 && !debouncedSearchTerm && !params.has("search")) {
      params.set("page", currentPage.toString())
    }

    router.replace(`/suppliers?${params.toString()}`, { scroll: false })

    // Arama veya filtre değiştiğinde ve mevcut sayfa 1 değilse, 1. sayfaya ayarla
    if ((debouncedSearchTerm || searchParams.get("filter") !== filterStatus) && currentPage !== 1) {
      // setCurrentPage(1); // Bu satır fetchSuppliers'ı iki kez tetikleyebilir. URL güncellemesi zaten tetikleyecek.
    }
  }, [debouncedSearchTerm, filterStatus, router, searchParams, currentPage])

  const handleSupplierArchived = () => {
    setSupplierToArchive(null)
    toast({
      title: "Tedarikçi Arşivlendi",
      description: "Tedarikçi başarıyla arşivlendi.",
    })
    // Eğer mevcut sayfada tek tedarikçi varsa ve bu arşivlendiyse, bir önceki sayfaya git (eğer 1. sayfa değilse)
    if (suppliers.length === 1 && currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    } else {
      fetchSuppliers() // Listeyi mevcut filtre ve sayfaya göre yenile
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1) // Arama yapıldığında ilk sayfaya dön
  }

  const handleFilterChange = (value: string) => {
    setFilterStatus(value as FilterStatus)
    setCurrentPage(1) // Filtre değiştiğinde ilk sayfaya dön
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const getNoSuppliersMessage = () => {
    if (debouncedSearchTerm) {
      return "Aramanızla eşleşen tedarikçi bulunamadı."
    }
    switch (filterStatus) {
      case "active":
        return "Henüz aktif tedarikçi eklenmemiş."
      case "archived":
        return "Henüz arşivlenmiş tedarikçi bulunmuyor."
      case "all":
        return "Sistemde kayıtlı tedarikçi bulunmuyor."
      default:
        return "Tedarikçi bulunamadı."
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
            <Button variant="outline" className="mt-4" onClick={() => fetchSuppliers()}>
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
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" /> Tedarikçiler
              </CardTitle>
              <CardDescription>Tedarikçilerinizi yönetin, filtreleyin ve detaylarını görüntüleyin.</CardDescription>
            </div>
            <div className="flex w-full flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-auto sm:flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Kod, isim, kontak veya email ile ara..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex w-full sm:w-auto items-center gap-2">
                <Select value={filterStatus} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filtrele">
                    <FilterIcon className="h-4 w-4 mr-2 sm:hidden md:inline-flex" />
                    <span className="hidden sm:inline-flex">Duruma Göre:</span>
                    <SelectValue placeholder="Filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif Tedarikçiler</SelectItem>
                    <SelectItem value="archived">Arşivlenmiş Tedarikçiler</SelectItem>
                    <SelectItem value="all">Tüm Tedarikçiler</SelectItem>
                  </SelectContent>
                </Select>
                <Link href="/suppliers/new" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Yeni Tedarikçi
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && suppliers.length === 0 ? (
            <div className="h-64 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-2 text-muted-foreground">Tedarikçiler yükleniyor...</p>
            </div>
          ) : !loading && suppliers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg font-semibold">{getNoSuppliersMessage()}</p>
              <p className="text-muted-foreground">
                {debouncedSearchTerm ? "Farklı bir arama terimi deneyin veya " : ""}
                {filterStatus !== "archived" && (
                  <Link href="/suppliers/new" className="text-primary hover:underline">
                    yeni bir tedarikçi ekleyin
                  </Link>
                )}
                {filterStatus === "archived" &&
                  !debouncedSearchTerm &&
                  " Aktif tedarikçileri görmek için filtreyi değiştirin."}
                .
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tedarikçi Kodu</TableHead>
                  <TableHead>Tedarikçi Adı</TableHead>
                  <TableHead>İletişim</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id} className={supplier.deleted_at ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{supplier.supplier_code || "-"}</TableCell>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.contact_name || "-"}</TableCell>
                    <TableCell>{supplier.email || "-"}</TableCell>
                    <TableCell>{supplier.phone || "-"}</TableCell>
                    <TableCell>
                      {supplier.deleted_at ? (
                        <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                          Arşivlenmiş
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          Aktif
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/suppliers/${supplier.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hidden md:inline-flex px-2 py-1 h-auto text-xs"
                          >
                            Görüntüle
                          </Button>
                        </Link>
                        {!supplier.deleted_at && ( // Sadece aktifse düzenle butonu
                          <Link href={`/suppliers/${supplier.id}/edit`}>
                            <Button variant="ghost" size="icon" aria-label="Tedarikçiyi Düzenle">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        {!supplier.deleted_at && ( // Sadece aktifse arşivle butonu
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Tedarikçiyi Arşivle"
                            onClick={() => setSupplierToArchive({ id: supplier.id, name: supplier.name })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {/* Geri yükleme butonu kullanıcı tarafından istenmediği için eklenmedi */}
                      </div>
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
              Sayfa {currentPage} / {totalPages} ({totalSuppliers} tedarikçi)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Önceki
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                Sonraki <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardFooter>
        )}
        {supplierToArchive && (
          <DeleteSupplierDialog
            supplierId={supplierToArchive.id}
            supplierName={supplierToArchive.name}
            onDelete={handleSupplierArchived}
            open={!!supplierToArchive}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setSupplierToArchive(null)
              }
            }}
          />
        )}
      </Card>
    </div>
  )
}
