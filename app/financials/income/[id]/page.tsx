import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Calendar, User, CreditCard, FileText, DollarSign } from "lucide-react"
import { getIncomeEntryById } from "../../_actions/financial-entries-actions"

interface IncomeDetailPageProps {
  params: {
    id: string
  }
}

export default async function IncomeDetailPage({ params }: IncomeDetailPageProps) {
  const id = Number.parseInt(params.id)
  if (isNaN(id)) {
    notFound()
  }

  const result = await getIncomeEntryById(id)

  if (result.error || !result.data) {
    notFound()
  }

  const entry = result.data

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/financials/income">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Gelir Kaydı Detayı</h1>
          <p className="text-muted-foreground">#{entry.id}</p>
        </div>
        <Button asChild>
          <Link href={`/financials/income/${entry.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Düzenle
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Gelir Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Açıklama</label>
              <p className="text-lg font-semibold">{entry.description}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Tutar</label>
              <p className="text-2xl font-bold text-green-600">
                ₺{entry.incoming_amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Kaynak</label>
              <p>{entry.source}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Kategori</label>
              <div>
                <Badge variant="secondary">{entry.category_name || "Kategori Yok"}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              İşlem Detayları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tarih</label>
                <p>{new Date(entry.entry_date).toLocaleDateString("tr-TR")}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Müşteri</label>
                <p>{entry.customer_name || "Müşteri Yok"}</p>
                {entry.customer_mid && <p className="text-sm text-muted-foreground">ID: {entry.customer_mid}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ödeme Yöntemi</label>
                <p>{entry.payment_method}</p>
              </div>
            </div>

            {entry.invoice_number && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fatura No</label>
                <p>{entry.invoice_number}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {entry.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notlar</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{entry.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator className="my-8" />

      <div className="text-sm text-muted-foreground">
        <p>Oluşturulma: {new Date(entry.created_at).toLocaleString("tr-TR")}</p>
      </div>
    </div>
  )
}
