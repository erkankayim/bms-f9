import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { getIncomeEntries } from "../_actions/actions"

export const dynamic = "force-dynamic" // always revalidate

async function IncomeTable() {
  const entries = await getIncomeEntries()

  if (entries.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Henüz kayıt yok. Sağ üstteki butonla ilk gelirinizi ekleyin.
      </div>
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

export default async function IncomePage() {
  return (
    <main className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gelir Kayıtları</h1>
        <Button asChild>
          <Link href="/financials/income/new">Yeni Gelir Ekle</Link>
        </Button>
      </header>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <IncomeTable />
      </Suspense>
    </main>
  )
}
