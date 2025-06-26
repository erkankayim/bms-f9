import type React from "react"

// Helper function to format date strings
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A"
  try {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (e) {
    return "Geçersiz Tarih"
  }
}

// Helper component to display label-value pairs
export function InfoItem({
  label,
  value,
  children,
  className,
}: {
  label: string
  value?: string | number | null
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      {children ? <div className="text-md">{children}</div> : <p className="text-md">{value || "-"}</p>}
    </div>
  )
}

// Define a comprehensive type for a single supplier's details
export type SupplierDetail = {
  id: string
  supplier_code: string | null
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  country: string | null
  tax_office: string | null
  tax_number: string | null
  iban: string | null
  website: string | null
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null // For checking if it's somehow fetched
}
