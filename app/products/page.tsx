"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusCircle, ImageOff, Edit, Trash2, Loader2, Search, ChevronLeft, ChevronRight, Tags } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { DeleteProductDialog } from "./[stock_code]/_components/delete-product-dialog"
import { PrintLabelDialog } from "@/components/print-label-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useDebounce } from "@/hooks/use-debounce"
import { useRouter, useSearchParams } from "next/navigation"

type Product = {
  stock_code: string
  name: string
  quantity_on_hand: number | null
  sale_price: number | null
  sale_price_currency: string | null
  tags: string | null
  image_urls: { url: string }[] | null
  categories: { name: string } | null
  deleted_at: string | null
}

type FilterStatus = "active" | "archived" | "all"

interface CategoryFilterItem {
  id: number
  name: string
}

const ITEMS_PER_PAGE = 10

export default function ProductsPage() {
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string | null } | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const [categories, setCategories] = useState<CategoryFilterItem[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("active")

  const totalPages = useMemo(() => Math.ceil(totalProducts / ITEMS_PER_PAGE), [totalProducts])

  useEffect(() => {
    const filterQuery = searchParams.get("filter") as FilterStatus | null
    const pageQuery = searchParams.get("page")
    const searchQuery = searchParams.get("search")
    const categoryQuery = searchParams.get("category")

    setFilterStatus(filterQuery && ["active", "archived", "all"].includes(filterQuery) ? filterQuery : "active")
    setCurrentPage(pageQuery && !isNaN(Number.parseInt(pageQuery)) ? Number.parseInt(pageQuery) : 1)
    setSearchTerm(searchQuery || "")
    setSelectedCategoryId(categoryQuery || "")
  }, [searchParams])

  useEffect(() => {
    const params = new URLSearchParams()
    if (filterStatus !== "active") params.set("filter", filterStatus)
    if (currentPage > 1) params.set("page", currentPage.toString())
    if (debouncedSearchTerm) params.set("search", debouncedSearchTerm)
    if (selectedCategoryId && selectedCategoryId !== "all") params.set("category", selectedCategoryId)

    const currentParams = new URLSearchParams(searchParams.toString())
    if (params.toString() !== currentParams.toString()) {
      router.replace(`/products?${params.toString()}`, { scroll: false })
    }
  }, [filterStatus, currentPage, debouncedSearchTerm, selectedCategoryId, router, searchParams])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)

    const from = (currentPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    let query = supabase
      .from("products")
      .select(
        "stock_code, name, quantity_on_hand, sale_price, sale_price_currency, tags, image_urls, categories ( name ), deleted_at",
        { count: "exact" },
      )

    if (filterStatus === "active") {
      query = query.is("deleted_at", null)
    } else if (filterStatus === "archived") {
      query = query.not("deleted_at", "is", null)
    }

    if (debouncedSearchTerm) {
      query = query.ilike("name", `%${debouncedSearchTerm}%`)
    }

    if (selectedCategoryId && selectedCategoryId !== "all") {
      query = query.eq("category_id", Number(selectedCategoryId))
    }

    query = query.order("name", { ascending: true }).range(from, to)

    const { data: productsData, error: fetchError, count } = await query

    if (fetchError) {
      console.error("Error fetching products:", fetchError)
      setError(`Ürünler yüklenirken bir hata oluştu: ${fetchError.message}`)
      setProducts([])
      setTotalProducts(0)
    } else {
      setProducts((productsData as Product[] | null) || [])
      setTotalProducts(count || 0)
    }
    setLoading(false)
  }, [supabase, currentPage, debouncedSearchTerm, selectedCategoryId, filterStatus])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    const pageFromUrl = searchParams.get("page")
    if (currentPage !== 1 && (!pageFromUrl || Number.parseInt(pageFromUrl) !== currentPage)) {
      if (debouncedSearchTerm || selectedCategoryId || filterStatus !== (searchParams.get("filter") || "active")) {
        setCurrentPage(1)
      }
    }
  }, [debouncedSearchTerm, selectedCategoryId, filterStatus, searchParams, currentPage])

  useEffect(() => {
    async function fetchFilterCategories() {
      const { data, error: catError } = await supabase.from("categories").select("id, name").order("name")
      if (catError) {
        console.error("Kategori filtreleri yüklenemedi:", catError)
      } else {
        setCategories(data || [])
      }
    }
    fetchFilterCategories()
  }, [supabase])

  const handleOpenDeleteDialog = (product: { id: string; name: string | null }) => {
    setProductToDelete(product)
    setIsDeleteDialogOpen(true)
  }

  const handleProductArchived = () => {
    if (products.length === 1 && currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    } else {
      fetchProducts()
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId)
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
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
            <Button variant="outline" className="mt-4 bg-transparent" onClick={() => fetchProducts()}>
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
              <CardTitle>Ürünler / Envanter</CardTitle>
              <CardDescription>Ürün stoklarınızı, fiyatlarınızı ve detaylarınızı yönetin.</CardDescription>
            </div>
            <div className="flex w-full flex-col sm:flex-row sm:w-auto items-center gap-2">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Ürün adı ile ara..."
                  className="pl-8 w-full sm:w-52"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <Select value={selectedCategoryId} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Kategoriye göre filtrele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Durum Filtresi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif Ürünler</SelectItem>
                  <SelectItem value="archived">Arşivlenmiş Ürünler</SelectItem>
                  <SelectItem value="all">Tüm Ürünler</SelectItem>
                </SelectContent>
              </Select>
              <Link href="/products/new" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ürün Ekle
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && products.length === 0 ? (
            <div className="h-64 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-2 text-muted-foreground">Ürünler yükleniyor...</p>
            </div>
          ) : !loading && products.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-lg font-semibold">
                {debouncedSearchTerm || selectedCategoryId || filterStatus !== "active"
                  ? "Filtrelerinize uygun ürün bulunamadı."
                  : "Henüz hiç ürün eklenmemiş."}
              </p>
              <p className="text-muted-foreground">
                {debouncedSearchTerm || selectedCategoryId || filterStatus !== "active"
                  ? "Farklı filtreler deneyin veya "
                  : "Başlamak için "}
                <Link href="/products/new" className="text-primary hover:underline">
                  yeni bir ürün ekleyin
                </Link>
                .
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Resim</TableHead>
                  <TableHead>Stok Kodu</TableHead>
                  <TableHead>Adı</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">Eldeki Miktar</TableHead>
                  <TableHead className="text-right">Satış Fiyatı</TableHead>
                  <TableHead>Etiketler</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.stock_code} className={product.deleted_at ? "opacity-60" : ""}>
                    <TableCell>
                      {product.image_urls && product.image_urls.length > 0 && product.image_urls[0].url ? (
                        <Image
                          src={product.image_urls[0].url || "/placeholder.svg"}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="rounded-md object-cover aspect-square"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                          <ImageOff className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{product.stock_code}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      {product.categories?.name ? (
                        <Badge variant="outline" className="whitespace-nowrap">
                          <Tags className="mr-1 h-3 w-3" />
                          {product.categories.name}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {product.deleted_at ? (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                          Arşivlenmiş
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          Aktif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{product.quantity_on_hand ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      {product.sale_price !== null
                        ? `${product.sale_price.toFixed(2)} ${product.sale_price_currency || ""}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {product.tags
                        ? product.tags.split(",").map((tag) => (
                            <Badge key={tag.trim()} variant="secondary" className="mr-1 mb-1">
                              {tag.trim()}
                            </Badge>
                          ))
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/products/${product.stock_code}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hidden md:inline-flex px-2 py-1 h-auto text-xs bg-transparent"
                          >
                            Görüntüle
                          </Button>
                        </Link>
                        <PrintLabelDialog
                          product={{
                            stock_code: product.stock_code,
                            name: product.name,
                            sale_price: product.sale_price,
                            sale_price_currency: product.sale_price_currency,
                          }}
                          variant="icon"
                        />
                        {!product.deleted_at && (
                          <Link href={`/products/${product.stock_code}/edit`}>
                            <Button variant="ghost" size="icon" aria-label="Düzenle">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Arşivle"
                          onClick={() => handleOpenDeleteDialog({ id: product.stock_code, name: product.name })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
              Sayfa {currentPage} / {totalPages} ({totalProducts} ürün)
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
        {productToDelete && (
          <DeleteProductDialog
            productId={productToDelete.id}
            productName={productToDelete.name}
            isOpen={isDeleteDialogOpen}
            onOpenChange={(open) => {
              setIsDeleteDialogOpen(open)
              if (!open) {
                setProductToDelete(null)
              }
            }}
            onDelete={handleProductArchived}
          />
        )}
      </Card>
    </div>
  )
}
