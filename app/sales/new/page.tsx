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
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sales
          </Button>
        </Link>
      </div>
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Sale</CardTitle>
          <CardDescription>Add products, select a customer, and complete the sale.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <SaleForm />
        </CardContent>
      </Card>
    </div>
  )
}
