import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Product {
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

function ProductCard({ product }: { product: Product }) {
  const currentStock = product.stock_quantity ?? product.quantity_on_hand ?? 0
  const minLevel = product.min_stock_level ?? product.minimum_stock_level ?? 0
  const isLowStock = currentStock <= minLevel && currentStock > 0
  const isOutOfStock = currentStock === 0

  const purchasePrice = product.purchase_price ?? 0
  const salePrice = product.sale_price ?? 0
  const profitMargin = purchasePrice > 0 ? ((salePrice - purchasePrice) / purchasePrice) * 100 : 0

  const firstImage = product.image_urls?.[0]?.url

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">{product.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">{product.stock_code}</CardDescription>
          </div>
          {firstImage && (
            <div className="ml-3 flex-shrink-0">
              <Image
                src={firstImage || "/placeholder.svg"}
                alt={product.name}
                width={60}
                height={60}
                className="rounded-md object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Category */}
          {product.category_name && (
            <Badge variant="secondary" className="text-xs">
              {product.category_name}
            </Badge>
          )}

          {/* Stock Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Stok:</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">{currentStock}</span>
              {isOutOfStock && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Tükendi
                </Badge>
              )}
              {isLowStock && (
                <Badge variant="outline" className="text-xs text-orange-600">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Az Stok
                </Badge>
              )}
            </div>
          </div>

          {/* Prices */}
          <div className="space-y-1">
            {product.purchase_price && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Alış:</span>
                <span>
                  {product.purchase_price.toFixed(2)} {product.purchase_price_currency || "TL"}
                </span>
              </div>
            )}
            {product.sale_price && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Satış:</span>
                <span className="font-medium">
                  {product.sale_price.toFixed(2)} {product.sale_price_currency || "TL"}
                </span>
              </div>
            )}
            {profitMargin > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Kar Marjı:</span>
                <span className={`font-medium ${profitMargin > 20 ? "text-green-600" : "text-orange-600"}`}>
                  <TrendingUp className="w-3 h-3 inline mr-1" />%{profitMargin.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button asChild size="sm" className="flex-1">
              <Link href={`/products/${product.stock_code}`}>Detay</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
              <Link href={`/products/${product.stock_code}/edit`}>Düzenle</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProductsGrid({ products }: { products: Product[] }) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.stock_code} product={product} />
      ))}
    </div>
  )
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
          <TrendingDown className="h-4 w-4 text-orange-500" />
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

export default async function ProductsPage() {
  const [products, stats] = await Promise.all([getProducts(), getProductStats()])

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
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
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                <SelectItem value="elektronik">Elektronik</SelectItem>
                <SelectItem value="bilgisayar">Bilgisayar & Teknoloji</SelectItem>
                <SelectItem value="telefon">Telefon & Aksesuar</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Stok Durumu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="in-stock">Stokta</SelectItem>
                <SelectItem value="low-stock">Az Stok</SelectItem>
                <SelectItem value="out-of-stock">Tükendi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Suspense fallback={<div>Ürünler yükleniyor...</div>}>
        <ProductsGrid products={products} />
      </Suspense>
    </div>
  )
}
