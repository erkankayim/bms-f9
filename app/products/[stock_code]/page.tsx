import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Edit, ArrowLeft, Package, AlertTriangle, TrendingUp, TrendingDown, ImageOff, Tags } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { PrintLabelDialog } from "@/components/print-label-dialog"
import BarcodeDisplay from "@/components/barcode-display"

interface ProductPageProps {
  params: {
    stock_code: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const supabase = createClient()

  try {
    const { data: product, error } = await supabase
      .from("products")
      .select(`
        *,
        suppliers (
          id,
          name,
          company_name,
          contact_person,
          phone,
          email
        )
      `)
      .eq("stock_code", params.stock_code)
      .is("deleted_at", null)
      .single()

    if (error || !product) {
      notFound()
    }

    // Calculate profit margin
    const purchasePrice = product.purchase_price || 0
    const salePrice = product.sale_price || product.selling_price || 0
    const profitMargin = purchasePrice > 0 ? (((salePrice - purchasePrice) / purchasePrice) * 100).toFixed(1) : "0"

    const currentStock = product.stock_quantity ?? product.quantity_on_hand ?? 0
    const minStock = product.min_stock_level ?? product.minimum_stock_level ?? 0
    const isLowStock = currentStock <= minStock

    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">Stok Kodu: {product.stock_code}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/products/${product.stock_code}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Düzenle
              </Link>
            </Button>
            <PrintLabelDialog
              product={{
                stock_code: product.stock_code,
                name: product.name,
                sale_price: salePrice,
                sale_price_currency: product.sale_price_currency,
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Images */}
          {product.image_urls && product.image_urls.length > 0 ? (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Ürün Resimleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {product.image_urls.map((imageObj: any, index: number) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <Image
                        src={imageObj?.url || imageObj || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="lg:col-span-2">
              <CardContent className="flex flex-col items-center justify-center p-12">
                <ImageOff className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Bu ürün için resim bulunmamaktadır.</p>
              </CardContent>
            </Card>
          )}

          {/* Product Info */}
          <Card>
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
                    {product.category_name ? (
                      <Badge variant="outline">
                        <Tags className="mr-1 h-3 w-3" />
                        {product.category_name}
                      </Badge>
                    ) : (
                      <span>Belirtilmemiş</span>
                    )}
                  </div>
                  {product.description && (
                    <div>
                      <span className="text-muted-foreground">Açıklama:</span>
                      <p className="mt-1 whitespace-pre-wrap">{product.description}</p>
                    </div>
                  )}
                  {product.tags && (
                    <div>
                      <span className="text-muted-foreground">Etiketler:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.tags.split(",").map((tag: string) => (
                          <Badge key={tag.trim()} variant="secondary">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
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
                      {salePrice.toFixed(2)} {product.sale_price_currency || "TL"}
                    </span>
                  </div>
                  {purchasePrice > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Alış Fiyatı:</span>
                        <span>
                          {purchasePrice.toFixed(2)} {product.purchase_price_currency || "TL"}
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
                  {product.vat_rate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">KDV Oranı:</span>
                      <span>%{(product.vat_rate * 100).toFixed(0)}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Stok Bilgileri</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mevcut Stok:</span>
                    <span className={isLowStock ? "text-red-600 font-semibold" : ""}>{currentStock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Minimum Seviye:</span>
                    <span>{minStock}</span>
                  </div>
                </div>
              </div>

              {product.barcode && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Barkod</h3>
                    <BarcodeDisplay value={product.barcode} className="max-w-full h-auto" />
                  </div>
                </>
              )}

              {product.suppliers && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Tedarikçi Bilgileri</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Firma:</span>
                        <span>{product.suppliers.company_name || product.suppliers.name}</span>
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
                  {product.variants.map((variant: any, index: number) => (
                    <div key={variant.id || index} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{variant.name || variant.type}</h4>
                      <div className="flex flex-wrap gap-2">
                        {(variant.values || []).map((value: any, valueIndex: number) => (
                          <Badge key={valueIndex} variant="secondary">
                            {typeof value === "string" ? value : value.value || value}
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
  } catch (error) {
    console.error("Product detail error:", error)
    notFound()
  }
}
