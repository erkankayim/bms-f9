import IncomeForm from "./_components/income-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NewIncomePage() {
  return (
    <main className="p-6 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Yeni Gelir Ekle</CardTitle>
        </CardHeader>
        <CardContent>
          <IncomeForm />
        </CardContent>
      </Card>
    </main>
  )
}
