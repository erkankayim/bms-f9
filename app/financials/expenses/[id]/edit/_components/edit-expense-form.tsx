"use client"

import { useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateExpenseEntry } from "@/app/financials/_actions/financial-entries-actions"
import { expenseCategories } from "@/app/financials/_lib/financial-entry-shared"
import { useRouter } from "next/navigation"

interface Account {
  id: string
  name: string
  account_type: string
}

interface ExpenseEntry {
  id: string
  description: string
  amount: number
  category: string
  account_id: string
  entry_date: string
}

interface EditExpenseFormProps {
  expense: ExpenseEntry
  accounts: Account[]
}

export function EditExpenseForm({ expense, accounts }: EditExpenseFormProps) {
  const updateExpenseWithId = updateExpenseEntry.bind(null, expense.id)
  const [state, formAction, isPending] = useActionState(updateExpenseWithId, null)
  const router = useRouter()

  useEffect(() => {
    if (state?.success) {
      // Başarılı olduğunda gider detay sayfasına yönlendir
      setTimeout(() => {
        router.push(`/financials/expenses/${expense.id}`)
      }, 1500)
    }
  }, [state?.success, router, expense.id])

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Gider Kaydını Düzenle</CardTitle>
        <CardDescription>Gider kaydı bilgilerini güncelleyin</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Gider açıklaması..."
              defaultValue={expense.description}
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
                defaultValue={expense.amount}
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
                defaultValue={expense.entry_date}
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select name="category" required disabled={isPending} defaultValue={expense.category}>
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
              <Select name="account_id" required disabled={isPending} defaultValue={expense.account_id}>
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
              {isPending ? "Güncelleniyor..." : "Gider Kaydını Güncelle"}
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
