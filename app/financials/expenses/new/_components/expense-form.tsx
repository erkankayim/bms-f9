"use client"

import { useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createExpenseEntry } from "@/app/financials/_actions/financial-entries-actions"
import { expenseCategories } from "@/app/financials/_lib/financial-entry-shared"
import { useRouter } from "next/navigation"

interface Account {
  id: string
  name: string
  account_type: string
}

interface ExpenseFormProps {
  accounts: Account[]
}

export function ExpenseForm({ accounts }: ExpenseFormProps) {
  const [state, formAction, isPending] = useActionState(createExpenseEntry, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success) {
      // Başarılı olduğunda gider listesine yönlendir
      setTimeout(() => {
        router.push("/financials/expenses")
      }, 1500)
    }
  }, [state?.success, router])

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Yeni Gider Kaydı</CardTitle>
        <CardDescription>Yeni bir gider kaydı oluşturun</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Gider açıklaması..."
              required
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Tutar (₺)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="entry_date">Tarih</Label>
              <Input
                id="entry_date"
                name="entry_date"
                type="date"
                required
                disabled={isPending}
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select name="category" required disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_id">Hesap</Label>
              <Select name="account_id" required disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Hesap seçin" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.account_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {state?.message && (
            <Alert variant={state.success ? "default" : "destructive"}>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Kaydediliyor..." : "Gider Kaydı Oluştur"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Provide a default export for pages that import it as default
export default ExpenseForm
