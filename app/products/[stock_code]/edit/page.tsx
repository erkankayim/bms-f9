import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ProductForm, type ProductFormValues } from "../../new/_components/product-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

type ProductData = {
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
  category_id: number | null
}

export default async function EditProductPage({ params }: { params: { stock_code: string } }) {
  const supabase = createClient()
  const { stock_code } = params

  const { data: product, error } = await supabase
    .from("products")
    .select("*") // Tüm alanları çekiyoruz, currency alanları da dahil olacak
    .eq("stock_code", stock_code)
    .single()

  if (error || !product) {
    console.error("Error fetching product for edit or product not found:", error?.message)
    notFound()
  }

  const typedProduct = product as ProductData

  const initialFormValues: Partial<ProductFormValues> & { image_urls?: { url: string }[] | null } = {
    stock_code: typedProduct.stock_code,
    name: typedProduct.name,
    description: typedProduct.description || "",
    quantity_on_hand: typedProduct.quantity_on_hand ?? 0,
    purchase_price: typedProduct.purchase_price,
    purchase_price_currency: (typedProduct.purchase_price_currency as "TRY" | "USD" | "EUR" | "GBP") || "TRY",
    sale_price: typedProduct.sale_price,
    sale_price_currency: (typedProduct.sale_price_currency as "TRY" | "USD" | "EUR" | "GBP") || "TRY",
    vat_rate: typedProduct.vat_rate ?? 0.18,
    barcode: typedProduct.barcode || "",
    tags: typedProduct.tags || "",
    category_id: typedProduct.category_id,
    images: [], // Formda File[] olarak ele alınır, başlangıçta boş
    image_urls: typedProduct.image_urls, // Mevcut resim URL'leri
    variants: typedProduct.variants || [],
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href={`/products/${stock_code}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Ürün Detayına Geri Dön
          </Button>
        </Link>
      </div>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Ürünü Düzenle: {typedProduct.name}</CardTitle>
          <CardDescription>Aşağıdaki bilgileri güncelleyerek ürünü düzenleyin.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ProductForm initialData={initialFormValues} isEditMode={true} productId={typedProduct.stock_code} />
        </CardContent>
      </Card>
    </div>
  )
}
