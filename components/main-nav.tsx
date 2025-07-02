"use client"

import type * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FileText,
  DollarSign,
  Wrench,
  Building,
  UserCog,
  LogOut,
  ChevronDown,
  ChevronRight,
  Warehouse,
  TrendingUp,
  Receipt,
  Calculator,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { getCurrentUserRole } from "@/app/users/_actions/users-actions"

type UserRole = "admin" | "tech" | "acc"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: ["admin", "tech", "acc"] as UserRole[],
  },
  {
    name: "Müşteriler",
    href: "/customers",
    icon: Users,
    roles: ["admin"] as UserRole[],
  },
  {
    name: "Ürünler",
    href: "/products",
    icon: Package,
    roles: ["admin"] as UserRole[],
  },
  {
    name: "Satışlar",
    href: "/sales",
    icon: ShoppingCart,
    roles: ["admin"] as UserRole[],
  },
  {
    name: "Faturalar",
    href: "/invoices",
    icon: FileText,
    roles: ["admin"] as UserRole[],
  },
  {
    name: "Finansal",
    href: "/financials",
    icon: DollarSign,
    roles: ["admin", "acc"] as UserRole[],
    subItems: [
      {
        name: "Finansal Özet",
        href: "/financials",
        icon: TrendingUp,
      },
      {
        name: "Gelir Listesi",
        href: "/financials/income",
        icon: TrendingUp,
      },
      {
        name: "Gider Listesi",
        href: "/financials/expenses",
        icon: Receipt,
      },
      {
        name: "Hesap Planı",
        href: "/financials/chart-of-accounts",
        icon: Calculator,
      },
    ],
  },
  {
    name: "Envanter",
    href: "/inventory",
    icon: Warehouse,
    roles: ["admin"] as UserRole[],
    subItems: [
      {
        name: "Envanter Listesi",
        href: "/inventory",
        icon: Package,
      },
      {
        name: "Stok Ayarlama",
        href: "/inventory/adjust",
        icon: Package,
      },
      {
        name: "Düşük Stok Uyarıları",
        href: "/inventory/alerts",
        icon: Package,
      },
    ],
  },
  {
    name: "Servis",
    href: "/service",
    icon: Wrench,
    roles: ["admin", "tech"] as UserRole[],
  },
  {
    name: "Tedarikçiler",
    href: "/suppliers",
    icon: Building,
    roles: ["admin"] as UserRole[],
  },
  {
    name: "Kullanıcılar",
    href: "/users",
    icon: UserCog,
    roles: ["admin"] as UserRole[],
  },
]

interface MainNavProps {
  children: React.ReactNode
}

export function MainNav({ children }: MainNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>("admin")
  const [openItems, setOpenItems] = useState<string[]>([])

  // Kullanıcı rolünü getir
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const role = await getCurrentUserRole()
        setUserRole(role || "admin")

        // Aktif sayfa için parent menüyü aç
        const activeParent = navigation.find(
          (item) => item.subItems && item.subItems.some((sub) => pathname === sub.href),
        )
        if (activeParent && !openItems.includes(activeParent.name)) {
          setOpenItems((prev) => [...prev, activeParent.name])
        }
      } catch (error) {
        console.error("Error fetching user role:", error)
        setUserRole("admin")
      }
    }

    fetchUserRole()
  }, [pathname, openItems])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = "/auth/login"
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const toggleItem = (itemName: string) => {
    setOpenItems((prev) => (prev.includes(itemName) ? prev.filter((name) => name !== itemName) : [...prev, itemName]))
  }

  // Kullanıcının erişebileceği menü öğelerini filtrele
  const filteredNavigation = navigation.filter((item) => item.roles.includes(userRole))

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <Package className="h-6 w-6" />
            <span className="font-semibold">İş Yönetimi</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Ana Menü</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredNavigation.map((item) => {
                  const isActive =
                    pathname === item.href || (item.subItems && item.subItems.some((sub) => pathname === sub.href))
                  const isOpen = openItems.includes(item.name)

                  if (item.subItems) {
                    return (
                      <SidebarMenuItem key={item.name}>
                        <Collapsible open={isOpen} onOpenChange={() => toggleItem(item.name)}>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton className="w-full justify-between">
                              <div className="flex items-center gap-2">
                                <item.icon className="h-4 w-4" />
                                <span>{item.name}</span>
                              </div>
                              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.subItems.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.name}>
                                  <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                                    <Link href={subItem.href}>
                                      <subItem.icon className="h-4 w-4" />
                                      <span>{subItem.name}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      </SidebarMenuItem>
                    )
                  }

                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <Button variant="ghost" className="w-full justify-start" onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut className="h-4 w-4 mr-2" />
                {isLoggingOut ? "Çıkış yapılıyor..." : "Çıkış Yap"}
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">İş Yönetim Uygulaması</span>
            <span className="text-muted-foreground">
              ({userRole === "admin" ? "Yönetici" : userRole === "tech" ? "Teknisyen" : "Muhasebe"})
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
