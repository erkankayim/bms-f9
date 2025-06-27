import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { getIncomeEntries } from "./_actions/income-actions"
import { DeleteIncomeDialog } from "./_components/delete-income-dialog"

async function IncomeList() {
  try {
    const incomeEntries = await getIncomeEntries()

    return (
      <div className="space-y-4">
        {incomeEntries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-muted-foreground mb-4">Henüz gelir kaydı bulunmuyor</p>
              <Button asChild>
                <Link href="/financials/income/new">
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Gelir Kaydını Ekle
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {incomeEntries.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{entry.description}</h3>
                      <p className="text-2xl font-bold text-green-600">
                        ₺{entry.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Tarih: {new Date(entry.date).toLocaleDateString("tr-TR")}</p>
                        {entry.customer_name && <p>Müşteri: {entry.customer_name}</p>}
                        {entry.account_name && <p>Hesap: {entry.account_name}</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/financials/income/${entry.id}/edit`}>Düzenle</Link>
                      </Button>
                      <DeleteIncomeDialog incomeId={entry.id} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error("Error in IncomeList:", error)
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <p className="text-destructive mb-4">Gelir kayıtları yüklenirken hata oluştu</p>
          <Button asChild>
            <Link href="/financials/income/new">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Gelir Kaydı Ekle
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }
}

export default function IncomePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gelir Kayıtları</h1>
          <p className="text-muted-foreground">Tüm gelir kayıtlarınızı görüntüleyin ve yönetin</p>
        </div>
        <Button asChild>
          <Link href="/financials/income/new">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Gelir Kaydı
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Gelir kayıtları yükleniyor...</p>
              </div>
            </CardContent>
          </Card>
        }
      >
        <IncomeList />
      </Suspense>
    </div>
  )
}
