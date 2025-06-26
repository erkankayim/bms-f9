import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ServiceForm } from "../_components/service-form"

export default function NewServicePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Yeni Servis Kaydı</h2>
          <p className="text-muted-foreground">Yeni bir servis kaydı oluşturun.</p>
        </div>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Servis Bilgileri</CardTitle>
            <CardDescription>Servis kaydı için gerekli bilgileri girin.</CardDescription>
          </CardHeader>
          <CardContent>
            <ServiceForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
