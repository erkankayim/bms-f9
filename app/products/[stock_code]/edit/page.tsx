import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import EditProductForm from "./_components/edit-product-form"

interface EditProductPageProps {
  params: {
    stock_code: string
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      suppliers (
        id,
        name
      )
    `)
    .eq("stock_code", params.stock_code)
    .single()

  if (error || !product) {
    notFound()
  }

  const { data: suppliers } = await supabase.from("suppliers").select("id, name").order("name")

  return (
    <div className="container mx-auto py-6">
      <EditProductForm product={product} suppliers={suppliers || []} />
    </div>
  )
}
