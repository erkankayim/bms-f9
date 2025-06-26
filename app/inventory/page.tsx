"use client"

import { useEffect, useState, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ArrowLeft, ArrowRight, PackageSearch, Eye, PlusCircle } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ProductMovementsModal } from "./_components/product-movements-modal"
import { PrintLabelDialog } from "@/components/print-label-dialog"

const ITEMS_PER_PAGE = 15

type ProductInventory = {
  stock_code: string
  name: string | null
  quantity_on_hand: number | null
  category_name: string | null
}

// Seçilen ürünün tipini tanımlayalım
type SelectedProductInfo = {
  stock_code: string
  name: string | null
}

export default function InventoryPage() {
  const supabase = getSupabaseBrowserClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState<ProductInventory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1)
  const [totalProducts, setTotalProducts] = useState(0)

  // Modal için state'ler
  const [selectedProductForMovements, setSelectedProductForMovements] = useState<SelectedProductInfo | null>(null)
  const [isMovementsModalOpen, setIsMovementsModalOpen] = useState(false)

  const fetchInventory = useCallback(async () => {
    // ... (mevcut fetchInventory fonksiyonu aynı kalıyor)
    setIsLoading(true)
    setError(null)

    const page = currentPage - 1
    const offset = page * ITEMS_PER_PAGE

    let query = supabase
      .from("products")
      .select(
        `
        stock_code,
        name,
        quantity_on_hand,
        categories (name)
      `,
        { count: "exact" },
      )
      .is("deleted_at", null)
      .order("name", { ascending: true })
      .range(offset, offset + ITEMS_PER_PAGE - 1)

    if (debouncedSearchTerm) {
      query = query.or(`name.ilike.%${debouncedSearchTerm}%,stock_code.ilike.%${debouncedSearchTerm}%`)
    }

    const { data, error: fetchError, count } = await query

    if (fetchError) {
      console.error("Error fetching inventory:", fetchError)
      setError(`Envanter bilgileri yüklenirken bir hata oluştu: ${fetchError.message}`)
      setProducts([])
    } else {
      const mappedData = data.map((p: any) => ({
        stock_code: p.stock_code,
        name: p.name,
        quantity_on_hand: p.quantity_on_hand,
        category_name: p.categories?.name || "N/A",
      }))
      setProducts(mappedData)
      setTotalProducts(count || 0)
    }
    setIsLoading(false)
  }, [supabase, currentPage, debouncedSearchTerm])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  useEffect(() => {
    // ... (mevcut URL senkronizasyon useEffect'i aynı kalıyor)
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedSearchTerm) {
      params.set("search", debouncedSearchTerm)
    } else {
      params.delete("search")
    }
    if (currentPage !== 1) {
      params.set("page", currentPage.toString())
    } else {
      params.delete("page")
    }
    router.replace(`/inventory?${params.toString()}`, { scroll: false })
  }, [debouncedSearchTerm, currentPage, router, searchParams])

  useEffect(() => {
    // ... (mevcut sayfa sıfırlama useEffect'i aynı kalıyor)
    if (debouncedSearchTerm && currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [debouncedSearchTerm])

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE)

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Modal'ı açmak için fonksiyon
  const handleViewMovements = (product: ProductInventory) => {
    setSelectedProductForMovements({
      stock_code: product.stock_code,
      name: product.name,
    })
    setIsMovementsModalOpen(true)
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Envanter Durumu</h1>
        <p className="mt-1 text-sm text-gray-600">
          Ürünlerinizin mevcut stok miktarlarını görüntüleyin ve stok hareketlerini inceleyin.
        </p>
      </header>

      {/* Arama ve diğer filtreler (mevcut haliyle kalıyor) */}
      <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Ürün adı veya stok kodu ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link href="/inventory/adjust" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Stok Ayarlaması
          </Button>
        </Link>
      </div>

      {/* Yükleme, Hata ve Boş Durum Gösterimleri (mevcut haliyle kalıyor) */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}
      {!isLoading && error && (
        <div className="rounded-md bg-red-50 p-4 text-center">
          <h3 className="text-sm font-medium text-red-800">Hata</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {!isLoading && !error && products.length === 0 && (
        <div className="py-10 text-center">
          <PackageSearch className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Ürün Bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500">
            {debouncedSearchTerm ? "Aramanızla eşleşen ürün bulunamadı." : "Görüntülenecek aktif ürün bulunmamaktadır."}
          </p>
        </div>
      )}

      {!isLoading && !error && products.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stok Kodu</TableHead>
                  <TableHead>Ürün Adı</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Mevcut Stok</TableHead>
                  <TableHead className="text-center">Hareketler</TableHead>
                  <TableHead className="text-center">Etiket</TableHead> {/* Yeni Sütun */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.stock_code}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/products/${product.stock_code}`}
                        className="hover:underline text-blue-600"
                        title="Ürün detayına git"
                      >
                        {product.stock_code}
                      </Link>
                    </TableCell>
                    <TableCell>{product.name || "N/A"}</TableCell>
                    <TableCell>{product.category_name}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {product.quantity_on_hand === null || product.quantity_on_hand === undefined
                        ? "N/A"
                        : product.quantity_on_hand}
                    </TableCell>
                    <TableCell className="text-center">
                      {" "}
                      {/* Yeni Hücre */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewMovements(product)}
                        aria-label={`${product.name || product.stock_code} stok hareketlerini görüntüle`}
                        title="Stok Hareketlerini Görüntüle"
                      >
                        <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <PrintLabelDialog product={product} variant="icon" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Sayfalama (mevcut haliyle kalıyor) */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Toplam {totalProducts} ürünün {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalProducts)}-
                {Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)} arası gösteriliyor.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  aria-label="Önceki sayfa"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  aria-label="Sonraki sayfa"
                >
                  Sonraki
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal'ı render et */}
      {selectedProductForMovements && (
        <ProductMovementsModal
          isOpen={isMovementsModalOpen}
          onOpenChange={(open) => {
            setIsMovementsModalOpen(open)
            if (!open) {
              // Modal kapandığında seçili ürünü temizle
              setSelectedProductForMovements(null)
            }
          }}
          productStockCode={selectedProductForMovements.stock_code}
          productName={selectedProductForMovements.name}
        />
      )}
    </div>
  )
}
