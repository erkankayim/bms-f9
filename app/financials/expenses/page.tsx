import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function ExpensesPage() {
  return (
    <main className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gider Kayıtları</h1>
        <Button asChild>
          <Link href="/financials/expenses/new">Yeni Gider Ekle</Link>
        </Button>
      </header>

      <p className="text-sm text-muted-foreground">Henüz kayıt yok. Sağ üstteki butonla ilk giderinizi ekleyin.</p>
    </main>
  )
}
