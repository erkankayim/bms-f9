import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownLeft, PlusCircle, List } from "lucide-react"
import { getFinancialSummary } from "./_actions/actions"

export default async function FinancialsPage() {
  const summary = await getFinancialSummary()

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(amount)

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finans Yönetimi</h1>
          <p className="text-muted-foreground">İşletmenizin finansal durumuna genel bakış.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/financials/income/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Gelir Ekle
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/financials/expenses/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Gider Ekle
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalIncome)}</div>
            <p className="text-xs text-muted-foreground">{summary.incomeCount} adet gelir kaydı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpense)}</div>
            <p className="text-xs text-muted-foreground">{summary.expenseCount} adet gider kaydı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Kar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netProfit >= 0 ? "text-blue-600" : "text-yellow-600"}`}>
              {formatCurrency(summary.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">Gelir ve gider farkı</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hızlı Erişim</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button asChild variant="outline" className="justify-start bg-transparent">
              <Link href="/financials/income">
                <List className="mr-2 h-4 w-4" />
                Tüm Gelir Kayıtları
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start bg-transparent">
              <Link href="/financials/expenses">
                <List className="mr-2 h-4 w-4" />
                Tüm Gider Kayıtları
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start bg-transparent">
              <Link href="/financials/chart-of-accounts">
                <List className="mr-2 h-4 w-4" />
                Hesap Planı
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Raporlar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Yakında eklenecek raporlama özellikleri.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
