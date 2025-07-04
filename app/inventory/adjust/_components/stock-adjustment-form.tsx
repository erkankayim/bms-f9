"use client"

import React from "react"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { adjustStockQuantityAction, searchProductsForAdjustment } from "../../../_actions/inventory-actions"
import type { ProductSearchResult, StockAdjustmentFormState } from "../../../_actions/inventory-actions"
import { useDebounce } from "@/hooks/use-debounce"
import { useToast } from "@/components/ui/use-toast"

export function StockAdjustmentForm() {
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([])
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Ürün arama
  React.useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      setIsSearching(true)
      searchProductsForAdjustment(debouncedSearchTerm)
        .then((result) => {
          if (result.success && result.data) {
            setSearchResults(result.data)
          } else {
            setSearchResults([])
          }
        })
        .catch(() => setSearchResults([]))
        .finally(() => setIsSearching(false))
    } else {
      setSearchResults([])
    }
  }, [debouncedSearchTerm])

  async function handleSubmit(formData: FormData) {
    if (!selectedProduct) {
      toast({
        title: "Hata",
        description: "Lütfen bir ürün seçin",
        variant: "destructive",
      })
      return
    }

    const initialState: StockAdjustmentFormState = {
      success: false,
      message: "",
    }

    startTransition(async () => {
      try {
        const result = await adjustStockQuantityAction(initialState, formData)

        if (result.success) {
          toast({
            title: "Başarılı",
            description: result.message,
            variant: "default",
          })
          // Formu temizle
          setSelectedProduct(null)
          setSearchTerm("")
          setSearchResults([])
          // Form elementlerini temizle
          const form = document.querySelector("form") as HTMLFormElement
          if (form) form.reset()
        } else {
          toast({
            title: "Hata",
            description: result.message,
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Hata",
          description: "Beklenmeyen bir hata oluştu",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Stok Ayarlama</CardTitle>
        <CardDescription>Ürün stoklarını artırın veya azaltın</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-search">Ürün Ara</Label>
            <Input
              id="product-search"
              type="text"
              placeholder="Ürün adı veya stok kodu ile arayın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isPending}
            />

            {isSearching && <p className="text-sm text-muted-foreground">Aranıyor...</p>}

            {searchResults.length > 0 && (
              <div className="border rounded-md max-h-48 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className="w-full text-left p-3 hover:bg-muted border-b last:border-b-0"
                    onClick={() => {
                      setSelectedProduct(product)
                      setSearchTerm(product.name)
                      setSearchResults([])
                    }}
                  >
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Stok Kodu: {product.stock_code} | Mevcut: {product.current_stock}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedProduct && (
            <>
              <input type="hidden" name="productId" value={selectedProduct.stock_code} />

              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium">{selectedProduct.name}</div>
                <div className="text-sm text-muted-foreground">
                  Stok Kodu: {selectedProduct.stock_code} | Mevcut Stok: {selectedProduct.current_stock}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Değişim Miktarı</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  placeholder="Pozitif: artır, Negatif: azalt"
                  required
                  disabled={isPending}
                />
                <p className="text-sm text-muted-foreground">Örnek: +10 (10 adet ekle), -5 (5 adet çıkar)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notlar</Label>
                <Textarea id="notes" name="notes" placeholder="Stok ayarlama sebebi..." disabled={isPending} />
              </div>

              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Ayarlanıyor..." : "Stok Ayarla"}
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
