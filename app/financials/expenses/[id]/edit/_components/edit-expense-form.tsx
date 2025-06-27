"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { Loader2, Save } from "lucide-react"

import { updateExpense, type ExpensePayload } from "../../../_actions/expense-actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

const schema = z.object({
  expense_title: z.string().min(2, "En az 2 karakter"),
  expense_amount: z.coerce.number().positive("Pozitif olmalı"),
  description: z.string().max(255).optional(),
})

interface EditExpenseFormProps {
  expense: Record<string, any>
  expenseId: string | number
}

export function EditExpenseForm({ expense, expenseId }: EditExpenseFormProps) {
  const [formData, setFormData] = useState<ExpensePayload>({
    expense_title: expense.expense_title ?? "",
    description: expense.description ?? "",
    expense_amount: expense.expense_amount ?? 0,
    payment_amount: expense.payment_amount ?? 0,
    entry_date: expense.entry_date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const parsed = schema.safeParse(formData)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    startTransition(async () => {
      const { error } = await updateExpense(expenseId, parsed.data)
      if (error) {
        toast({ variant: "destructive", title: "Kaydedilemedi", description: error.message })
        return
      }
      toast({ variant: "default", title: "Gider güncellendi" })
      router.push(`/financials/expenses/${expenseId}`)
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <Label htmlFor="expense_title">Başlık</Label>
        <Input
          id="expense_title"
          name="expense_title"
          value={formData.expense_title}
          onChange={handleChange}
          disabled={pending}
        />
        {errors.expense_title && <p className="text-destructive text-sm">{errors.expense_title}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1">
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description ?? ""}
          onChange={handleChange}
          disabled={pending}
        />
        {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
      </div>

      {/* Amount */}
      <div className="space-y-1">
        <Label htmlFor="expense_amount">Tutar (₺)</Label>
        <Input
          id="expense_amount"
          type="number"
          step="0.01"
          name="expense_amount"
          value={formData.expense_amount}
          onChange={handleChange}
          disabled={pending}
        />
        {errors.expense_amount && <p className="text-destructive text-sm">{errors.expense_amount}</p>}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />} Kaydet
      </Button>
    </form>
  )
}
