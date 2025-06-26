import { getActiveLowStockAlerts, type LowStockAlertItem } from "./_actions/alert-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info } from "lucide-react"

function getStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "destructive"
    case "acknowledged":
      return "secondary"
    case "resolved":
      return "default"
    default:
      return "outline"
  }
}

export default async function LowStockAlertsPage() {
  const { success, alerts, error } = await getActiveLowStockAlerts()

  if (!success || error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Uyarılar Yüklenemedi</h2>
        <p className="text-muted-foreground">{error || "Aktif düşük stok uyarıları getirilirken bir sorun oluştu."}</p>
      </div>
    )
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Info className="w-16 h-16 text-primary mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Aktif Uyarı Yok</h2>
        <p className="text-muted-foreground">Şu anda aktif düşük stok uyarınız bulunmamaktadır.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6 text-destructive" />
            Aktif Düşük Stok Uyarıları
          </CardTitle>
          <CardDescription>Minimum stok seviyesinin altına düşen ürünler aşağıda listelenmiştir.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ürün Adı</TableHead>
                <TableHead>Stok Kodu</TableHead>
                <TableHead className="text-right">Stok (Uyarı Anı)</TableHead>
                <TableHead className="text-right">Min. Stok</TableHead>
                <TableHead>Uyarı Zamanı</TableHead>
                <TableHead>Durum</TableHead>
                {/* <TableHead>Aksiyonlar</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert: LowStockAlertItem) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">{alert.product_name}</TableCell>
                  <TableCell>{alert.product_stock_code}</TableCell>
                  <TableCell className="text-right">{alert.current_stock_at_alert}</TableCell>
                  <TableCell className="text-right">{alert.min_stock_level_at_alert}</TableCell>
                  <TableCell>{alert.alert_triggered_at}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(alert.status)}>
                      {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                    </Badge>
                  </TableCell>
                  {/* <TableCell>
                    TODO: Acknowledge/Resolve buttons
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
