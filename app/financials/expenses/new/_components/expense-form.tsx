"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { createExpense } from "../_actions/expense-actions"
import { useToast } from "@/hooks/use-toast"

interface Account {
  id: number
  account_code: string
  account_name: string
  account_type: string
}

interface ExpenseFormProps {
  accounts: Account[]
}

export default function ExpenseForm({ accounts }: ExpenseFormProps) {
  const [date, setDate] = useState<Date>(new Date())
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [accountId, setAccountId] = useState("")
  const [category, setCategory] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const expenseCategories = [
    "Ofis Giderleri",
    "Kira",
    "Elektrik",
    "Su",
    "İnternet",
    "Telefon",
    "Yakıt",
    "Yemek",
    "Malzeme",
    "Pazarlama",
    "Diğer",
  ]

  const paymentMethods = ["Nakit", "Kredi Kartı", "Banka Kartı", "Havale/EFT", "Çek"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !description || !accountId || !category || !paymentMethod) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive",
        duration: 1500,
      })
      return
    }

    const amountNum = Number.parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Hata",
        description: "Geçerli bir tutar girin",
        variant: "destructive",
        duration: 1500,
      })
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("date", date.toISOString())
      formData.append("amount", amount)
      formData.append("description", description)
      formData.append("accountId", accountId)
      formData.append("category", category)
      formData.append("paymentMethod", paymentMethod)

      const result = await createExpense(formData)

      if (result.success) {
        toast({
          title: "Başarılı",
          description: `Gider kaydı başarıyla oluşturuldu. Tutar: ${amountNum.toLocaleString("tr-TR")} TL`,
          duration: 1500,
        })
        router.push("/financials/expenses")
      } else if (result.error) {
        toast({
          title: "Hata",
          description: result.error,
          variant: "destructive",
          duration: 1500,
        })
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Beklenmeyen bir hata oluştu",
        variant: "destructive",
        duration: 1500,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Yeni Gider Kaydı</CardTitle>
        <CardDescription>Yeni bir gider kaydı oluşturun</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tarih</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: tr }) : "Tarih seçin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Tutar (TL)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Gider açıklaması"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select onValueChange={setCategory} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ödeme Yöntemi</Label>
              <Select onValueChange={setPaymentMethod} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Ödeme yöntemi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hesap</Label>
            <Select onValueChange={setAccountId} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Hesap seçin" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.account_code} - {account.account_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Kaydediliyor..." : "Gider Kaydı Oluştur"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              İptal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
