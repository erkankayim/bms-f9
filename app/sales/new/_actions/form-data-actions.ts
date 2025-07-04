"use server"
import { createClient } from "@/lib/supabase/server"

export async function getProductsForSale() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("products")
    .select("stock_code, name, unit_price, quantity_on_hand, vat_rate")
    .order("name")
  return { data, error: error?.message }
}

export async function getCustomersForSale() {
  const supabase = createClient()
  const { data, error } = await supabase.from("customers").select("mid, contact_name, email").order("contact_name")
  return { data, error: error?.message }
}
