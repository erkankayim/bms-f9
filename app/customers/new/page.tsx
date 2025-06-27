import { CustomerForm } from "./_components/customer-form"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NewCustomerPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-4">
        <Link href="/customers">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Müşterilere Geri Dön
          </Button>
        </Link>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Yeni Müşteri Ekle</CardTitle>
          <CardDescription>Sisteme yeni bir müşteri eklemek için aşağıdaki bilgileri doldurun.</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerForm />
        </CardContent>
      </Card>
    </div>
  )
}
