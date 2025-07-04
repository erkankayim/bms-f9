import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, FileText, Calendar, DollarSign, Building2, CreditCard, StickyNote } from "lucide-react"
import Link from "next/link"
import { getExpenseById } from "../_actions/expense-actions"
import { DeleteExpenseDialog } from "./_components/delete-expense-dialog"

interface ExpenseDetailPageProps {
  params: {
    id: string
  }
}

export default async function ExpenseDetailPage({ params }: ExpenseDetailPageProps) {
  const result = await getExpenseById(params.id)

  if (result.error || !result.data) {
    notFound()
  }

  const expense = result.data

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/financials/expenses">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri Dön
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gider Detayı</h1>
            <p className="text-muted-foreground">
              #{expense.id} - {expense.expense_title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/financials/expenses/${params.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          </Link>
          <DeleteExpenseDialog expenseId={params.id} expenseTitle={expense.expense_title} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Temel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Gider Başlığı</label>
              <p className="text-lg font-semibold">{expense.expense_title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Açıklama</label>
              <p className="text-sm">{expense.description}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Gider Kaynağı</label>
              <p className="text-sm">{expense.expense_source}</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tarih</label>
                <p className="text-sm">{new Date(expense.entry_date).toLocaleDateString("tr-TR")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Mali Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Gider Tutarı</label>
              <p className="text-2xl font-bold text-red-600">
                ₺{expense.expense_amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ödenen Tutar</label>
              <p className="text-xl font-semibold text-orange-600">
                ₺{expense.payment_amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Kalan Borç</label>
              <p className="text-lg font-medium text-yellow-600">
                ₺
                {(expense.expense_amount - expense.payment_amount).toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ödeme Yöntemi</label>
                <Badge variant="default" className="ml-2">
                  {expense.payment_method}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category and Supplier */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Kategori ve Tedarikçi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Kategori</label>
              {expense.category ? (
                <Badge variant="outline" className="ml-2">
                  {expense.category.name}
                </Badge>
              ) : (
                <p className="text-sm text-muted-foreground">Kategori belirtilmemiş</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tedarikçi</label>
              {expense.supplier ? (
                <div className="mt-1">
                  <Badge variant="secondary">{expense.supplier.name}</Badge>
                  {expense.supplier.email && (
                    <p className="text-sm text-muted-foreground mt-1">{expense.supplier.email}</p>
                  )}
                  {expense.supplier.phone && <p className="text-sm text-muted-foreground">{expense.supplier.phone}</p>}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Tedarikçi belirtilmemiş</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Ek Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fatura Numarası</label>
              <p className="text-sm">{expense.invoice_number || "Belirtilmemiş"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notlar</label>
              <p className="text-sm">{expense.notes || "Not bulunmuyor"}</p>
            </div>
            {expense.receipt_url && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fiş/Makbuz</label>
                <Link href={expense.receipt_url} target="_blank" className="block">
                  <Button variant="outline" size="sm" className="mt-1 bg-transparent">
                    <FileText className="mr-2 h-4 w-4" />
                    Fiş Görüntüle
                  </Button>
                </Link>
              </div>
            )}
            <Separator />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Oluşturulma: {new Date(expense.created_at).toLocaleString("tr-TR")}</p>
              {expense.updated_at && <p>Son Güncelleme: {new Date(expense.updated_at).toLocaleString("tr-TR")}</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
