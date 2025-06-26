import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CustomerForm } from "../../new/_components/customer-form" // Re-using the form
import type { CustomerDetail } from "../_components/customer-detail-helpers" // Type for customer data
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function EditCustomerPage({ params }: { params: { mid: string } }) {
  const supabase = createClient()
  const { mid } = params

  const { data: customer, error } = await supabase.from("customers").select("*").eq("mid", mid).single()

  if (error || !customer) {
    console.error("Error fetching customer for edit or customer not found:", error?.message)
    notFound()
  }

  const typedCustomer = customer as CustomerDetail

  // We need to ensure all fields expected by CustomerForm are present,
  // even if they are null in the database, they should be empty strings or default values for the form.
  const customerFormData = {
    mid: typedCustomer.mid,
    service_name: typedCustomer.service_name || "",
    contact_name: typedCustomer.contact_name || "",
    email: typedCustomer.email || "",
    phone: typedCustomer.phone || "",
    address: typedCustomer.address || "",
    city: typedCustomer.city || "",
    province: typedCustomer.province || "",
    postal_code: typedCustomer.postal_code || "",
    tax_office: typedCustomer.tax_office || "",
    tax_number: typedCustomer.tax_number || "",
    customer_group: typedCustomer.customer_group || "",
    balance: typedCustomer.balance === null ? 0 : typedCustomer.balance, // Default to 0 if null
    notes: typedCustomer.notes || "",
  }

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
          <CardTitle>Edit Customer: {customer.contact_name || customer.mid}</CardTitle>
          <CardDescription>Update the details for this customer.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Pass existing customer data to the form and an 'update' mode/action */}
          <CustomerForm initialData={customerFormData} isEditMode={true} customerId={customer.mid} />
        </CardContent>
      </Card>
    </div>
  )
}
