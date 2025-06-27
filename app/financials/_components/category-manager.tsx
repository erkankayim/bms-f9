"use client"

import { useState } from "react"
import { useActionState } from "react"
import {
  createFinancialCategory,
  deleteFinancialCategory,
  type FinancialCategory,
} from "../_actions/financial-entries-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Tag, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface CategoryManagerProps {
  categories: FinancialCategory[]
  type: "income" | "expense"
  onCategoryCreated?: () => void
}

const initialState = {
  success: false,
  message: "",
  errors: undefined,
}

export function CategoryManager({ categories, type, onCategoryCreated }: CategoryManagerProps) {
  const { toast } = useToast()
  const [state, formAction, isPending] = useActionState(createFinancialCategory, initialState)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState<number | null>(null)

  const typeLabel = type === "income" ? "Gelir" : "Gider"

  const handleDelete = async (categoryId: number) => {
    setDeletingCategory(categoryId)
    try {
      const result = await deleteFinancialCategory(categoryId)
      if (result.success) {
        toast({
          title: "Başarılı",
          description: result.message,
        })
        onCategoryCreated?.()
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
        description: "Kategori silinirken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setDeletingCategory(null)
    }
  }

  // Form başarılı olduğunda dialog'u kapat ve callback'i çağır
  if (state.success && isDialogOpen) {
    setIsDialogOpen(false)
    onCategoryCreated?.()
    toast({
      title: "Başarılı",
      description: state.message,
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {typeLabel} Kategorileri
            </CardTitle>
            <CardDescription>
              {typeLabel} kategorilerinizi yönetin. Yeni kategori ekleyebilir veya mevcut kategorileri silebilirsiniz.
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Kategori
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni {typeLabel} Kategorisi</DialogTitle>
                <DialogDescription>
                  Yeni bir {typeLabel.toLowerCase()} kategorisi oluşturun. Bu kategori daha sonra{" "}
                  {typeLabel.toLowerCase()} kayıtlarınızda kullanılabilir.
                </DialogDescription>
              </DialogHeader>
              <form action={formAction}>
                <div className="space-y-4">
                  {state.message && !state.success && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{state.message}</AlertDescription>
                    </Alert>
                  )}

                  <input type="hidden" name="type" value={type} />

                  <div className="space-y-2">
                    <Label htmlFor="name">Kategori Adı *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder={`Örn: ${type === "income" ? "Hizmet Bedeli, Ürün Satışı" : "Ofis Giderleri, Pazarlama"}`}
                      required
                    />
                    {state.errors?.find((e: any) => e.path[0] === "name") && (
                      <p className="text-sm text-destructive">
                        {state.errors.find((e: any) => e.path[0] === "name")?.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Bu kategorinin ne için kullanılacağını açıklayın..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Oluşturuluyor..." : "Kategori Oluştur"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Henüz kategori yok</p>
            <p className="text-sm">İlk {typeLabel.toLowerCase()} kategorinizi oluşturun</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{category.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {typeLabel}
                    </Badge>
                  </div>
                  {category.description && <p className="text-sm text-muted-foreground mt-1">{category.description}</p>}
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={deletingCategory === category.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle>
                      <AlertDialogDescription>
                        "{category.name}" kategorisini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        <br />
                        <br />
                        <strong>Not:</strong> Bu kategori kullanımda ise silinemez.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(category.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
