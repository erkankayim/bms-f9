"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export type LowStockAlertItem = {
  id: number
  product_stock_code: string
  product_name: string | null // Ürün adı bulunamazsa null olabilir
  current_stock_at_alert: number
  min_stock_level_at_alert: number
  alert_triggered_at: string
  status: string
  notes: string | null
}

export async function getActiveLowStockAlerts(): Promise<{
  success: boolean
  alerts?: LowStockAlertItem[]
  error?: string
}> {
  noStore() // Ensure fresh data on each request
  const supabase = createClient()

  try {
    // 1. Aktif düşük stok uyarılarını çek
    const { data: alertsData, error: alertsError } = await supabase
      .from("low_stock_alerts")
      .select(`
        id,
        product_stock_code,
        current_stock_at_alert,
        min_stock_level_at_alert,
        alert_triggered_at,
        status,
        notes
      `)
      .eq("status", "active")
      .order("alert_triggered_at", { ascending: false })

    if (alertsError) {
      console.error("Error fetching active low stock alerts (step 1):", alertsError)
      return { success: false, error: `Uyarılar getirilirken hata oluştu: ${alertsError.message}` }
    }

    if (!alertsData || alertsData.length === 0) {
      return { success: true, alerts: [] }
    }

    // 2. Uyarılardaki ürün stok kodlarını topla
    const productStockCodes = alertsData.map((alert) => alert.product_stock_code)

    // Yinelenen stok kodlarını kaldır (opsiyonel ama iyi bir pratik)
    const uniqueProductStockCodes = [...new Set(productStockCodes)]

    // 3. İlgili ürünlerin adlarını çek
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select("stock_code, name")
      .in("stock_code", uniqueProductStockCodes)

    if (productsError) {
      console.error("Error fetching product names for alerts (step 2):", productsError)
      // Ürün adları olmadan devam etmek yerine hata dönmek daha iyi olabilir,
      // çünkü ürün adı kullanıcı için önemli bir bilgi.
      return { success: false, error: `Ürün bilgileri getirilirken hata oluştu: ${productsError.message}` }
    }

    // Ürünleri stok koduna göre bir haritada sakla (eşleştirme için)
    const productsMap = new Map<string, string>()
    if (productsData) {
      productsData.forEach((p) => {
        if (p.stock_code && p.name) {
          productsMap.set(p.stock_code, p.name)
        }
      })
    }

    // 4. Uyarıları ürün adlarıyla birleştir
    const alerts: LowStockAlertItem[] = alertsData.map((alert: any) => ({
      id: alert.id,
      product_stock_code: alert.product_stock_code,
      product_name: productsMap.get(alert.product_stock_code) || "Ürün Bulunamadı", // Eğer ürün adı yoksa
      current_stock_at_alert: alert.current_stock_at_alert,
      min_stock_level_at_alert: alert.min_stock_level_at_alert,
      alert_triggered_at: new Date(alert.alert_triggered_at).toLocaleString(),
      status: alert.status,
      notes: alert.notes,
    }))

    return { success: true, alerts }
  } catch (e: any) {
    console.error("Unexpected error in getActiveLowStockAlerts:", e)
    return { success: false, error: "Beklenmedik bir hata oluştu." }
  }
}
