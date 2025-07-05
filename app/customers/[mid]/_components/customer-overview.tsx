import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateTime, formatCurrency } from "@/lib/utils"
import type { Customer } from "./helpers"
import { InfoItem } from "./helpers"

export default function CustomerOverview({ customer }: { customer: Customer }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Müşteri Bilgileri</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <InfoItem label="Müşteri ID" value={customer.mid} />
          <InfoItem label="Yetkili Adı" value={customer.contact_name} />
          <InfoItem label="Email" value={customer.email} />
          <InfoItem label="Telefon" value={customer.phone} />
          <InfoItem label="Hizmet/Abonelik" value={customer.service_name} />
          <InfoItem label="Müşteri Grubu">
            {customer.customer_group ? <Badge variant="secondary">{customer.customer_group}</Badge> : "-"}
          </InfoItem>
          <InfoItem label="Bakiye">{formatCurrency(customer.balance ?? 0)}</InfoItem>
        </div>

        <h3 className="text-lg font-semibold border-t pt-4 mt-4">Adres Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <InfoItem label="Adres" value={customer.address} />
          <InfoItem label="Şehir" value={customer.city} />
          <InfoItem label="İl/Eyalet" value={customer.province} />
          <InfoItem label="Posta Kodu" value={customer.postal_code} />
          <InfoItem label="Ülke" value={customer.country} />
        </div>

        {customer.notes && (
          <>
            <h3 className="text-lg font-semibold border-t pt-4 mt-4">Notlar</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{customer.notes}</p>
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border-t pt-4 mt-4 text-sm text-muted-foreground">
          <InfoItem label="Oluşturulma Tarihi" value={formatDateTime(customer.created_at)} />
          <InfoItem label="Son Güncelleme" value={formatDateTime(customer.updated_at)} />
        </div>
      </CardContent>
    </Card>
  )
}
