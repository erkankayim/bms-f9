// This should be a Server Component by default (no "use client")
import { CustomerForm } from "./_components/customer-form"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NewCustomerPage() {
  // console.log("Rendering NewCustomerPage (Server Component)"); // For debugging

  return (
    <div className="container mx-auto py-2">
      <div className="mb-4">
        <Link href="/customers">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
          </Button>
        </Link>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Customer</CardTitle>
          <CardDescription>Fill in the details below to add a new customer to the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 
            Ensure CustomerForm is correctly imported and is a Client Component.
            It does not take initialData or isEditMode here, as it's for a new customer.
          */}
          <CustomerForm />
        </CardContent>
      </Card>
    </div>
  )
}
