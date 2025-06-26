import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Building, Globe, Mail, Phone, Landmark, Hash, Info, CalendarDays, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDate, InfoItem, type SupplierDetail } from "./_components/supplier-detail-helpers"
import { DeleteSupplierDialog } from "../_components/delete-supplier-dialog" // Dialog'u üst klasörden alıyoruz

export default async function SupplierDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { id } = params

  // Validate UUID format for id
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
  if (!uuidRegex.test(id)) {
    console.error("Invalid supplier ID format:", id)
    notFound()
  }

  const { data: supplier, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null) // Sadece aktif (arşivlenmemiş) tedarikçileri göster
    .single()

  if (error || !supplier) {
    console.error("Error fetching supplier details, supplier not found, or supplier is archived:", error?.message)
    notFound()
  }

  const typedSupplier = supplier as SupplierDetail

  return (
    <div className="container mx-auto py-2">
      <div className="mb-4 flex justify-between items-center">
        <Link href="/suppliers">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Tedarikçilere Geri Dön
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/suppliers/${typedSupplier.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-1 h-4 w-4" /> Düzenle
            </Button>
          </Link>
          <DeleteSupplierDialog
            supplierId={typedSupplier.id}
            supplierName={typedSupplier.name}
            // onDelete callback'i dialog içinde router.push ile hallediliyor
          >
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-1 h-4 w-4" /> Arşivle
            </Button>
          </DeleteSupplierDialog>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-muted/50">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Building className="mr-2 h-6 w-6 text-primary" />
                {typedSupplier.name}
              </CardTitle>
              <CardDescription>Tedarikçi Kodu: {typedSupplier.supplier_code || "-"}</CardDescription>
            </div>
            <Badge variant="outline" className="mt-1 md:mt-0">
              ID: {typedSupplier.id}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {/* İletişim Bilgileri */}
          <section>
            <h3 className="text-xl font-semibold mb-3 text-primary border-b pb-2">İletişim Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <InfoItem label="Yetkili Kişi" value={typedSupplier.contact_name} />
              <InfoItem label="E-posta">
                {typedSupplier.email ? (
                  <a href={`mailto:${typedSupplier.email}`} className="text-blue-600 hover:underline flex items-center">
                    <Mail className="mr-1 h-4 w-4" /> {typedSupplier.email}
                  </a>
                ) : (
                  "-"
                )}
              </InfoItem>
              <InfoItem label="Telefon">
                {typedSupplier.phone ? (
                  <a href={`tel:${typedSupplier.phone}`} className="flex items-center">
                    <Phone className="mr-1 h-4 w-4" /> {typedSupplier.phone}
                  </a>
                ) : (
                  "-"
                )}
              </InfoItem>
              <InfoItem label="Web Sitesi">
                {typedSupplier.website ? (
                  <a
                    href={typedSupplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    <Globe className="mr-1 h-4 w-4" /> {typedSupplier.website}
                  </a>
                ) : (
                  "-"
                )}
              </InfoItem>
            </div>
          </section>

          {/* Adres Bilgileri */}
          <section>
            <h3 className="text-xl font-semibold mb-3 text-primary border-b pb-2">Adres Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <InfoItem label="Adres" value={typedSupplier.address} className="md:col-span-2 lg:col-span-3" />
              <InfoItem label="Şehir" value={typedSupplier.city} />
              <InfoItem label="İlçe/Eyalet" value={typedSupplier.province} />
              <InfoItem label="Posta Kodu" value={typedSupplier.postal_code} />
              <InfoItem label="Ülke" value={typedSupplier.country} />
            </div>
          </section>

          {/* Finansal Bilgiler */}
          <section>
            <h3 className="text-xl font-semibold mb-3 text-primary border-b pb-2">Finansal Bilgiler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <InfoItem label="Vergi Dairesi">
                <div className="flex items-center">
                  {typedSupplier.tax_office && <Landmark className="mr-1 h-4 w-4 text-muted-foreground" />}
                  {typedSupplier.tax_office || "-"}
                </div>
              </InfoItem>
              <InfoItem label="Vergi Numarası">
                <div className="flex items-center">
                  {typedSupplier.tax_number && <Hash className="mr-1 h-4 w-4 text-muted-foreground" />}
                  {typedSupplier.tax_number || "-"}
                </div>
              </InfoItem>
              <InfoItem label="IBAN" value={typedSupplier.iban} />
            </div>
          </section>

          {/* Notlar */}
          {typedSupplier.notes && (
            <section>
              <h3 className="text-xl font-semibold mb-3 text-primary border-b pb-2">Notlar</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap flex items-start">
                  <Info className="mr-2 h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                  {typedSupplier.notes}
                </p>
              </div>
            </section>
          )}

          {/* Sistem Bilgileri */}
          <section>
            <h3 className="text-xl font-semibold mb-3 text-primary border-b pb-2">Sistem Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm text-muted-foreground">
              <InfoItem label="Oluşturulma Tarihi">
                <div className="flex items-center">
                  <CalendarDays className="mr-1 h-4 w-4" /> {formatDate(typedSupplier.created_at)}
                </div>
              </InfoItem>
              <InfoItem label="Son Güncelleme Tarihi">
                <div className="flex items-center">
                  <CalendarDays className="mr-1 h-4 w-4" /> {formatDate(typedSupplier.updated_at)}
                </div>
              </InfoItem>
            </div>
          </section>
        </CardContent>
        <CardFooter className="p-4 bg-muted/50 border-t">
          {/* Footer için boş bırakıldı veya ek işlemler eklenebilir */}
        </CardFooter>
      </Card>
    </div>
  )
}
