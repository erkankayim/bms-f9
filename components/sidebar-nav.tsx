"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  Users,
  Building,
  ShoppingCart,
  Package2,
  DollarSign,
  Wrench,
  FileText,
  Briefcase,
  UserPlus,
  ChevronDown,
  LogOut,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { logoutAction } from "@/app/auth/actions"
import { useAuth } from "@/components/auth-provider"

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  subItems?: { href: string; label: string }[]
}

const navItems: NavItem[] = [
  { href: "/", label: "Kontrol Paneli", icon: LayoutDashboard },
  { href: "/customers", label: "Müşteriler", icon: Users },
  { href: "/suppliers", label: "Tedarikçiler", icon: Building },
  {
    href: "/inventory",
    label: "Envanter",
    icon: ShoppingCart,
    subItems: [
      { href: "/inventory", label: "Stok Listesi" },
      { href: "/inventory/adjust", label: "Stok Ayarlama" },
      { href: "/inventory/alerts", label: "Stok Uyarıları" },
    ],
  },
  { href: "/products", label: "Ürünler", icon: Package2 },
  { href: "/sales", label: "Satışlar", icon: DollarSign },
  { href: "/service", label: "Servis", icon: Wrench },
  {
    href: "/invoices",
    label: "Faturalar",
    icon: FileText,
    subItems: [
      { href: "/invoices", label: "Fatura Listesi" },
      { href: "/invoices/new", label: "Yeni Fatura" },
    ],
  },
  {
    href: "/financials",
    label: "Finans",
    icon: Briefcase,
    subItems: [
      { href: "/financials", label: "Finansal Özet" },
      { href: "/financials/chart-of-accounts", label: "Hesap Planı" },
      { href: "/financials/income/new", label: "Yeni Gelir" },
      { href: "/financials/expenses/new", label: "Yeni Gider" },
    ],
  },
  { href: "/users", label: "Kullanıcılar", icon: UserPlus },
]

function NavContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (href: string) => {
    setOpenItems((prev) => (prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]))
  }

  const handleItemClick = () => {
    onItemClick?.()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-6 border-b">
        <Package2 className="h-6 w-6 text-primary" />
        <span className="font-semibold text-lg">İş Yönetimi</span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

          if (item.subItems) {
            const isOpen = openItems.includes(item.href)
            const hasActiveSubItem = item.subItems.some((sub) => pathname === sub.href)

            return (
              <Collapsible key={item.href} open={isOpen} onOpenChange={() => toggleItem(item.href)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant={isActive || hasActiveSubItem ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                    <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-1">
                  {item.subItems.map((subItem) => (
                    <Button
                      key={subItem.href}
                      variant={pathname === subItem.href ? "secondary" : "ghost"}
                      className="w-full justify-start pl-8 text-sm"
                      asChild
                    >
                      <Link href={subItem.href} onClick={handleItemClick}>
                        {subItem.label}
                      </Link>
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )
          }

          return (
            <Button key={item.href} variant={isActive ? "secondary" : "ghost"} className="w-full justify-start" asChild>
              <Link href={item.href} onClick={handleItemClick}>
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Link>
            </Button>
          )
        })}
      </nav>

      {/* User Actions */}
      <div className="px-4 py-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={() => {
            logoutAction()
            handleItemClick()
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Çıkış Yap
        </Button>
      </div>
    </div>
  )
}

export function SidebarNav() {
  const { isAuthenticated } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Don't render sidebar if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Mobile Header with Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package2 className="h-6 w-6 text-primary" />
            <span className="font-semibold">İş Yönetimi</span>
          </div>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menüyü aç</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <NavContent onItemClick={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-muted/40 border-r">
        <NavContent />
      </aside>

      {/* Mobile spacer */}
      <div className="lg:hidden h-16" />
    </>
  )
}
