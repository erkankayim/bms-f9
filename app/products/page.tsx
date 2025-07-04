import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Package, AlertTriangle, Eye, Edit, Trash2, ImageOff, Tags } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { DeleteProductDialog } from "./_components/delete-product-dialog"
import { PrintLabelDialog } from "@/components/print-label-dialog"

interface Product {
  id: string
  stock_code: string
  name: string
  description?: string
  category_name?: string
  purchase_price?: number
  sale_price?: number
  purchase_price_currency?: string
  sale_price_currency?: string
  stock_quantity?: number
  quantity_on_hand?: number
  min_stock_level?: number
  minimum_stock_level?: number
  image_urls?: Array<{ url: string }>
  barcode?: string
  tags?: string
  vat_rate?: number
  deleted_at?: string
  created_at: string
  updated_at: string
}

async function getProducts() {
  const supabase = createClient()

  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      return []
    }

    return products as Product[]
  } catch (error) {
    console.error("Unexpected error:", error)
    return []
  }
}

async function getProductStats() {
  const supabase = createClient()

  try {
    const { data: products } = await supabase
      .from("products")
      .select("stock_quantity, quantity_on_hand, min_stock_level, minimum_stock_level")
      .is("deleted_at", null)

    if (!products) return { total: 0, lowStock: 0, outOfStock: 0 }

    const total = products.length
    let lowStock = 0
    let outOfStock = 0

    products.forEach((product) => {
      const currentStock = product.stock_quantity ?? product.quantity_on_hand ?? 0
      const minLevel = product.min_stock_level ?? product.minimum_stock_level ?? 0

      if (currentStock === 0) {
        outOfStock++
      } else if (currentStock <= minLevel) {
        lowStock++
      }
    })

    return { total, lowStock, outOfStock }
  } catch (error) {
    console.error("Error fetching product stats:", error)
    return { total: 0, lowStock: 0, outOfStock: 0 }
  }
}

function StatsCards({ stats }: { stats: { total: number; lowStock: number; outOfStock: number } }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Az Stok</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tükenen</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
        </CardContent>
      </Card>
    </div>
  )
}

function ProductsTable({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Henüz ürün yok</h3>
        <p className="mt-2 text-muted-foreground">İlk ürününüzü ekleyerek başlayın.</p>
        <Button asChild className="mt-4">
          <Link href="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Ürün Ekle
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Resim</TableHead>
            <TableHead>Stok Kodu</TableHead>
            <TableHead>Ürün Adı</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Stok</TableHead>
            <TableHead className="text-right">Satış Fiyatı</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const currentStock = product.stock_quantity ?? product.quantity_on_hand ?? 0
            const minLevel = product.min_stock_level ?? product.minimum_stock_level ?? 0
            const isLowStock = currentStock <= minLevel && currentStock > 0
            const isOutOfStock = currentStock === 0
            const firstImage = product.image_urls?.[0]?.url

            return (
              <TableRow key={product.id} className="hover:bg-muted/50">
                <TableCell>
                  {firstImage ? (
                    <Image
                      src={firstImage || "/placeholder.svg"}
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
                <TableCell>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    {product.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1">{product.description}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {product.category_name ? (
                    <Badge variant="outline" className="whitespace-nowrap">
                      <Tags className="mr-1 h-3 w-3" />
                      {product.category_name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-medium">{currentStock}</span>
                    {isOutOfStock && (
                      <Badge variant="destructive" className="text-xs">
                        Tükendi
                      </Badge>
                    )}
                    {isLowStock && (
                      <Badge variant="outline" className="text-xs text-orange-600">
                        Az Stok
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {product.sale_price ? (
                    <div className="font-medium">
                      {product.sale_price.toFixed(2)} {product.sale_price_currency || "TL"}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={isOutOfStock ? "destructive" : isLowStock ? "secondary" : "default"}>
                    {isOutOfStock ? "Tükendi" : isLowStock ? "Az Stok" : "Stokta"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/products/${product.stock_code}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Görüntüle</span>
                      </Link>
                    </Button>
                    <PrintLabelDialog
                      product={{
                        stock_code: product.stock_code,
                        name: product.name,
                        sale_price: product.sale_price,
                        sale_price_currency: product.sale_price_currency,
                      }}
                      variant="icon"
                    />
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/products/${product.stock_code}/edit`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Düzenle</span>
                      </Link>
                    </Button>
                    <DeleteProductDialog
                      productId={product.stock_code}
                      productName={product.name}
                      trigger={
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Sil</span>
                        </Button>
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export default async function ProductsPage() {
  const [products, stats] = await Promise.all([getProducts(), getProductStats()])

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Ürünler</h1>
          <p className="text-muted-foreground">Ürün envanterinizi yönetin</p>
        </div>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ürün
          </Link>
        </Button>
      </div>

      <StatsCards stats={stats} />

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Ürün ara..." className="pl-10" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Suspense fallback={<div>Ürünler yükleniyor...</div>}>
        <ProductsTable products={products} />
      </Suspense>
    </div>
  )
}
