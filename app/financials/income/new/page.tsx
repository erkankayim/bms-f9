import { Suspense } from "react"
import IncomeForm from "./_components/income-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function IncomeFormSkeleton() {
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-48" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  )
}

export default function NewIncomePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center">
        <Suspense fallback={<IncomeFormSkeleton />}>
          <IncomeForm />
        </Suspense>
      </div>
    </div>
  )
}
