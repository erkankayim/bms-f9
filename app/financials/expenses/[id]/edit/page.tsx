import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getExpenseById } from "../../_actions/expense-actions"
import { EditExpenseForm } from "./_components/edit-expense-form"

interface EditExpensePageProps {
  params: {
    id: string
  }
}

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const result = await getExpenseById(params.id)

  if (result.error || !result.data) {
    notFound()
  }

  const expense = result.data

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/financials/expenses/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri Dön
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gider Düzenle</h1>
          <p className="text-muted-foreground">
            #{expense.id} - {expense.expense_title}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Gider Bilgilerini Düzenle</CardTitle>
          <CardDescription>
            Gider kaydının bilgilerini güncelleyin. Tüm alanları kontrol ettikten sonra kaydedin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditExpenseForm expense={expense} expenseId={params.id} />
        </CardContent>
      </Card>
    </div>
  )
}
