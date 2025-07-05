"use client"

import { useEffect, useState, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PackageOpen, AlertCircle, Loader2 } from "lucide-react"

type InventoryMovement = {
  id: number
  movement_date: string
  movement_type: string
  quantity_changed: number
  quantity_after_movement: number
  reference_document_id: string | null
  notes: string | null
  user_id: string | null
  user_email: string | null
  supplier_id: string | null
  supplier_name: string | null
  supplier_code: string | null
}

interface ProductMovementsModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  productStockCode: string | null
  productName: string | null
}

const movementTypeDisplay: Record<
  string,
  { text: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }
> = {
  initial_stock: { text: "İlk Stok", variant: "secondary" },
  purchase_received: { text: "Alım Yapıldı", variant: "success" },
  sale: { text: "Satış", variant: "destructive" },
  customer_return: { text: "Müşteri İadesi", variant: "success" },
  supplier_return: { text: "Tedarikçiye İade", variant: "warning" },
  adjustment_positive: { text: "Stok Ayarlama (+)", variant: "success" },
  adjustment_negative: { text: "Stok Ayarlama (-)", variant: "warning" },
  inventory_count_discrepancy: { text: "Sayım Farkı", variant: "outline" },
  default: { text: "Diğer", variant: "default" },
}

const getMovementTypeStyle = (type: string) => {
  return movementTypeDisplay[type] || movementTypeDisplay.default
}

export function ProductMovementsModal({
  isOpen,
  onOpenChange,
  productStockCode,
  productName,
}: ProductMovementsModalProps) {
  const supabase = getSupabaseBrowserClient()
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMovements = useCallback(async () => {
    if (!productStockCode || !isOpen) {
      setMovements([])
      return
    }

    setIsLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from("inventory_movements")
      .select(
        `
        id,
        movement_date,
        movement_type,
        quantity_changed,
        quantity_after_movement,
        reference_document_id,
        notes,
        user_id, 
        user_email,
        supplier_id,
        suppliers (
          name,
          supplier_code
        )
      `,
      )
      .eq("product_stock_code", productStockCode)
      .order("movement_date", { ascending: false })
      .order("created_at", { ascending: false })

    if (fetchError) {
      console.error("Error fetching product movements:", fetchError)
      setError(`Stok hareketleri yüklenirken bir hata oluştu: ${fetchError.message}`)
      setMovements([])
    } else {
      const formattedMovements =
        data?.map((movement: any) => ({
          id: movement.id,
          movement_date: movement.movement_date,
          movement_type: movement.movement_type,
          quantity_changed: movement.quantity_changed,
          quantity_after_movement: movement.quantity_after_movement,
          reference_document_id: movement.reference_document_id,
          notes: movement.notes,
          user_id: movement.user_id,
          user_email: movement.user_email,
          supplier_id: movement.supplier_id,
          supplier_name: movement.suppliers?.name || null,
          supplier_code: movement.suppliers?.supplier_code || null,
        })) || []
      setMovements(formattedMovements)
    }
    setIsLoading(false)
  }, [supabase, productStockCode, isOpen])

  useEffect(() => {
    if (isOpen && productStockCode) {
      fetchMovements()
    } else {
      setMovements([])
      setError(null)
      setIsLoading(false)
    }
  }, [isOpen, productStockCode, fetchMovements])

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            Stok Hareketleri: {productName || "N/A"} ({productStockCode || "N/A"})
          </DialogTitle>
          <DialogDescription>Bu ürün için kaydedilmiş tüm stok giriş ve çıkış hareketleri.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
              <p className="mt-4 text-gray-500">Stok hareketleri yükleniyor...</p>
            </div>
          )}
          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <p className="mt-4 font-semibold text-red-600">Bir Hata Oluştu</p>
              <p className="mt-1 text-sm text-red-500">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchMovements} className="mt-4 bg-transparent">
                Tekrar Dene
              </Button>
            </div>
          )}
          {!isLoading && !error && movements.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center">
              <PackageOpen className="h-12 w-12 text-gray-400" />
              <p className="mt-4 font-semibold text-gray-700 dark:text-gray-300">Stok Hareketi Bulunamadı</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Bu ürün için henüz kaydedilmiş bir stok hareketi yok.
              </p>
            </div>
          )}
          {!isLoading && !error && movements.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead className="text-right">Değişim</TableHead>
                  <TableHead className="text-right">Son Stok</TableHead>
                  <TableHead>Tedarikçi</TableHead>
                  <TableHead>Referans</TableHead>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Notlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {new Date(movement.movement_date).toLocaleString("tr-TR", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getMovementTypeStyle(movement.movement_type).variant}>
                        {getMovementTypeStyle(movement.movement_type).text}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${movement.quantity_changed > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {movement.quantity_changed > 0 ? `+${movement.quantity_changed}` : movement.quantity_changed}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{movement.quantity_after_movement}</TableCell>
                    <TableCell className="max-w-[150px]">
                      {movement.supplier_name ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{movement.supplier_name}</span>
                          {movement.supplier_code && (
                            <span className="text-xs text-muted-foreground">({movement.supplier_code})</span>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{movement.reference_document_id || "-"}</TableCell>
                    <TableCell
                      className="max-w-[150px] truncate"
                      title={movement.user_email || movement.user_id || undefined}
                    >
                      {movement.user_email || movement.user_id || "-"}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={movement.notes || undefined}>
                      {movement.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Kapat
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
