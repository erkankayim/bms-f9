import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getServiceRequestById } from "../_actions/service-actions"
import { notFound } from "next/navigation"
import { ServiceDetailPrint } from "./_components/service-detail-print"

interface ServiceDetailPageProps {
  params: {
    id: string
  }
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  delivered: "bg-gray-100 text-gray-800 border-gray-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}

const statusLabels = {
  pending: "Beklemede",
  in_progress: "Tamirde",
  completed: "Tamamlandı",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi",
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800 border-gray-200",
  normal: "bg-blue-100 text-blue-800 border-blue-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200",
}

const priorityLabels = {
  low: "Düşük",
  normal: "Normal",
  high: "Yüksek",
  urgent: "Acil",
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const serviceRequest = await getServiceRequestById(Number.parseInt(params.id))

  if (!serviceRequest) {
    notFound()
  }

  // Durum değerini normalize et (hem service_status hem de status için)
  const currentStatus = serviceRequest.service_status || serviceRequest.status || "pending"
  const currentPriority = serviceRequest.priority || "normal"

  // Güvenli durum ve öncelik kontrolü
  const safeStatus = Object.keys(statusLabels).includes(currentStatus) ? currentStatus : "pending"
  const safePriority = Object.keys(priorityLabels).includes(currentPriority) ? currentPriority : "normal"

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/service">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Servis Detayı</h2>
            <p className="text-muted-foreground">Servis kaydı #{serviceRequest.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <ServiceDetailPrint serviceRequest={serviceRequest} />
          <Button asChild>
            <Link href={`/service/${serviceRequest.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Müşteri Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>Müşteri Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Müşteri Adı</p>
              <p className="text-lg">{serviceRequest.customer_name || "Bilinmeyen Müşteri"}</p>
            </div>
            {serviceRequest.customer_phone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Telefon</p>
                <p>{serviceRequest.customer_phone}</p>
              </div>
            )}
            {serviceRequest.customer_email && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">E-posta</p>
                <p>{serviceRequest.customer_email}</p>
              </div>
            )}
            {serviceRequest.customer_mid && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Müşteri Kodu</p>
                <p>{serviceRequest.customer_mid}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ürün Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>Ürün Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ürün Adı</p>
              <p className="text-lg">{serviceRequest.product_name}</p>
            </div>
            {serviceRequest.product_stock_code && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stok Kodu</p>
                <p>{serviceRequest.product_stock_code}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Arıza Açıklaması</p>
              <p className="whitespace-pre-wrap">{serviceRequest.fault_description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Servis Durumu */}
        <Card>
          <CardHeader>
            <CardTitle>Servis Durumu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Durum</p>
                <Badge variant="outline" className={statusColors[safeStatus as keyof typeof statusColors]}>
                  {statusLabels[safeStatus as keyof typeof statusLabels]}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Öncelik</p>
                <Badge variant="outline" className={priorityColors[safePriority as keyof typeof priorityColors]}>
                  {priorityLabels[safePriority as keyof typeof priorityLabels]}
                </Badge>
              </div>
            </div>
            {serviceRequest.technician_name && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Teknisyen</p>
                <p>{serviceRequest.technician_name}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tarihler ve Maliyetler */}
        <Card>
          <CardHeader>
            <CardTitle>Tarihler ve Maliyetler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Alış Tarihi</p>
              <p>
                {new Date(serviceRequest.received_date).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {serviceRequest.completed_date && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tamamlanma Tarihi</p>
                <p>
                  {new Date(serviceRequest.completed_date).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
            {serviceRequest.delivery_date && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Teslim Tarihi</p>
                <p>
                  {new Date(serviceRequest.delivery_date).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              {serviceRequest.estimated_cost && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tahmini Maliyet</p>
                  <p className="text-lg font-semibold">
                    ₺{Number.parseFloat(serviceRequest.estimated_cost).toFixed(2)}
                  </p>
                </div>
              )}
              {serviceRequest.actual_cost && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gerçek Maliyet</p>
                  <p className="text-lg font-semibold">₺{Number.parseFloat(serviceRequest.actual_cost).toFixed(2)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Servis Notları */}
      {serviceRequest.service_notes && (
        <Card>
          <CardHeader>
            <CardTitle>Servis Notları</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{serviceRequest.service_notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Debug Bilgisi - Geliştirme sırasında görmek için */}
      {process.env.NODE_ENV === "development" && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Debug Bilgisi</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-muted-foreground">
              Status: {JSON.stringify(currentStatus)}
              {"\n"}Priority: {JSON.stringify(currentPriority)}
              {"\n"}Safe Status: {JSON.stringify(safeStatus)}
              {"\n"}Safe Priority: {JSON.stringify(safePriority)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
