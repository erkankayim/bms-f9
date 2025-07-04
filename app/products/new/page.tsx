// Bu dosya genellikle değişmez, sadece ProductForm'u render eder.
import { ProductForm } from "./_components/product-form"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NewProductPage() {
  return (
    <div className="container mx-auto py-10">
      {" "}
      {/* Artırılmış padding */}
      <div className="mb-6">
        {" "}
        {/* Artırılmış margin */}
        <Link href="/products">
          <Button variant="outline" size="sm">
            {" "}
            {/* Boyut küçültüldü */}
            <ArrowLeft className="mr-2 h-4 w-4" /> Ürünlere Geri Dön
          </Button>
        </Link>
      </div>
      <Card className="max-w-4xl mx-auto">
        {" "}
        {/* Genişlik artırıldı */}
        <CardHeader>
          <CardTitle className="text-2xl">Yeni Ürün Ekle</CardTitle> {/* Boyut artırıldı */}
          <CardDescription>Envanterinize yeni bir ürün eklemek için aşağıdaki bilgileri doldurun.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {" "}
          {/* Üst padding eklendi */}
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  )
}
