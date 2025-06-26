import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Eye, Wrench, Plus } from 'lucide-react'
import Link from "next/link"
import { getServiceRequests } from "../_actions/service-actions"
import { DeleteServiceDialog } from "./delete-service-dialog"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusLabels = {
  pending: "Beklemede",
  in_progress: "Tamirde",
  completed: "Tamamlandı",
  delivered: "Teslim Edildi",
  cancelled: "İptal Edildi",
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  normal: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
}

const priorityLabels = {
  low: "Düşük",
  normal: "Normal",
  high: "Yüksek",
  urgent: "Acil",
}

export async function ServiceList() {
  let serviceRequests = []
  let error = null

  try {
    serviceRequests = await getServiceRequests()
  } catch (err) {
    console.error("Error loading service requests:", err)
    error = err
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Wrench className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-semibold text-red-900">Hata Oluştu</h3>
        <p className="mt-1 text-sm text-red-600">
          Servis kayıtları yüklenirken bir hata oluştu. Lütfen veritabanı bağlantınızı kontrol edin.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/service/new">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Servis Kaydı
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!serviceRequests || serviceRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <Wrench className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Servis kaydı bulunamadı</h3>
        <p className="mt-1 text-sm text-gray-500">
          Henüz hiç servis kaydı yok. Yeni bir servis kaydı oluşturarak başlayın.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/service/new">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Servis Kaydı
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Müşteri</TableHead>
            <TableHead>Ürün</TableHead>
            <TableHead>Arıza</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Öncelik</TableHead>
            <TableHead>Teknisyen</TableHead>
            <TableHead>Alış Tarihi</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {serviceRequests.map((service: any) => (
            <TableRow key={service.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{service.customer_name || "Bilinmeyen Müşteri"}</div>
                  {service.customer_phone && (
                    <div className="text-sm text-muted-foreground">{service.customer_phone}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">{service.product_name}</div>
                {service.product_stock_code && (
                  <div className="text-sm text-muted-foreground">{service.product_stock_code}</div>
                )}
              </TableCell>
              <TableCell>
                <div className="max-w-[200px] truncate" title={service.fault_description}>
                  {service.fault_description}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={statusColors[service.service_status as keyof typeof statusColors] || statusColors.pending}>
                  {statusLabels[service.service_status as keyof typeof statusLabels] || "Beklemede"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={priorityColors[service.priority as keyof typeof priorityColors] || priorityColors.normal}>
                  {priorityLabels[service.priority as keyof typeof priorityLabels] || "Normal"}
                </Badge>
              </TableCell>
              <TableCell>{service.technician_name || "-"}</TableCell>
              <TableCell>
                {service.received_date 
                  ? new Date(service.received_date).toLocaleDateString("tr-TR")
                  : new Date(service.created_at).toLocaleDateString("tr-TR")
                }
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/service/${service.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/service/${service.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <DeleteServiceDialog serviceId={service.id.toString()} serviceName={service.product_name} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
