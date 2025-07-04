import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Edit, ImageOff, PackageSearch, Tags } from "lucide-react"
import BarcodeDisplay from "@/components/barcode-display"
import { DeleteProductDialog } from "./_components/delete-product-dialog"

type ProductDetail = {
  stock_code: string
  name: string
  description: string | null
  quantity_on_hand: number | null
  purchase_price: number | null
  purchase_price_currency: string | null // Yeni alan
  sale_price: number | null
  sale_price_currency: string | null // Yeni alan
  vat_rate: number | null
  barcode: string | null
  tags: string | null
  image_urls: { url: string }[] | null
  variants: { type: string; values: { value: string }[] }[] | null
  created_at: string
  updated_at: string
  category_id: number | null
  categories: { name: string } | null
}

function InfoItem({
  label,
  value,
  currency,
  children,
}: {
  label: string
  value?: string | number | null
  currency?: string | null
  children?: React.ReactNode
}) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {children ? (
        <div className="text-lg">{children}</div>
      ) : (
        <p className="text-lg">
          {value !== null && value !== undefined ? (
            <>
              {typeof value === "number" ? value.toFixed(2) : value}
              {currency && <span className="ml-1 text-xs text-muted-foreground">{currency}</span>}
            </>
          ) : (
            "-"
          )}
        </p>
      )}
    </div>
  )
}

export default async function ProductDetailPage({ params }: { params: { stock_code: string } }) {
  const supabase = createClient()
  const { stock_code } = params

  const { data: product, error } = await supabase
    .from("products")
    .select("*, categories ( name )") // purchase_price_currency ve sale_price_currency otomatik olarak gelir
    .eq("stock_code", stock_code)
    .is("deleted_at", null)
    .single()

  if (error || !product) {
    console.error("Error fetching product details, product not found, or product is soft-deleted:", error?.message)
    notFound()
  }

  const typedProduct = product as ProductDetail

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Ürünlere Geri Dön
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/products/${typedProduct.stock_code}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" /> Düzenle
            </Button>
          </Link>
          <DeleteProductDialog productId={typedProduct.stock_code} productName={typedProduct.name} />
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50 p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold">{typedProduct.name}</CardTitle>
              <CardDescription className="text-md">Stok Kodu: {typedProduct.stock_code}</CardDescription>
              {typedProduct.categories?.name && (
                <Badge variant="outline" className="mt-1 text-sm">
                  <Tags className="mr-1 h-3 w-3" />
                  {typedProduct.categories.name}
                </Badge>
              )}
            </div>
            {typedProduct.quantity_on_hand !== null && (
              <Badge
                variant={typedProduct.quantity_on_hand > 0 ? "default" : "destructive"}
                className="text-sm whitespace-nowrap"
              >
                Stok: {typedProduct.quantity_on_hand} adet
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {typedProduct.image_urls && typedProduct.image_urls.length > 0 ? (
            <div>
              <h3 className="text-xl font-semibold mb-3">Ürün Resimleri</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {typedProduct.image_urls.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                    <Image
                      src={img.url || "/placeholder.svg"}
                      alt={`${typedProduct.name} - Resim ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-muted/30">
              <ImageOff className="w-12 h-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Bu ürün için resim bulunmamaktadır.</p>
            </div>
          )}

          {typedProduct.description && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Açıklama</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{typedProduct.description}</p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-semibold border-t pt-6">Detaylar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <InfoItem
                label="Satış Fiyatı"
                value={typedProduct.sale_price}
                currency={typedProduct.sale_price_currency}
              />
              <InfoItem
                label="Alış Fiyatı"
                value={typedProduct.purchase_price}
                currency={typedProduct.purchase_price_currency}
              />
              <InfoItem
                label="KDV Oranı"
                value={typedProduct.vat_rate !== null ? `%${(typedProduct.vat_rate * 100).toFixed(0)}` : "-"}
              />
              <InfoItem label="Kategori" value={typedProduct.categories?.name || "-"} />
              <InfoItem label="Barkod">
                {typedProduct.barcode ? (
                  <BarcodeDisplay value={typedProduct.barcode} className="max-w-[200px] h-auto" />
                ) : (
                  "-"
                )}
              </InfoItem>
              <InfoItem label="Etiketler">
                {typedProduct.tags ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {typedProduct.tags.split(",").map((tag) => (
                      <Badge key={tag.trim()} variant="secondary">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  "-"
                )}
              </InfoItem>
            </div>
          </div>

          {typedProduct.variants && typedProduct.variants.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold border-t pt-6 mb-3">Ürün Varyantları</h3>
              <div className="space-y-3">
                {typedProduct.variants.map((variant, vIndex) => (
                  <div key={vIndex} className="p-3 border rounded-md bg-muted/20">
                    <p className="font-medium text-md mb-1">{variant.type}:</p>
                    <div className="flex flex-wrap gap-2">
                      {variant.values.map((val, valIndex) => (
                        <Badge key={valIndex} variant="outline">
                          {val.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!typedProduct.variants ||
            (typedProduct.variants.length === 0 && (
              <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-muted/30 mt-6">
                <PackageSearch className="w-12 h-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Bu ürün için tanımlanmış varyant bulunmamaktadır.</p>
              </div>
            ))}

          <div className="border-t pt-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <p>Oluşturulma: {new Date(typedProduct.created_at).toLocaleString("tr-TR")}</p>
              <p>Son Güncelleme: {new Date(typedProduct.updated_at).toLocaleString("tr-TR")}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-6 bg-muted/50 border-t">{/* Footer için boş bırakıldı */}</CardFooter>
      </Card>
    </div>
  )
}
