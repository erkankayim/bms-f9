import { SupplierForm } from "./_components/supplier-form"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Building } from "lucide-react"

export default function NewSupplierPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-4">
        <Link href="/suppliers">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Tedarikçilere Geri Dön
          </Button>
        </Link>
      </div>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" /> Yeni Tedarikçi Ekle
          </CardTitle>
          <CardDescription>Sisteme yeni bir tedarikçi kaydetmek için aşağıdaki bilgileri doldurun.</CardDescription>
        </CardHeader>
        <CardContent>
          <SupplierForm />
        </CardContent>
      </Card>
    </div>
  )
}
