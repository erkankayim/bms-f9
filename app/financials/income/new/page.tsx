import { AuthWrapper } from "../../_components/auth-wrapper"
import IncomeForm from "./_components/income-form"

export default function NewIncomePage() {
  return (
    <AuthWrapper>
      <div className="container mx-auto py-8">
        <div className="flex justify-center">
          <IncomeForm />
        </div>
      </div>
    </AuthWrapper>
  )
}
