"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { signOut } from "@/app/auth/_actions/auth-actions"
import { getCurrentUserRole } from "@/app/users/_actions/user-actions"
import type { UserRole } from "@/lib/auth"
import Image from "next/image"

type NavigationItem = {
  name: string
  href: string
  icon: any
  roles: UserRole[]
  subItems?: {
    name: string
    href: string
    icon: any
  }[]
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: ["admin", "tech", "acc"],
  },
  {
    name: "Müşteriler",
    href: "/customers",
    icon: Users,
    roles: ["admin"],
  },
  {
    name: "Ürünler",
    href: "/products",
    icon: Package,
    roles: ["admin"],
  },
  {
    name: "Satışlar",
    href: "/sales",
    icon: ShoppingCart,
    roles: ["admin"],
  },
  {
    name: "Faturalar",
    href: "/invoices",
    icon: FileText,
    roles: ["admin"],
  },
  {
    name: "Finansal",
    href: "/financials",
    icon: DollarSign,
    roles: ["admin", "acc"],
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
    roles: ["admin"],
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
    roles: ["admin", "tech"],
  },
  {
    name: "Tedarikçiler",
    href: "/suppliers",
    icon: Building,
    roles: ["admin"],
  },
  {
    name: "Kullanıcılar",
    href: "/users",
    icon: UserCog,
    roles: ["admin"],
  },
]

interface MainNavProps {
  children: React.ReactNode
}

export function MainNav({ children }: MainNavProps) {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<UserRole>("admin")
  const [openItems, setOpenItems] = useState<string[]>([])
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    async function fetchUserRole() {
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
      await signOut()
      // Çıkış yaptıktan sonra login sayfasına yönlendir
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
          <div className="flex items-center gap-3 px-4 py-3">
            <Image
              src="/mny-makine-logo.svg"
              alt="MNY Makine"
              width={208}
              height={40}
              className="h-8 w-auto"
              priority
            />
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
            <span className="font-medium">MNY Makine İş Yönetim Sistemi</span>
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
