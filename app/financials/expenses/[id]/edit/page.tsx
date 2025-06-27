import { notFound } from "next/navigation"
import { getExpenseEntryById } from "../../../_actions/financial-entries-actions"
import { EditExpenseForm } from "./_components/edit-expense-form"

interface EditExpensePageProps {
  params: {
    id: string
  }
}

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const expenseId = Number.parseInt(params.id)

  if (isNaN(expenseId)) {
    notFound()
  }

  const { data: expense, error } = await getExpenseEntryById(expenseId)

  if (error || !expense) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-center">
        <EditExpenseForm expense={expense} />
      </div>
    </div>
  )
}
