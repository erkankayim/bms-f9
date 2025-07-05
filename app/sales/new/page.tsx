import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { SaleForm } from "./_components/sale-form"

export default function NewSalePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/sales">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Satışlara geri dön
          </Button>
        </Link>
      </div>
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Yeni Satış Oluştur</CardTitle>
          <CardDescription>Müşteri seçin, ürünleri ekleyin ve satışı tamamlayın.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <SaleForm />
        </CardContent>
      </Card>
    </div>
  )
}
