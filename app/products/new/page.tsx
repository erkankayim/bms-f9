import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Yeni Ürün Ekle</h1>
        <p className="text-muted-foreground">Yeni bir ürün ekleyin ve stok bilgilerini girin</p>
      </div>

      <Suspense fallback={<div>Form yükleniyor...</div>}>
        <ProductForm suppliers={suppliers} />
      </Suspense>
    </div>
  )
}
