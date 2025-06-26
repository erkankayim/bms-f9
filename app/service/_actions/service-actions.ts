"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getServiceRequests() {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("service_requests")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        console.warn("service_requests table does not exist yet")
        return []
      }
      console.error("Error fetching service requests:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error in getServiceRequests:", error)
    return []
  }
}

export async function getServiceRequestById(id: string) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.from("service_requests").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching service request:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Unexpected error in getServiceRequestById:", error)
    return null
  }
}

export async function createServiceRequest(serviceData: any) {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("service_requests")
      .insert([
        {
          customer_mid: serviceData.customer_mid || null,
          customer_name: serviceData.customer_name,
          customer_phone: serviceData.customer_phone || null,
          customer_email: serviceData.customer_email || null,
          product_stock_code: serviceData.product_stock_code || null,
          product_name: serviceData.product_name,
          fault_description: serviceData.fault_description,
          service_status: serviceData.status || "pending",
          priority: serviceData.priority || "normal",
          estimated_cost: serviceData.estimated_cost ? Number.parseFloat(serviceData.estimated_cost) : null,
          actual_cost: serviceData.actual_cost ? Number.parseFloat(serviceData.actual_cost) : null,
          technician_name: serviceData.technician_name || null,
          service_notes: serviceData.service_notes || null,
          received_date: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating service request:", error)
      throw new Error("Servis kaydı oluşturulamadı: " + error.message)
    }

    revalidatePath("/service")
    return data
  } catch (error) {
    console.error("Unexpected error in createServiceRequest:", error)
    throw error
  }
}

export async function updateServiceRequest(id: string, serviceData: any) {
  try {
    const supabase = createClient()

    const updateData: any = {
      customer_mid: serviceData.customer_mid || null,
      customer_name: serviceData.customer_name,
      customer_phone: serviceData.customer_phone || null,
      customer_email: serviceData.customer_email || null,
      product_stock_code: serviceData.product_stock_code || null,
      product_name: serviceData.product_name,
      fault_description: serviceData.fault_description,
      service_status: serviceData.status || "pending",
      priority: serviceData.priority || "normal",
      estimated_cost: serviceData.estimated_cost ? Number.parseFloat(serviceData.estimated_cost) : null,
      actual_cost: serviceData.actual_cost ? Number.parseFloat(serviceData.actual_cost) : null,
      technician_name: serviceData.technician_name || null,
      service_notes: serviceData.service_notes || null,
      updated_at: new Date().toISOString(),
    }

    // Durum değişikliklerine göre tarihleri güncelle
    if (serviceData.status === "completed") {
      updateData.completed_date = new Date().toISOString()
    }
    if (serviceData.status === "delivered") {
      updateData.delivery_date = new Date().toISOString()
    }

    const { error } = await supabase.from("service_requests").update(updateData).eq("id", id)

    if (error) {
      console.error("Error updating service request:", error)
      throw new Error("Servis kaydı güncellenemedi: " + error.message)
    }

    revalidatePath("/service")
    revalidatePath(`/service/${id}`)
  } catch (error) {
    console.error("Unexpected error in updateServiceRequest:", error)
    throw error
  }
}

export async function deleteServiceRequest(id: string) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("service_requests").delete().eq("id", id)

    if (error) {
      console.error("Error deleting service request:", error)
      throw new Error("Servis kaydı silinemedi: " + error.message)
    }

    revalidatePath("/service")
  } catch (error) {
    console.error("Unexpected error in deleteServiceRequest:", error)
    throw error
  }
}

// Mevcut customers tablosundan müşteri arama
export async function searchCustomers(searchTerm: string) {
  if (!searchTerm || searchTerm.length < 2) {
    return []
  }

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("customers")
      .select("mid, contact_name, company_name, phone, email")
      .or(
        `contact_name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`,
      )
      .limit(10)

    if (error) {
      console.error("Error searching customers:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error in searchCustomers:", error)
    return []
  }
}

// Mevcut products tablosundan ürün arama
export async function searchProducts(searchTerm: string) {
  if (!searchTerm || searchTerm.length < 2) {
    return []
  }

  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("products")
      .select("stock_code, name, brand, model, sale_price")
      .or(
        `name.ilike.%${searchTerm}%,stock_code.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`,
      )
      .limit(10)

    if (error) {
      console.error("Error searching products:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error in searchProducts:", error)
    return []
  }
}
