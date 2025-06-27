import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Receipt, Building2, Calendar, CreditCard, FileText, DollarSign } from "lucide-react"
import Link from "next/link"
import { getExpenseEntryById } from "../../_actions/financial-entries-actions"
import { DeleteExpenseDialog } from "../_components/delete-expense-dialog"

interface ExpenseDetailPageProps {
  params: {
    id: string
  }
}

export default async function ExpenseDetailPage({ params }: ExpenseDetailPageProps) {
  const expenseId = Number.parseInt(params.id)

  if (isNaN(expenseId)) {
    notFound()
  }

  const { data: expense, error } = await getExpenseEntryById(expenseId)

  if (error || !expense) {
    notFound()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const remainingAmount = expense.expense_amount - expense.payment_amount

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
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
        <div className="flex items-center space-x-2">
          <Link href={`/financials/expenses/${expense.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          </Link>
          <DeleteExpenseDialog expenseId={expense.id} expenseTitle={expense.expense_title} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Ana Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Gider Bilgileri</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Başlık</label>
              <p className="text-lg font-semibold">{expense.expense_title}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Açıklama</label>
              <p className="text-sm">{expense.description}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Kaynak</label>
              <p className="text-sm">{expense.expense_source}</p>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tarih</label>
                <p className="text-sm">{formatDate(expense.entry_date)}</p>
              </div>
            </div>

            {expense.category_name && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kategori</label>
                <div className="mt-1">
                  <Badge variant="outline">{expense.category_name}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Finansal Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Finansal Detaylar</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Gider Tutarı</label>
                <p className="text-lg font-bold text-red-600">{formatCurrency(expense.expense_amount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ödenen Tutar</label>
                <p className="text-lg font-bold text-orange-600">{formatCurrency(expense.payment_amount)}</p>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground">Kalan Borç</label>
              <p className={`text-lg font-bold ${remainingAmount > 0 ? "text-yellow-600" : "text-green-600"}`}>
                {formatCurrency(remainingAmount)}
              </p>
              {remainingAmount === 0 && (
                <Badge variant="default" className="mt-1 bg-green-100 text-green-800">
                  Tamamen Ödendi
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ödeme Şekli</label>
                <div className="mt-1">
                  <Badge variant="default">{expense.payment_method}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tedarikçi Bilgileri */}
        {expense.supplier_name && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Tedarikçi Bilgileri</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tedarikçi</label>
                <p className="text-lg font-semibold">{expense.supplier_name}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fatura ve Ek Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Receipt className="h-5 w-5" />
              <span>Fatura ve Ek Bilgiler</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {expense.invoice_number && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fatura Numarası</label>
                <p className="text-sm font-mono">{expense.invoice_number}</p>
              </div>
            )}

            {expense.receipt_url && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fiş/Makbuz</label>
                <div className="mt-1">
                  <Button variant="outline" size="sm" asChild>
                    <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer">
                      <Receipt className="mr-2 h-4 w-4" />
                      Fiş Görüntüle
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {expense.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Notlar</label>
                <p className="text-sm bg-muted p-3 rounded-md">{expense.notes}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-muted-foreground">Oluşturulma Tarihi</label>
              <p className="text-sm">{formatDate(expense.created_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
