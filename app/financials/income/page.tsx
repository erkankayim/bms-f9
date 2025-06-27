import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Loader2, TrendingUp } from "lucide-react"
import { getIncomeEntries } from "../_actions/actions"

async function IncomeTable() {
  const entries = await getIncomeEntries()

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Henüz gelir kaydı yok</h3>
          <p className="text-muted-foreground mb-4">İlk gelirinizi ekleyerek başlayın.</p>
          <Button asChild>
            <Link href="/financials/income/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              Yeni Gelir Ekle
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gelir Kayıtları</CardTitle>
        <CardDescription>{entries.length} kayıt bulundu.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{new Date(entry.entry_date).toLocaleDateString("tr-TR")}</TableCell>
                <TableCell className="font-medium">{entry.description}</TableCell>
                <TableCell>{entry.customers?.contact_name || "-"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{entry.financial_categories?.name || "Atanmamış"}</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold text-green-600">
                  {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(entry.incoming_amount)}
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
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gelirler</h1>
          <p className="text-muted-foreground">Tüm gelir kayıtlarınızı görüntüleyin ve yönetin.</p>
        </div>
        <Button asChild>
          <Link href="/financials/income/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Gelir Ekle
          </Link>
        </Button>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <IncomeTable />
      </Suspense>
    </div>
  )
}
