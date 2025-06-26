"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { PlusCircle, Loader2, Search, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react" // Edit ve Trash2 eklendi
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { useToast } from "@/components/ui/use-toast"
import { DeleteCustomerDialog } from "./[mid]/_components/delete-customer-dialog" // Dialog import edildi
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Add 'deleted_at' to the Customer type
type Customer = {
  mid: string
  contact_name: string | null
  email: string | null
  phone: string | null
  balance: number | null
  customer_group: string | null
  service_name: string | null
  deleted_at: string | null // Add this line
}

// Define FilterStatus type (if not already defined globally or in a shared types file)
type FilterStatus = "active" | "archived" | "all"

const ITEMS_PER_PAGE = 10

export default function CustomersPage() {
  const supabase = getSupabaseBrowserClient()
  const { toast } = useToast()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // const [customerToArchive, setCustomerToArchive] = useState<{ id: string; name: string | null } | null>(null); // BU SATIRI SİLİN

  const [currentPage, setCurrentPage] = useState(1)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Add filterStatus state
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("active")

  const router = useRouter()
  const searchParams = useSearchParams()

  const totalPages = useMemo(() => Math.ceil(totalCustomers / ITEMS_PER_PAGE), [totalCustomers])

  // useEffect to sync filterStatus from URL
  useEffect(() => {
    const filterQuery = searchParams.get("filter")
    if (filterQuery === "archived" || filterQuery === "all") {
      setFilterStatus(filterQuery)
    } else {
      setFilterStatus("active")
    }
    const pageQuery = searchParams.get("page")
    if (pageQuery && !isNaN(Number.parseInt(pageQuery))) {
      setCurrentPage(Number.parseInt(pageQuery))
    } else {
      setCurrentPage(1)
    }
    const searchQuery = searchParams.get("search")
    setSearchTerm(searchQuery || "")
  }, [searchParams])

  // useEffect to update URL when filterStatus, currentPage or searchTerm changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (filterStatus !== "active") {
      params.set("filter", filterStatus)
    }
    if (currentPage > 1) {
      params.set("page", currentPage.toString())
    }
    if (debouncedSearchTerm) {
      params.set("search", debouncedSearchTerm)
    }
    router.replace(`/customers?${params.toString()}`, { scroll: false })
  }, [filterStatus, currentPage, debouncedSearchTerm, router])

  // Update fetchCustomers useCallback
  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)

    const from = (currentPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    let query = supabase
      .from("customers")
      .select("mid, contact_name, email, phone, balance, customer_group, service_name, deleted_at", {
        // Ensure deleted_at is selected
        count: "exact",
      })

    if (filterStatus === "active") {
      query = query.is("deleted_at", null)
    } else if (filterStatus === "archived") {
      query = query.not("deleted_at", "is", null)
    }
    // For "all", no additional filter on deleted_at is needed

    if (debouncedSearchTerm) {
      const searchPattern = `%${debouncedSearchTerm}%`
      query = query.or(`mid.ilike.${searchPattern},contact_name.ilike.${searchPattern},email.ilike.${searchPattern}`)
    }

    query = query.order("contact_name", { ascending: true }).range(from, to)

    const { data: customersData, error: fetchError, count } = await query

    if (fetchError) {
      console.error("Error fetching customers:", fetchError)
      setError(`Müşteriler yüklenirken bir hata oluştu: ${fetchError.message}`)
      setCustomers([])
      setTotalCustomers(0)
    } else {
      setCustomers((customersData as Customer[] | null) || [])
      setTotalCustomers(count || 0)
    }
    setLoading(false)
  }, [supabase, currentPage, debouncedSearchTerm, filterStatus]) // Add filterStatus to dependencies

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers]) // Add filterStatus

  // Update useEffect for resetting page when search/filter changes
  useEffect(() => {
    if ((debouncedSearchTerm || filterStatus !== "active") && currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [debouncedSearchTerm, filterStatus]) // Add filterStatus

  // Update handleCustomerArchived
  const handleCustomerArchived = () => {
    toast({
      title: "Müşteri Arşivlendi",
      description: "Müşteri başarıyla arşivlendi ve listeden kaldırıldı.",
    })
    if (customers.length === 1 && currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    } else {
      fetchCustomers() // This will now use the current filterStatus
    }
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  if (error && !loading) {
    return (
      <div className="container mx-auto py-2">
        <Card>
          <CardHeader>
            <CardTitle>Hata</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => fetchCustomers()}>
              Tekrar Dene
            </Button>
            <Link href="/">
              <Button variant="link" className="mt-4 ml-2">
                Ana Sayfaya Dön
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-2">
      <Card>
        <CardHeader className="px-7">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Customers</CardTitle>
              <CardDescription>Manage your customers and view their details.</CardDescription>
            </div>
            <div className="flex w-full sm:w-auto items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by ID, name, or email..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Durum Filtresi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif Müşteriler</SelectItem>
                  <SelectItem value="archived">Arşivlenmiş Müşteriler</SelectItem>
                  <SelectItem value="all">Tüm Müşteriler</SelectItem>
                </SelectContent>
              </Select>
              <Link href="/customers/new">
                <Button className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && customers.length === 0 ? (
            <div className="h-64 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-2 text-muted-foreground">Müşteriler yükleniyor...</p>
            </div>
          ) : !loading && customers.length === 0 && (debouncedSearchTerm || totalCustomers === 0) ? (
            <div className="text-center py-10">
              <p className="text-lg font-semibold">
                {debouncedSearchTerm || filterStatus !== "active"
                  ? "Filtrelerinize uygun müşteri bulunamadı."
                  : "Henüz hiç müşteri eklenmemiş."}
              </p>
              <p className="text-muted-foreground">
                {debouncedSearchTerm || filterStatus !== "active" ? "Farklı filtreler deneyin veya " : "Başlamak için "}
                <Link href="/customers/new" className="text-primary hover:underline">
                  yeni bir müşteri ekleyin
                </Link>
                .
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Contact Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">Actions</TableHead> {/* Actions sütunu eklendi */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.mid} className={customer.deleted_at ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{customer.mid}</TableCell>
                    <TableCell>{customer.contact_name || "-"}</TableCell>
                    <TableCell>{customer.email || "-"}</TableCell>
                    <TableCell>{customer.phone || "-"}</TableCell>
                    <TableCell className="text-right">
                      {customer.balance !== null ? `$${customer.balance.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell>
                      {customer.customer_group ? <Badge variant="outline">{customer.customer_group}</Badge> : "-"}
                    </TableCell>
                    <TableCell>{customer.service_name || "-"}</TableCell>
                    <TableCell>
                      {customer.deleted_at ? (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                          Arşivlenmiş
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          Aktif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/customers/${customer.mid}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hidden md:inline-flex px-2 py-1 h-auto text-xs"
                          >
                            View
                          </Button>
                        </Link>
                        {!customer.deleted_at && (
                          <Link href={`/customers/${customer.mid}/edit`}>
                            <Button variant="ghost" size="icon" aria-label="Edit Customer">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <DeleteCustomerDialog
                          customerId={customer.mid}
                          customerName={customer.contact_name}
                          onDelete={handleCustomerArchived}
                        >
                          <Button variant="ghost" size="icon" aria-label="Archive Customer">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DeleteCustomerDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-between border-t px-7 py-4">
            <div className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages} ({totalCustomers} customers)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
