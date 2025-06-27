"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Home, LogOut } from "lucide-react"
import { signOut } from "@/app/auth/actions"

const navigation = [
  {
    name: "Müşteriler",
    href: "/customers",
    submenu: [
      { name: "Müşteri Listesi", href: "/customers" },
      { name: "Yeni Müşteri", href: "/customers/new" },
    ],
  },
  {
    name: "Ürünler",
    href: "/products",
    submenu: [
      { name: "Ürün Listesi", href: "/products" },
      { name: "Yeni Ürün", href: "/products/new" },
    ],
  },
  {
    name: "Satışlar",
    href: "/sales",
    submenu: [
      { name: "Satış Listesi", href: "/sales" },
      { name: "Yeni Satış", href: "/sales/new" },
    ],
  },
  {
    name: "Faturalar",
    href: "/invoices",
    submenu: [
      { name: "Fatura Listesi", href: "/invoices" },
      { name: "Yeni Fatura", href: "/invoices/new" },
    ],
  },
  {
    name: "Envanter",
    href: "/inventory",
    submenu: [
      { name: "Stok Durumu", href: "/inventory" },
      { name: "Stok Ayarla", href: "/inventory/adjust" },
      { name: "Stok Uyarıları", href: "/inventory/alerts" },
    ],
  },
  {
    name: "Finans",
    href: "/financials",
    submenu: [
      { name: "Finans Ana Sayfa", href: "/financials" },
      { name: "Gelir Kayıtları", href: "/financials/income" },
      { name: "Gider Kayıtları", href: "/financials/expenses" },
      { name: "Hesap Planı", href: "/financials/chart-of-accounts" },
    ],
  },
  {
    name: "Tedarikçiler",
    href: "/suppliers",
    submenu: [
      { name: "Tedarikçi Listesi", href: "/suppliers" },
      { name: "Yeni Tedarikçi", href: "/suppliers/new" },
    ],
  },
  {
    name: "Servis",
    href: "/service",
    submenu: [
      { name: "Servis Listesi", href: "/service" },
      { name: "Yeni Servis", href: "/service/new" },
    ],
  },
  {
    name: "Kullanıcılar",
    href: "/users",
    submenu: [
      { name: "Kullanıcı Listesi", href: "/users" },
      { name: "Yeni Kullanıcı", href: "/users/new" },
    ],
  },
]

export function MainNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <div className="flex items-center justify-between w-full px-6 py-4 bg-background border-b">
      {/* Sol taraf - Dashboard */}
      <div className="flex items-center">
        <Button
          asChild
          variant={pathname === "/" ? "default" : "ghost"}
          className={cn("transition-colors", pathname === "/" && "bg-primary/10 text-primary")}
        >
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>

      {/* Orta - Ana navigasyon */}
      <div className="flex items-center space-x-1">
        {navigation.map((item) => (
          <DropdownMenu key={item.name}>
            <DropdownMenuTrigger asChild>
              <Button
                variant={isActive(item.href) ? "default" : "ghost"}
                className={cn("transition-colors", isActive(item.href) && "bg-primary/10 text-primary")}
              >
                {item.name}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              {item.submenu.map((subItem) => (
                <DropdownMenuItem key={subItem.href} asChild>
                  <Link
                    href={subItem.href}
                    className={cn("w-full cursor-pointer", pathname === subItem.href && "bg-accent")}
                  >
                    {subItem.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>

      {/* Sağ taraf - Çıkış */}
      <div className="flex items-center">
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Çıkış Yap
          </Button>
        </form>
      </div>
    </div>
  )
}
