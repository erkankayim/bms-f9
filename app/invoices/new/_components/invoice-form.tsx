"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createInvoice } from "../../_actions/invoice-actions"
import { useActionState } from "react"

interface Customer {
  mid: string
  service_name: string
  contact_name: string
}

interface Supplier {
  id: string
  name: string
  contact_name: string
}

interface InvoiceFormProps {
  customers: Customer[]
  suppliers: Supplier[]
}

const DOCUMENT_TYPES = [
  { value: "invoice", label: "Fatura" },
  { value: "receipt", label: "Fiş" },
  { value: "credit_note", label: "İade Faturası" },
  { value: "debit_note", label: "Borç Dekontu" },
  { value: "proforma", label: "Proforma Fatura" },
  { value: "other", label: "Diğer" },
]

export default function InvoiceForm({ customers, suppliers }: InvoiceFormProps) {
  const [state, formAction, isPending] = useActionState(createInvoice, null)
  const [invoiceType, setInvoiceType] = useState<"incoming" | "outgoing">("outgoing")

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Yeni Fatura Oluştur</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fatura Türü */}
            <div className="space-y-2">
              <Label htmlFor="invoice_type">Fatura Türü *</Label>
              <Select
                name="invoice_type"
                value={invoiceType}
                onValueChange={(value: "incoming" | "outgoing") => setInvoiceType(value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Fatura türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outgoing">Giden Fatura</SelectItem>
                  <SelectItem value="incoming">Gelen Fatura</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fatura Numarası */}
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Fatura Numarası *</Label>
              <Input
                id="invoice_number"
                name="invoice_number"
                type="text"
                required
                placeholder="Fatura numarası girin"
              />
            </div>

            {/* Belge Türü */}
            <div className="space-y-2">
              <Label htmlFor="document_type">Belge Türü</Label>
              <Select name="document_type" defaultValue="invoice">
                <SelectTrigger>
                  <SelectValue placeholder="Belge türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Belge Numarası */}
            <div className="space-y-2">
              <Label htmlFor="document_number">Belge Numarası</Label>
              <Input id="document_number" name="document_number" type="text" placeholder="Belge numarası girin" />
            </div>

            {/* Düzenleme Tarihi */}
            <div className="space-y-2">
              <Label htmlFor="issue_date">Düzenleme Tarihi *</Label>
              <Input
                id="issue_date"
                name="issue_date"
                type="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Vade Tarihi */}
            <div className="space-y-2">
              <Label htmlFor="due_date">Vade Tarihi</Label>
              <Input id="due_date" name="due_date" type="date" />
            </div>

            {/* Firma Seçimi */}
            {invoiceType === "outgoing" ? (
              <div className="space-y-2">
                <Label htmlFor="customer_id">Müşteri *</Label>
                <Select name="customer_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Müşteri seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.mid} value={customer.mid}>
                        {customer.service_name} - {customer.contact_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="supplier_id">Tedarikçi *</Label>
                <Select name="supplier_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Tedarikçi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name} - {supplier.contact_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Toplam Tutar */}
            <div className="space-y-2">
              <Label htmlFor="total_amount">Toplam Tutar *</Label>
              <Input
                id="total_amount"
                name="total_amount"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
              />
            </div>

            {/* Vergi Tutarı */}
            <div className="space-y-2">
              <Label htmlFor="tax_amount">Vergi Tutarı</Label>
              <Input
                id="tax_amount"
                name="tax_amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                placeholder="0.00"
              />
            </div>

            {/* İndirim Tutarı */}
            <div className="space-y-2">
              <Label htmlFor="discount_amount">İndirim Tutarı</Label>
              <Input
                id="discount_amount"
                name="discount_amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Açıklama */}
          <div className="space-y-2">
            <Label htmlFor="notes">Açıklama</Label>
            <Textarea id="notes" name="notes" placeholder="Fatura ile ilgili notlar..." rows={3} />
          </div>

          {/* Hata mesajı */}
          {state?.error && <div className="text-red-600 text-sm">{state.error}</div>}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Oluşturuluyor..." : "Fatura Oluştur"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
