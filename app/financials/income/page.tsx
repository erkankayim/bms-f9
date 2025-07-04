import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, TrendingUp } from "lucide-react"
import { getIncomeEntries } from "../_actions/financial-entries-actions"
import { DeleteIncomeDialog } from "./_components/delete-income-dialog"

async function IncomeList() {
  const result = await getIncomeEntries()

  if (result.error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Hata: {result.error}</p>
        </CardContent>
      </Card>
    )
  }

  const entries = result.data || []

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Henüz gelir kaydı yok</h3>
          <p className="text-muted-foreground mb-4">İlk gelir kaydınızı oluşturmak için aşağıdaki butona tıklayın.</p>
          <Button asChild>
            <Link href="/financials/income/new">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Gelir Kaydı
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gelir Kayıtları</CardTitle>
            <CardDescription>Tüm gelir kayıtlarınızı görüntüleyin ve yönetin</CardDescription>
          </div>
          <Button asChild>
            <Link href="/financials/income/new">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Gelir Kaydı
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Ödeme Yöntemi</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{new Date(entry.entry_date).toLocaleDateString("tr-TR")}</TableCell>
                <TableCell className="font-medium">{entry.description}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{entry.category_name || "Kategori Yok"}</Badge>
                </TableCell>
                <TableCell>{entry.customer_name || "Müşteri Yok"}</TableCell>
                <TableCell className="font-semibold text-green-600">
                  ₺{entry.incoming_amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>{entry.payment_method}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/financials/income/${entry.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/financials/income/${entry.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteIncomeDialog entryId={entry.id} entryDescription={entry.description} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default function IncomePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gelir Yönetimi</h1>
          <p className="text-muted-foreground">İşletmenizin gelir kayıtlarını yönetin</p>
        </div>
      </div>

      <Suspense fallback={<div>Yükleniyor...</div>}>
        <IncomeList />
      </Suspense>
    </div>
  )
}
