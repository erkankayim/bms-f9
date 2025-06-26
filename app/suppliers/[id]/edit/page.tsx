import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { SupplierForm } from "../../new/_components/supplier-form" // Formu yeniden kullanıyoruz
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Building } from "lucide-react"

// Tedarikçi verisi için tip (actions dosyasındaki SupplierFormValues ile uyumlu olmalı)
type SupplierData = {
  id: string
  supplier_code: string | null
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  country: string | null
  tax_office: string | null
  tax_number: string | null
  iban: string | null
  website: string | null
  notes: string | null
  // created_at, updated_at, deleted_at gibi alanlar forma direkt gitmez
}

export default async function EditSupplierPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { id } = params

  const { data: supplier, error } = await supabase
    .from("suppliers")
    .select("*") // Tüm alanları çekiyoruz
    .eq("id", id)
    .is("deleted_at", null) // Sadece aktif tedarikçiler düzenlenebilir
    .single()

  if (error || !supplier) {
    console.error("Error fetching supplier for edit or supplier not found/archived:", error?.message)
    notFound()
  }

  const typedSupplier = supplier as SupplierData

  // Form için başlangıç değerlerini hazırla
  // Formun beklediği tüm alanların null yerine boş string veya uygun default değerlerle doldurulması önemli
  const initialFormValues = {
    supplier_code: typedSupplier.supplier_code || "",
    name: typedSupplier.name || "",
    contact_name: typedSupplier.contact_name || "",
    email: typedSupplier.email || "",
    phone: typedSupplier.phone || "",
    address: typedSupplier.address || "",
    city: typedSupplier.city || "",
    province: typedSupplier.province || "",
    postal_code: typedSupplier.postal_code || "",
    country: typedSupplier.country || "",
    tax_office: typedSupplier.tax_office || "",
    tax_number: typedSupplier.tax_number || "",
    iban: typedSupplier.iban || "",
    website: typedSupplier.website || "",
    notes: typedSupplier.notes || "",
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-4">
        <Link href={`/suppliers/${id}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Tedarikçi Detayına Geri Dön
          </Button>
        </Link>
      </div>
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" /> Tedarikçiyi Düzenle: {typedSupplier.name}
          </CardTitle>
          <CardDescription>Aşağıdaki bilgileri güncelleyerek tedarikçiyi düzenleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <SupplierForm initialData={initialFormValues} isEditMode={true} supplierId={typedSupplier.id} />
        </CardContent>
      </Card>
    </div>
  )
}
