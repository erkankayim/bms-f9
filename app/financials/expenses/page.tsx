import { lusitana } from "@/app/ui/fonts"
import { ExpensesTable } from "./expenses-table"
import { CreateExpense } from "./create-expense"
import { getExpenseEntries } from "../_actions/actions"

async function Expenses({
  query,
  currentPage,
}: {
  query?: string
  currentPage?: number
}) {
  const expenseEntries = await getExpenseEntries(query, currentPage)

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Expenses</h1>
      </div>
      <CreateExpense />
      <ExpensesTable expenseEntries={expenseEntries} query={query || ""} currentPage={currentPage || 1} />
    </div>
  )
}

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string
    page?: string
  }
}) {
  const query = searchParams?.query || ""
  const currentPage = Number(searchParams?.page) || 1

  return <Expenses query={query} currentPage={currentPage} />
}
