import type React from "react"

// --- Data Type Definitions ---
// These types should accurately reflect your Supabase table columns.
// All potentially nullable fields are marked with `| null`.

export interface Customer {
  mid: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  country: string | null
  customer_group: string | null
  balance: number | null
  notes: string | null
  service_name: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Sale {
  id: string
  sale_date: string
  total_amount: number | null
  status: string | null
}

export interface Invoice {
  id: string
  invoice_number: string | null
  issue_date: string
  total_amount: number | null
  status: string | null
}

export interface PurchaseInsights {
  total_spending: number
  total_orders: number
  first_purchase_date: string | null
  last_purchase_date: string | null
}

export interface CustomerPageData {
  customer: Customer
  sales: Sale[]
  invoices: Invoice[]
  insights: PurchaseInsights | null
}

// --- Helper Component ---
// A reusable component to safely display labeled information.

export const InfoItem = ({
  label,
  children,
  value,
}: { label: string; children?: React.ReactNode; value?: string | null }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <div className="mt-1 text-sm text-gray-900">{children || value || "-"}</div>
  </div>
)
