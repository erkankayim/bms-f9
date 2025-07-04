import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomerForm } from "../../new/_components/customer-form"
import { createClient } from "@/lib/supabase/server"

interface EditCustomerPageProps {
  params: {
    mid: string
  }
}

async function getCustomer(mid: string) {
  const supabase = createClient()

  const { data: customer, error } = await supabase
    .from("customers")
    .select("*")
    .eq("mid", mid)
    .is("deleted_at", null)
    .single()

  if (error || !customer) {
    return null
  }

  return customer
}

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const customer = await getCustomer(params.mid)

  if (!customer) {
    notFound()
  }

  // Müşteri adını oluştur
  const customerName = customer.contact_name || customer.company_name || `Müşteri ${customer.mid}`

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Müşteriyi Düzenle: {customerName}</CardTitle>
          <CardDescription>Bu müşterinin bilgilerini güncelleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerForm initialData={customer} isEditMode={true} customerId={customer.mid} />
        </CardContent>
      </Card>
    </div>
  )
}
