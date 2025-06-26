import { AuthWrapper } from "../../_components/auth-wrapper"
import ExpenseForm from "./_components/expense-form"

export default function NewExpensePage() {
  return (
    <AuthWrapper>
      <div className="container mx-auto py-8">
        <div className="flex justify-center">
          <ExpenseForm />
        </div>
      </div>
    </AuthWrapper>
  )
}
