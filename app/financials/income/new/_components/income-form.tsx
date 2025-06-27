"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { createIncome } from "../../../_actions/actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Kaydediliyor…" : "Kaydet"}
    </Button>
  )
}

export default function IncomeForm() {
  const [error, setError] = useState<string | null>(null)

  async function action(formData: FormData) {
    try {
      await createIncome(formData)
    } catch (err) {
      setError("Kayıt sırasında bir hata oluştu.")
      console.error(err)
    }
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Tutar (₺)</Label>
        <Input id="amount" name="amount" type="number" step="0.01" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Açıklama</Label>
        <Input id="description" name="description" required />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <SubmitButton />
    </form>
  )
}
