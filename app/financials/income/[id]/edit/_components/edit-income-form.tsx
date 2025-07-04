"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { updateIncomeEntryAction } from "../_actions/income-actions"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface EditIncomeFormProps {
  incomeEntry: any
}

export function EditIncomeForm({ incomeEntry }: EditIncomeFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>(new Date(incomeEntry.entry_date))
  const [customers, setCustomers] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])

  const [formData, setFormData] = useState({
    description: incomeEntry.description || "",
    incoming_amount: incomeEntry.incoming_amount?.toString() || "",
    income_source: incomeEntry.income_source || "",
    category_id: incomeEntry.category_id?.toString() || "default_category",
    customer_mid: incomeEntry.customer_mid || "default_customer",
    payment_method: incomeEntry.payment_method || "cash",
    invoice_number: incomeEntry.invoice_number || "",
    notes: incomeEntry.notes || "",
  })

  useEffect(() => {
    // Müşterileri ve kategorileri yükle
    async function fetchData() {
      // Bu fonksiyonlar gerçek implementasyonda Supabase'den veri çekecek
      setCustomers([])
      setCategories([])
    }
    fetchData()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description || !formData.incoming_amount) {
      toast({
        title: "Hata",
        description: "Açıklama ve tutar alanları zorunludur.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const updateData = {
        ...formData,
        incoming_amount: Number.parseFloat(formData.incoming_amount),
        entry_date: date.toISOString(),
      }

      const result = await updateIncomeEntryAction(incomeEntry.id, updateData)

      if (result.success) {
        toast({
          title: "Başarılı",
          description: "Gelir kaydı başarıyla güncellendi.",
        })
        router.push(`/financials/income/${incomeEntry.id}`)
      } else {
        toast({
          title: "Hata",
          description: result.error || "Gelir kaydı güncellenirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating income:", error)
      toast({
        title: "Hata",
        description: "Gelir kaydı güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Edit Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Income description"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="incoming_amount">Amount *</Label>
                <Input
                  id="incoming_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.incoming_amount}
                  onChange={(e) => handleInputChange("incoming_amount", e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="income_source">Income Source</Label>
                <Input
                  id="income_source"
                  value={formData.income_source}
                  onChange={(e) => handleInputChange("income_source", e.target.value)}
                  placeholder="Income source"
                />
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: tr }) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_mid">Customer</Label>
                <Select
                  value={formData.customer_mid}
                  onValueChange={(value) => handleInputChange("customer_mid", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default_customer">No Customer</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.mid} value={customer.mid}>
                        {customer.contact_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => handleInputChange("payment_method", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category_id">Category</Label>
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange("category_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default_category">No Category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice_number">Invoice Number</Label>
                <Input
                  id="invoice_number"
                  value={formData.invoice_number}
                  onChange={(e) => handleInputChange("invoice_number", e.target.value)}
                  placeholder="Invoice number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Income"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/financials/income/${incomeEntry.id}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
