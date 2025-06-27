"use client"

import { useFormState, useFormStatus } from "react-dom"
import { createIncomeEntry } from "../../../_actions/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FinancialCategory } from "@prisma/client"

interface IncomeFormProps {
  categories: FinancialCategory[]
  customers: { mid: string; contact_name: string | null }[]
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Kaydediliyor..." : "Gelir Kaydını Oluştur"}
    </Button>
  )
}

export function IncomeForm({ categories, customers }: IncomeFormProps) {
  const [state, formAction] = useFormState(createIncomeEntry, null)

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="description">Açıklama</Label>
        <Input id="description" name="description" required />
        {state?.errors?.description && <p className="text-red-500 text-sm mt-1">{state.errors.description[0]}</p>}
      </div>

      <div>
        <Label htmlFor="incoming_amount">Tutar</Label>
        <Input id="incoming_amount" name="incoming_amount" type="number" step="0.01" required />
        {state?.errors?.incoming_amount && (
          <p className="text-red-500 text-sm mt-1">{state.errors.incoming_amount[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="entry_date">Tarih</Label>
        <Input
          id="entry_date"
          name="entry_date"
          type="date"
          defaultValue={new Date().toISOString().split("T")[0]}
          required
        />
        {state?.errors?.entry_date && <p className="text-red-500 text-sm mt-1">{state.errors.entry_date[0]}</p>}
      </div>

      <div>
        <Label htmlFor="category_id">Kategori</Label>
        <Select name="category_id" required>
          <SelectTrigger>
            <SelectValue placeholder="Bir kategori seçin" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.category_id && <p className="text-red-500 text-sm mt-1">{state.errors.category_id[0]}</p>}
      </div>

      <div>
        <Label htmlFor="customer_id">Müşteri (İsteğe Bağlı)</Label>
        <Select name="customer_id">
          <SelectTrigger>
            <SelectValue placeholder="Bir müşteri seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Müşteri Yok</SelectItem>
            {customers.map((cust) => (
              <SelectItem key={cust.mid} value={cust.mid}>
                {cust.contact_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="payment_method">Ödeme Yöntemi</Label>
        <Select name="payment_method" defaultValue="Nakit" required>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Nakit">Nakit</SelectItem>
            <SelectItem value="Kredi Kartı">Kredi Kartı</SelectItem>
            <SelectItem value="Banka Transferi">Banka Transferi</SelectItem>
            <SelectItem value="Çek">Çek</SelectItem>
            <SelectItem value="Senet">Senet</SelectItem>
            <SelectItem value="Diğer">Diğer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Notlar (İsteğe Bağlı)</Label>
        <Textarea id="notes" name="notes" />
      </div>

      <SubmitButton />
      {state?.message && <p className="text-red-500 text-sm mt-2">{state.message}</p>}
    </form>
  )
}
