import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import EditProductForm from "./_components/edit-product-form"

interface EditProductPageProps {
  params: {
    stock_code: string
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const supabase = createClient()

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      suppliers (
        id,
        name,
        company_name
      )
    `)
    .eq("stock_code", params.stock_code)
    .single()

  if (error || !product) {
    notFound()
  }

  const { data: suppliers } = await supabase.from("suppliers").select("id, name, company_name").order("name")

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline" size="sm">
          <Link href={`/products/${params.stock_code}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Ürünü Düzenle: {product.name}</h1>
          <p className="text-muted-foreground">Ürün bilgilerini güncelleyin</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ürün Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <EditProductForm product={product} suppliers={suppliers || []} />
        </CardContent>
      </Card>
    </div>
  )
}
