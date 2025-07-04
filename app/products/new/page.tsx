import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import ProductForm from "./_components/product-form"

async function getSuppliers() {
  const supabase = createClient()

  try {
    const { data: suppliers, error } = await supabase.from("suppliers").select("id, name, company_name").order("name")

    if (error) {
      console.error("Error fetching suppliers:", error)
      return []
    }

    return suppliers || []
  } catch (error) {
    console.error("Unexpected error:", error)
    return []
  }
}

export default async function NewProductPage() {
  const suppliers = await getSuppliers()

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline" size="sm">
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Yeni Ürün Ekle</h1>
          <p className="text-muted-foreground">Yeni bir ürün ekleyin ve stok bilgilerini girin</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ürün Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Form yükleniyor...</div>}>
            <ProductForm suppliers={suppliers} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
