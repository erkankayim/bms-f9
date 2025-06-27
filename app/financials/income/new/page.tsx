import { getFinancialCategories, getCustomers } from "../../_actions/actions"
import { IncomeForm } from "./_components/income-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function NewIncomePage() {
  const [categories, customers] = await Promise.all([getFinancialCategories("income"), getCustomers()])

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Yeni Gelir Kaydı</CardTitle>
          <CardDescription>Yeni bir gelir işlemi ekleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <IncomeForm categories={categories} customers={customers} />
        </CardContent>
      </Card>
    </div>
  )
}
