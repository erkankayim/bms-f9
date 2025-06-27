import ExpenseForm from "./_components/expense-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewExpensePage() {
  return (
    <main className="p-6 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Yeni Gider Ekle</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm />
        </CardContent>
      </Card>
    </main>
  )
}
