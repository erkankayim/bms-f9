import {
  getIncomeEntryById,
  getFinancialCategories,
  getCustomersForDropdown,
} from "@/app/financials/_actions/financial-entries-actions"
import { IncomeForm } from "../../new/_components/income-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { notFound } from "next/navigation"

export default async function EditIncomePage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (isNaN(id)) {
    notFound()
  }

  const [incomeData, categories, customers] = await Promise.all([
    getIncomeEntryById(id),
    getFinancialCategories("income"),
    getCustomersForDropdown(),
  ])

  if (!incomeData) {
    notFound()
  }

  // Map data to match form expectations
  const initialData = {
    ...incomeData,
    customer_id: incomeData.customer_mid, // Form expects MID
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Gelir Kaydını Düzenle</CardTitle>
          <CardDescription>ID: {id} numaralı gelir kaydını güncelleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <IncomeForm categories={categories} customers={customers} initialData={initialData} />
        </CardContent>
      </Card>
    </div>
  )
}
