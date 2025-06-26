"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { addPayment } from "../../_actions/invoice-actions"
import { useActionState } from "react"
import { formatCurrency } from "@/lib/utils"

interface InvoiceDetailProps {
  invoice: any
}

const PAYMENT_METHODS = ["Nakit", "Kredi Kartı", "Banka Transferi", "Çek", "Senet", "Diğer"]

const STATUS_LABELS = {
  draft: "Taslak",
  sent: "Gönderildi",
  paid: "Ödendi",
  partially_paid: "Kısmen Ödendi",
  overdue: "Vadesi Geçmiş",
  cancelled: "İptal Edildi",
}

const STATUS_COLORS = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  partially_paid: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const [state, formAction, isPending] = useActionState(addPayment, null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  // Toplam ödenen tutarı hesapla
  const totalPaid =
    invoice.invoice_payments?.reduce((sum: number, payment: any) => sum + Number.parseFloat(payment.amount), 0) || 0

  const remainingAmount = Number.parseFloat(invoice.total_amount) - totalPaid

  return (
    <div className="space-y-6">
      {/* Fatura Başlığı */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Fatura #{invoice.invoice_number}</CardTitle>
              <p className="text-muted-foreground mt-1">
                {invoice.invoice_type === "outgoing" ? "Giden Fatura" : "Gelen Fatura"}
              </p>
            </div>
            <Badge className={STATUS_COLORS[invoice.status as keyof typeof STATUS_COLORS]}>
              {STATUS_LABELS[invoice.status as keyof typeof STATUS_LABELS]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fatura Bilgileri */}
            <div className="space-y-4">
              <h3 className="font-semibold">Fatura Bilgileri</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Belge Türü:</span>
                  <span>{invoice.document_type}</span>
                </div>
                {invoice.document_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Belge No:</span>
                    <span>{invoice.document_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Düzenleme Tarihi:</span>
                  <span>{new Date(invoice.issue_date).toLocaleDateString("tr-TR")}</span>
                </div>
                {invoice.due_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vade Tarihi:</span>
                    <span>{new Date(invoice.due_date).toLocaleDateString("tr-TR")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Firma Bilgileri */}
            <div className="space-y-4">
              <h3 className="font-semibold">{invoice.invoice_type === "outgoing" ? "Müşteri" : "Tedarikçi"}</h3>
              <div className="space-y-2 text-sm">
                {invoice.customers && (
                  <>
                    <div className="font-medium">{invoice.customers.service_name}</div>
                    <div>{invoice.customers.contact_name}</div>
                    {invoice.customers.phone && <div>{invoice.customers.phone}</div>}
                    {invoice.customers.email && <div>{invoice.customers.email}</div>}
                  </>
                )}
                {invoice.suppliers && (
                  <>
                    <div className="font-medium">{invoice.suppliers.name}</div>
                    <div>{invoice.suppliers.contact_name}</div>
                    {invoice.suppliers.phone && <div>{invoice.suppliers.phone}</div>}
                    {invoice.suppliers.email && <div>{invoice.suppliers.email}</div>}
                  </>
                )}
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Notlar</h3>
              <p className="text-sm text-muted-foreground">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tutar Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle>Tutar Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Toplam Tutar:</span>
              <span className="font-medium">{formatCurrency(Number.parseFloat(invoice.total_amount))}</span>
            </div>
            {Number.parseFloat(invoice.tax_amount) > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Vergi:</span>
                <span>{formatCurrency(Number.parseFloat(invoice.tax_amount))}</span>
              </div>
            )}
            {Number.parseFloat(invoice.discount_amount) > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>İndirim:</span>
                <span>-{formatCurrency(Number.parseFloat(invoice.discount_amount))}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between">
              <span>Ödenen:</span>
              <span className="font-medium text-green-600">{formatCurrency(totalPaid)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kalan:</span>
              <span className={`font-medium ${remainingAmount > 0 ? "text-red-600" : "text-green-600"}`}>
                {formatCurrency(remainingAmount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ödemeler */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Ödemeler</CardTitle>
            {remainingAmount > 0 && (
              <Button onClick={() => setShowPaymentForm(!showPaymentForm)}>
                {showPaymentForm ? "İptal" : "Ödeme Ekle"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Ödeme Formu */}
          {showPaymentForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Yeni Ödeme</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={formAction} className="space-y-4">
                  <input type="hidden" name="invoice_id" value={invoice.id} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment_date">Ödeme Tarihi *</Label>
                      <Input
                        id="payment_date"
                        name="payment_date"
                        type="date"
                        required
                        defaultValue={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Tutar *</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={remainingAmount}
                        required
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment_method">Ödeme Şekli *</Label>
                      <Select name="payment_method" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Ödeme şekli seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reference_number">Referans No</Label>
                      <Input
                        id="reference_number"
                        name="reference_number"
                        type="text"
                        placeholder="Referans numarası"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notlar</Label>
                    <Textarea id="notes" name="notes" placeholder="Ödeme ile ilgili notlar..." rows={2} />
                  </div>

                  {state?.error && <div className="text-red-600 text-sm">{state.error}</div>}

                  {state?.success && <div className="text-green-600 text-sm">{state.success}</div>}

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isPending}>
                      {isPending ? "Ekleniyor..." : "Ödeme Ekle"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Ödeme Listesi */}
          {invoice.invoice_payments && invoice.invoice_payments.length > 0 ? (
            <div className="space-y-4">
              {invoice.invoice_payments.map((payment: any) => (
                <div key={payment.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">{formatCurrency(Number.parseFloat(payment.amount))}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(payment.payment_date).toLocaleDateString("tr-TR")} • {payment.payment_method}
                    </div>
                    {payment.reference_number && (
                      <div className="text-sm text-muted-foreground">Ref: {payment.reference_number}</div>
                    )}
                    {payment.notes && <div className="text-sm text-muted-foreground mt-1">{payment.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">Henüz ödeme kaydı bulunmuyor.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
