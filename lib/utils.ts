import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- TÜRKÇE FORMATLAMA YARDIMCILARI ---

export function formatCurrencyTR(amount: number | null | undefined, currencyCode = "TRY") {
  if (amount == null || isNaN(amount)) return "-"
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch (e) {
    return `${Number(amount).toFixed(2)} ${currencyCode}`
  }
}

export function formatDateTR(dateString: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!dateString) return "-"
  try {
    const date = new Date(dateString)
    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "long",
      year: "numeric",
      ...options,
    }
    return new Intl.DateTimeFormat("tr-TR", defaultOptions).format(date)
  } catch (e) {
    return String(dateString)
  }
}

export function formatDateTimeTR(dateString: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) {
  if (!dateString) return "-"
  try {
    const date = new Date(dateString)
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    }
    return new Intl.DateTimeFormat("tr-TR", defaultOptions).format(date)
  } catch (e) {
    return String(dateString)
  }
}

export function formatSimpleDateTR(dateString: string | Date | null | undefined) {
  if (!dateString) return "-"
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  } catch (e) {
    return String(dateString)
  }
}

// --- GERİYE DÖNÜK UYUMLULUK İÇİN ALIAS'LAR ---
// Bu, projenin diğer bölümlerindeki eski fonksiyon adlarını kullanan import'ların bozulmasını önler.
export const formatCurrency = formatCurrencyTR
export const formatDate = formatDateTR
export const formatDateTime = formatDateTimeTR

// --- DURUM YARDIMCILARI ---

export const getSaleStatusBadgeVariant = (
  status: string | null,
): "default" | "secondary" | "destructive" | "outline" | "warning" => {
  switch (status) {
    case "completed":
      return "default"
    case "pending_payment":
      return "warning"
    case "pending_installment":
      return "secondary"
    case "shipped":
      return "outline"
    case "cancelled":
    case "refunded":
      return "destructive"
    default:
      return "outline"
  }
}

export const formatSaleStatusTR = (status: string | null): string => {
  if (!status) return "Bilinmiyor"
  const statusMap: { [key: string]: string } = {
    pending_payment: "Ödeme Bekliyor",
    pending_installment: "Taksit Bekleniyor",
    completed: "Tamamlandı",
    shipped: "Kargolandı",
    delivered: "Teslim Edildi",
    cancelled: "İptal Edildi",
    refunded: "İade Edildi",
  }
  return statusMap[status.toLowerCase()] || status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}
