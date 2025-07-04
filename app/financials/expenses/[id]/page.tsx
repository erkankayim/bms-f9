import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, FileText, Calendar, DollarSign, CreditCard, Building2, Tag } from "lucide-react"
import Link from "next/link"
import { getExpenseById } from "../_actions/expense-actions"
import { DeleteExpenseDialog } from "./_components/delete-expense-dialog"

interface ExpenseDetailPageProps {
  params: {
    id: string
  }
}

async function ExpenseDetail({ id }: { id: string }) {
  try {
    const expense = await getExpenseById(id)

    if (!expense) {
      notFound()
    }

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
              <h1 className="text-3xl font-bold tracking-tight">{expense.expense_title || "Gider Detayı"}</h1>
              <p className="text-muted-foreground">Gider kaydı #{expense.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={`/financials/expenses/${expense.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Düzenle
              </Button>
            </Link>
            <DeleteExpenseDialog expenseId={expense.id.toString()} expenseTitle={expense.expense_title || "Gider"} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Temel Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Başlık</label>
                    <p className="text-lg font-medium">{expense.expense_title || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Kaynak</label>
                    <p className="text-lg">{expense.expense_source || "-"}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Açıklama</label>
                  <p className="text-base">{expense.description || "-"}</p>
                </div>
                {expense.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notlar</label>
                    <p className="text-base">{expense.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Mali Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Gider Tutarı</label>
                    <p className="text-3xl font-bold text-red-600">
                      ₺{(expense.expense_amount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Ödenen Tutar</label>
                    <p className="text-3xl font-bold text-orange-600">
                      ₺{(expense.payment_amount || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Kalan Borç</label>
                  <p className="text-2xl font-bold text-yellow-600">
                    ₺
                    {((expense.expense_amount || 0) - (expense.payment_amount || 0)).toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Tarih Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Gider Tarihi</label>
                  <p className="text-base font-medium">
                    {expense.entry_date ? new Date(expense.entry_date).toLocaleDateString("tr-TR") : "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kayıt Tarihi</label>
                  <p className="text-base">
                    {expense.created_at ? new Date(expense.created_at).toLocaleDateString("tr-TR") : "-"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Ödeme Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ödeme Yöntemi</label>
                  <Badge variant="default" className="mt-1">
                    {expense.payment_method || "Belirtilmemiş"}
                  </Badge>
                </div>
                {expense.invoice_number && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fatura Numarası</label>
                    <p className="text-base font-mono">{expense.invoice_number}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Supplier & Category */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="mr-2 h-5 w-5" />
                  İlişkili Bilgiler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tedarikçi</label>
                  {expense.supplier ? (
                    <div className="mt-1">
                      <Badge variant="secondary">{expense.supplier.name}</Badge>
                      {expense.supplier.email && (
                        <p className="text-sm text-muted-foreground mt-1">{expense.supplier.email}</p>
                      )}
                      {expense.supplier.phone && (
                        <p className="text-sm text-muted-foreground">{expense.supplier.phone}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-base text-muted-foreground">Belirtilmemiş</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kategori</label>
                  {expense.category ? (
                    <Badge variant="outline" className="mt-1">
                      <Tag className="mr-1 h-3 w-3" />
                      {expense.category.name}
                    </Badge>
                  ) : (
                    <p className="text-base text-muted-foreground">Belirtilmemiş</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading expense:", error)
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-red-500 font-medium">Gider kaydı yüklenirken hata oluştu</p>
              <Link href="/financials/expenses">
                <Button variant="outline">Gider Listesine Dön</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}

export default function ExpenseDetailPage({ params }: ExpenseDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      }
    >
      <ExpenseDetail id={params.id} />
    </Suspense>
  )
}
