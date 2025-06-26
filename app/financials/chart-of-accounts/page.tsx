import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, ListTree } from "lucide-react"
import { accountTypes } from "./_lib/schema"
import { getChartOfAccounts } from "./_actions/server-actions"
import { AccountsTableClient } from "./_components/accounts-table-client"
import { AuthWrapper } from "../_components/auth-wrapper"

interface Props {
  searchParams: { search?: string; type?: string; page?: string }
}

export default async function ChartOfAccountsPage({ searchParams }: Props) {
  const search = searchParams.search ?? ""
  const type = searchParams.type ?? "All"
  const current = Number(searchParams.page) || 1

  let accounts: any[] = []
  let count = 0
  let error: string | null = null

  try {
    const result = await getChartOfAccounts({
      searchTerm: search,
      accountType: type,
      page: current,
      pageSize: 10,
    })
    accounts = result.accounts
    count = result.count
  } catch (err) {
    console.error("Chart of accounts error:", err)
    error = err instanceof Error ? err.message : "Veri yüklenirken hata oluştu"
  }

  const total = Math.ceil(count / 10)

  const content = (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <ListTree className="mr-3 h-8 w-8" />
            Hesap Planı
          </h1>
          <p className="text-muted-foreground">Mali hesaplarınızı yönetin.</p>
        </div>
        <Link href="/financials/chart-of-accounts/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Hesap
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hesap Listesi</CardTitle>
          <CardDescription>Filtreleyebilir ve arama yapabilirsiniz.</CardDescription>
          {!error && (
            <form className="mt-4 flex flex-col sm:flex-row gap-2">
              <Input
                type="search"
                name="search"
                placeholder="Kod ya da ad ile ara…"
                defaultValue={search}
                className="sm:max-w-xs"
              />
              <Select name="type" defaultValue={type}>
                <SelectTrigger className="sm:w-[200px]">
                  <SelectValue placeholder="Tür" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">Tüm Türler</SelectItem>
                  {accountTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit">Filtrele</Button>
            </form>
          )}
        </CardHeader>

        <CardContent>
          {error ? (
            <div className="text-center py-10 text-destructive">Hata: {error}</div>
          ) : (
            <AccountsTableClient accounts={accounts} />
          )}
        </CardContent>

        {!error && total > 1 && (
          <CardContent className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Sayfa {current}/{total} ({count} hesap)
              </span>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" disabled={current <= 1}>
                  <Link href={`?page=${current - 1}&search=${search}&type=${type}`}>Önceki</Link>
                </Button>
                <Button asChild variant="outline" size="sm" disabled={current >= total}>
                  <Link href={`?page=${current + 1}&search=${search}&type=${type}`}>Sonraki</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )

  return <AuthWrapper>{content}</AuthWrapper>
}
