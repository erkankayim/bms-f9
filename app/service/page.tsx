import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Plus } from "lucide-react"
import { ServiceList } from "./_components/service-list"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic"

function ServiceListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <Skeleton className="h-8 w-[100px]" />
        </div>
      ))}
    </div>
  )
}

export default function ServicePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Servis Kayıtları</h2>
          <p className="text-muted-foreground">Müşteri servis taleplerini yönetin ve takip edin.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/service/new">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Servis Kaydı
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Servis Kayıtları</CardTitle>
            <CardDescription>Tüm servis kayıtlarını görüntüleyin ve yönetin.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ServiceListSkeleton />}>
              <ServiceList />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
