import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ServiceForm } from "../../_components/service-form"
import { getServiceRequestById } from "../../_actions/service-actions"
import { notFound } from "next/navigation"

interface EditServicePageProps {
  params: {
    id: string
  }
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const serviceRequest = await getServiceRequestById(Number.parseInt(params.id))

  if (!serviceRequest) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Servis Kaydını Düzenle</h2>
          <p className="text-muted-foreground">Servis kaydı bilgilerini güncelleyin.</p>
        </div>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Servis Bilgileri</CardTitle>
            <CardDescription>Servis kaydı bilgilerini güncelleyin.</CardDescription>
          </CardHeader>
          <CardContent>
            <ServiceForm initialData={serviceRequest} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
