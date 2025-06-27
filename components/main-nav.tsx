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
    children: [
      { name: "Müşteri Listesi", href: "/customers" },
      { name: "Yeni Müşteri", href: "/customers/new" },
    ],
  },
  {
    name: "Ürünler",
    href: "/products",
    children: [
      { name: "Ürün Listesi", href: "/products" },
      { name: "Yeni Ürün", href: "/products/new" },
    ],
  },
  {
    name: "Satışlar",
    href: "/sales",
    children: [
      { name: "Satış Listesi", href: "/sales" },
      { name: "Yeni Satış", href: "/sales/new" },
    ],
  },
  {
    name: "Faturalar",
    href: "/invoices",
    children: [
      { name: "Fatura Listesi", href: "/invoices" },
      { name: "Yeni Fatura", href: "/invoices/new" },
    ],
  },
  {
    name: "Finansal",
    href: "/financials",
    children: [
      { name: "Genel Bakış", href: "/financials" },
      { name: "Gelir Kayıtları", href: "/financials/income" },
      { name: "Gider Kayıtları", href: "/financials/expenses" },
      { name: "Hesap Planı", href: "/financials/chart-of-accounts" },
      { name: "Kategoriler", href: "/financials/categories" },
    ],
  },
  {
    name: "Envanter",
    href: "/inventory",
    children: [
      { name: "Stok Durumu", href: "/inventory" },
      { name: "Stok Düzeltme", href: "/inventory/adjust" },
      { name: "Stok Uyarıları", href: "/inventory/alerts" },
    ],
  },
  {
    name: "Servis",
    href: "/service",
    children: [
      { name: "Servis Listesi", href: "/service" },
      { name: "Yeni Servis", href: "/service/new" },
    ],
  },
  {
    name: "Tedarikçiler",
    href: "/suppliers",
    children: [
      { name: "Tedarikçi Listesi", href: "/suppliers" },
      { name: "Yeni Tedarikçi", href: "/suppliers/new" },
    ],
  },
  {
    name: "Kullanıcılar",
    href: "/users",
    children: [
      { name: "Kullanıcı Listesi", href: "/users" },
      { name: "Yeni Kullanıcı", href: "/users/new" },
    ],
  },
]

export function MainNav() {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="flex h-16 items-center justify-between px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Sol taraf - Dashboard */}
      <div className="flex items-center space-x-4">
        <Link href="/">
          <Button
            variant={pathname === "/" ? "default" : "ghost"}
            className={cn(
              "flex items-center space-x-2 transition-colors",
              pathname === "/" && "bg-primary/10 text-primary",
            )}
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>
        </Link>
      </div>

      {/* Orta - Ana navigasyon menüleri */}
      <nav className="flex items-center space-x-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href)

          return (
            <DropdownMenu key={item.name}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center space-x-1 transition-colors hover:bg-accent",
                    isActive && "bg-primary/10 text-primary",
                  )}
                >
                  <span>{item.name}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48">
                {item.children.map((child) => (
                  <DropdownMenuItem key={child.href} asChild>
                    <Link
                      href={child.href}
                      className={cn(
                        "w-full cursor-pointer transition-colors",
                        pathname === child.href && "bg-accent text-accent-foreground",
                      )}
                    >
                      {child.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        })}
      </nav>

      {/* Sağ taraf - Çıkış yap */}
      <div className="flex items-center">
        <form action={handleSignOut}>
          <Button
            type="submit"
            variant="ghost"
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Çıkış Yap</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
