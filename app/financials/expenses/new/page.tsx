import ExpenseForm from "./expense-form"

import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { checkSubscription } from "@/lib/subscription"
import { Separator } from "@/components/ui/separator"
import { Shell } from "@/components/shell"
import { CreateExpense } from "./create-expense"
import { getFinancialCategories, getSuppliers } from "../../_actions/actions"

const Page = async () => {
  const { userId } = auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const isPro = await checkSubscription()
  const categories = await getFinancialCategories(userId)
  const suppliers = await getSuppliers(userId)

  return (
    <Shell>
      <div className="grid gap-6">
        <div>
          <h1 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
            New Expense
          </h1>
          <p className="text-muted-foreground text-sm">Create a new expense for your business.</p>
        </div>
        <Separator />
        <div>{isPro ? <ExpenseForm categories={categories} suppliers={suppliers} /> : <CreateExpense />}</div>
      </div>
    </Shell>
  )
}

export default Page
