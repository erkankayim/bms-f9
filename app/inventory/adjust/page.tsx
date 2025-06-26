import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import dynamic from "next/dynamic"

const StockAdjustmentForm = dynamic(
  () => import("./_components/stock-adjustment-form").then((mod) => mod.StockAdjustmentForm)
)

export default function StockAdjustmentPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8 px-4 sm:px-6 lg:px-8">
      {/* Sol üstte geri butonu ve başlık */}
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/inventory">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Stoklara Geri Dön
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Manuel Stok Ayarlama</h1>
      </div>

      {/* Açıklama paragrafı */}
      <p className="mt-2 mb-8 text-sm text-gray-600 dark:text-gray-400">
        Bu formu kullanarak ürünlerin stok miktarlarını manuel olarak artırabilir veya azaltabilirsiniz. Pozitif bir
        değer stok artışını, negatif bir değer stok azalışını ifade eder.
      </p>

      <main>
        {/* Dinamik olarak yüklenen bileşen */}
        <StockAdjustmentForm />
      </main>
    </div>
  )
}
