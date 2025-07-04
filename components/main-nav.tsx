"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Users,
  Package,
  ShoppingCart,
  FileText,
  Wrench,
  Truck,
  Calculator,
  ChevronDown,
  Home,
  UserPlus,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import Image from "next/image"

const navigation = [
  {
    name: "Ana Sayfa",
    href: "/",
    icon: Home,
  },
  {
    name: "Müşteriler",
    href: "/customers",
    icon: Users,
    submenu: [
      { name: "Müşteri Listesi", href: "/customers" },
      { name: "Yeni Müşteri", href: "/customers/new" },
    ],
  },
  {
    name: "Ürünler",
    href: "/products",
    icon: Package,
    submenu: [
      { name: "Ürün Listesi", href: "/products" },
      { name: "Yeni Ürün", href: "/products/new" },
    ],
  },
  {
    name: "Satışlar",
    href: "/sales",
    icon: ShoppingCart,
    submenu: [
      { name: "Satış Listesi", href: "/sales" },
      { name: "Yeni Satış", href: "/sales/new" },
    ],
  },
  {
    name: "Faturalar",
    href: "/invoices",
    icon: FileText,
    submenu: [
      { name: "Fatura Listesi", href: "/invoices" },
      { name: "Yeni Fatura", href: "/invoices/new" },
    ],
  },
  {
    name: "Servis",
    href: "/service",
    icon: Wrench,
    submenu: [
      { name: "Servis Listesi", href: "/service" },
      { name: "Yeni Servis", href: "/service/new" },
    ],
  },
  {
    name: "Tedarikçiler",
    href: "/suppliers",
    icon: Truck,
    submenu: [
      { name: "Tedarikçi Listesi", href: "/suppliers" },
      { name: "Yeni Tedarikçi", href: "/suppliers/new" },
    ],
  },
  {
    name: "Envanter",
    href: "/inventory",
    icon: Package,
    submenu: [
      { name: "Stok Durumu", href: "/inventory" },
      { name: "Stok Uyarıları", href: "/inventory/alerts" },
      { name: "Stok Düzeltme", href: "/inventory/adjust" },
    ],
  },
  {
    name: "Finans",
    href: "/financials",
    icon: Calculator,
    submenu: [
      { name: "Genel Bakış", href: "/financials" },
      { name: "Hesap Planı", href: "/financials/chart-of-accounts" },
      { name: "Gelirler", href: "/financials/income" },
      { name: "Giderler", href: "/financials/expenses" },
    ],
  },
  {
    name: "Kullanıcılar",
    href: "/users",
    icon: UserPlus,
    submenu: [
      { name: "Kullanıcı Listesi", href: "/users" },
      { name: "Yeni Kullanıcı", href: "/users/new" },
    ],
  },
]

export function MainNav() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  // Auth sayfalarında navbar'ı gösterme
  if (pathname?.startsWith("/auth/")) {
    return null
  }

  // Kullanıcı giriş yapmamışsa navbar'ı gösterme
  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = "/auth/login"
    } catch (error) {
      console.error("Çıkış yapılırken hata:", error)
    }
  }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/mny-makine-logo.svg" alt="MNY Makine" width={120} height={30} className="h-8 w-auto" />
        </Link>

        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          {navigation.map((item) => {
            if (item.submenu) {
              return (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-1">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {item.submenu.map((subItem) => (
                      <DropdownMenuItem key={subItem.href} asChild>
                        <Link href={subItem.href}>{subItem.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-black dark:text-white" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Çıkış
          </Button>
        </div>
      </div>
    </div>
  )
}
