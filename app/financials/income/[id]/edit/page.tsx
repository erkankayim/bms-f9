import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getIncomeEntryById } from "../../../_actions/financial-entries-actions"
import { EditIncomeForm } from "./_components/edit-income-form"

interface EditIncomePageProps {
  params: {
    id: string
  }
}

export default async function EditIncomePage({ params }: EditIncomePageProps) {
  const id = Number.parseInt(params.id)
  if (isNaN(id)) {
    notFound()
  }

  const result = await getIncomeEntryById(id)

  if (result.error || !result.data) {
    notFound()
  }

  const entry = result.data

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/financials/income/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Gelir Kaydını Düzenle</h1>
          <p className="text-muted-foreground">
            #{entry.id} - {entry.description}
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <EditIncomeForm initialData={entry} />
      </div>
    </div>
  )
}
