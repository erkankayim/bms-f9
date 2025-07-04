import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Edit, ArrowLeft, Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PrintLabelDialog } from "@/components/print-label-dialog"
import { ProductMovementsModal } from "@/app/inventory/_components/product-movements-modal"

interface ProductPageProps {
  params: {
    stock_code: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      suppliers (
        id,
        name,
        contact_person,
        phone,
        email
      )
    `)
    .eq("stock_code", params.stock_code)
    .single()

  if (error || !product) {
    notFound()
  }

  // Calculate profit margin
  const profitMargin =
    product.purchase_price > 0
      ? (((product.sale_price - product.purchase_price) / product.purchase_price) * 100).toFixed(1)
      : 0

  const isLowStock = product.stock_quantity <= product.min_stock_level

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground">Stok Kodu: {product.stock_code}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/products/${product.stock_code}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          </Link>
          <PrintLabelDialog product={product} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Images */}
        {product.image_urls && product.image_urls.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Ürün Resimleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.image_urls.map((url: string, index: number) => (
                  <img
                    key={index}
                    src={url || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Info */}
        <Card className={product.image_urls && product.image_urls.length > 0 ? "" : "lg:col-span-3"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Ürün Bilgileri
              {isLowStock && (
                <Badge variant="destructive" className="ml-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Düşük Stok
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Genel Bilgiler</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kategori:</span>
                  <Badge variant="outline">{product.category_name || "Belirtilmemiş"}</Badge>
                </div>
                {product.description && (
                  <div>
                    <span className="text-muted-foreground">Açıklama:</span>
                    <p className="mt-1">{product.description}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Fiyat Bilgileri</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Satış Fiyatı:</span>
                  <span className="font-semibold text-green-600">
                    {product.sale_price} {product.sale_price_currency}
                  </span>
                </div>
                {product.purchase_price > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Alış Fiyatı:</span>
                      <span>
                        {product.purchase_price} {product.purchase_price_currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kar Marjı:</span>
                      <span
                        className={`flex items-center gap-1 ${Number.parseFloat(profitMargin) > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {Number.parseFloat(profitMargin) > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        %{profitMargin}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Stok Bilgileri</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mevcut Stok:</span>
                  <span className={isLowStock ? "text-red-600 font-semibold" : ""}>{product.stock_quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Minimum Seviye:</span>
                  <span>{product.min_stock_level}</span>
                </div>
              </div>
            </div>

            {product.suppliers && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Tedarikçi Bilgileri</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Firma:</span>
                      <span>{product.suppliers.name}</span>
                    </div>
                    {product.suppliers.contact_person && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">İletişim:</span>
                        <span>{product.suppliers.contact_person}</span>
                      </div>
                    )}
                    {product.suppliers.phone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Telefon:</span>
                        <span>{product.suppliers.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="pt-4">
              <ProductMovementsModal productId={product.id} productName={product.name} />
            </div>
          </CardContent>
        </Card>

        {/* Product Variants */}
        {product.variants && product.variants.length > 0 && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Ürün Varyantları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {product.variants.map((variant: any) => (
                  <div key={variant.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{variant.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {variant.values.map((value: string) => (
                        <Badge key={value} variant="secondary">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
