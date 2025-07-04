import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, AlertTriangle, Eye } from "lucide-react"
import Link from "next/link"
import { PrintLabelDialog } from "@/components/print-label-dialog"

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      *,
      suppliers (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return <div>Ürünler yüklenirken hata oluştu</div>
  }

  const lowStockProducts = products?.filter((product) => product.stock_quantity <= product.min_stock_level) || []

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Ürünler</h1>
          <p className="text-muted-foreground">
            Toplam {products?.length || 0} ürün
            {lowStockProducts.length > 0 && (
              <span className="ml-2 text-orange-600">• {lowStockProducts.length} ürün düşük stokta</span>
            )}
          </p>
        </div>
        <Link href="/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ürün
          </Button>
        </Link>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Düşük Stok Uyarısı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <span className="font-medium">{product.name}</span>
                  <Badge variant="outline" className="text-orange-700">
                    {product.stock_quantity} / {product.min_stock_level}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {products?.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  {product.image_urls && product.image_urls.length > 0 ? (
                    <img
                      src={product.image_urls[0] || "/placeholder.svg"}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <Badge variant="secondary">{product.stock_code}</Badge>
                      {product.category_name && <Badge variant="outline">{product.category_name}</Badge>}
                    </div>

                    {product.description && <p className="text-muted-foreground mb-2">{product.description}</p>}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Stok: {product.stock_quantity}</span>
                      <span>Min: {product.min_stock_level}</span>
                      {product.suppliers && <span>Tedarikçi: {product.suppliers.name}</span>}
                    </div>

                    {product.variants && product.variants.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {product.variants.map((variant: any) => (
                            <div key={variant.id} className="text-xs">
                              <span className="font-medium">{variant.name}:</span>
                              {variant.values.map((value: string, index: number) => (
                                <Badge key={value} variant="outline" className="ml-1 text-xs">
                                  {value}
                                </Badge>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600">
                    {product.sale_price} {product.sale_price_currency}
                  </div>
                  {product.purchase_price > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Alış: {product.purchase_price} {product.purchase_price_currency}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    <Link href={`/products/${product.stock_code}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <PrintLabelDialog product={product} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!products ||
        (products.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Henüz ürün yok</h3>
              <p className="text-muted-foreground mb-4">İlk ürününüzü ekleyerek başlayın</p>
              <Link href="/products/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Ürün Ekle
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
