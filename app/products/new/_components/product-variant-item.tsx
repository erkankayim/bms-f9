"use client"

import type { Control, UseFieldArrayRemove, UseFormRegister } from "react-hook-form"
import { useFieldArray, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Trash2, XCircle } from "lucide-react"
import type { ProductFormValues } from "./product-form"

interface ProductVariantItemProps {
  variantIndex: number
  control: Control<ProductFormValues>
  register: UseFormRegister<ProductFormValues>
  removeVariantType: UseFieldArrayRemove
  getFormErrorMessage: (name: any) => string | undefined
}

export function ProductVariantItem({
  variantIndex,
  control,
  register,
  removeVariantType,
  getFormErrorMessage,
}: ProductVariantItemProps) {
  const {
    fields: valueFields,
    append: appendValue,
    remove: removeValue,
  } = useFieldArray({
    control,
    name: `variants.${variantIndex}.values`,
  })

  const typeFieldName = `variants.${variantIndex}.type` as const
  const typeErrorMessage = getFormErrorMessage(typeFieldName)

  // Varyant tipinin mevcut değerini izle
  const variantTypeValue = useWatch({
    control,
    name: typeFieldName,
  })

  return (
    <div className="mb-4 rounded-md border p-4 space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-grow space-y-1">
          <label htmlFor={typeFieldName} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Varyant Tipi
          </label>
          <input
            id={typeFieldName}
            type="text"
            placeholder="Örn: Renk, Beden"
            {...register(typeFieldName)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {typeErrorMessage && <p className="text-sm font-medium text-destructive">{typeErrorMessage}</p>}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => removeVariantType(variantIndex)}
          aria-label="Varyant tipini kaldır"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Varyant Değerleri</h4>
        {valueFields.map((valueItem, valueIndex) => {
          const valueFieldName = `variants.${variantIndex}.values.${valueIndex}.value` as const
          const valueErrorMessage = getFormErrorMessage(valueFieldName)
          return (
            <div key={valueItem.id} className="flex items-center gap-2 mb-2 ml-4">
              <div className="flex-grow space-y-1">
                <input
                  id={valueFieldName}
                  type="text"
                  placeholder="Örn: Kırmızı, XL"
                  {...register(valueFieldName)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {valueErrorMessage && <p className="text-sm font-medium text-destructive">{valueErrorMessage}</p>}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeValue(valueIndex)}
                aria-label="Varyant değerini kaldır"
              >
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          )
        })}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendValue({ value: "" })}
          className="ml-4 mt-2" // Biraz üst boşluk eklendi
          disabled={!variantTypeValue?.trim()} // Varyant tipi boşsa veya sadece boşluk içeriyorsa devre dışı bırak
        >
          Değer Ekle
        </Button>
        {!variantTypeValue?.trim() && valueFields.length === 0 && (
          <p className="ml-4 mt-1 text-xs text-muted-foreground">
            Varyant değerleri eklemek için önce varyant tipini girin.
          </p>
        )}
      </div>
    </div>
  )
}
