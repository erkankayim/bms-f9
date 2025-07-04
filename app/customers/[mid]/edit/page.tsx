import { createClient } from "@/lib/supabase/server"
import { CustomerForm } from "../../new/_components/customer-form"
import { notFound } from "next/navigation"

interface Customer {
  mid: string
  name: string
  email?: string
  phone?: string
  address?: string
  tax_number?: string
  tax_office?: string
  notes?: string
}

export default async function EditCustomerPage({ params }: { params: { mid: string } }) {
  const supabase = createClient()

  const { data: customer, error } = await supabase.from("customers").select("*").eq("mid", params.mid).single()

  if (error || !customer) {
    notFound()
  }

  const customerData: Customer = {
    mid: customer.mid,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    tax_number: customer.tax_number,
    tax_office: customer.tax_office,
    notes: customer.notes,
  }

  return (
    <div className="container mx-auto py-6">
      <CustomerForm initialData={customerData} isEditMode={true} customerId={params.mid} />
    </div>
  )
}
