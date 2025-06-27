"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, LogOut } from "lucide-react"
import { logoutAction } from "@/app/auth/actions"

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Müşteriler", href: "/customers" },
  { name: "Ürünler", href: "/products" },
  { name: "Satışlar", href: "/sales" },
  { name: "Faturalar", href: "/invoices" },
  { name: "Envanter", href: "/inventory" },
  { name: "Servis", href: "/service" },
  { name: "Tedarikçiler", href: "/suppliers" },
  { name: "Kullanıcılar", href: "/users" },
]

const financialNavigation = [
  { name: "Finansal Özet", href: "/financials" },
  { name: "Gelir Listesi", href: "/financials/income" },
  { name: "Gider Listesi", href: "/financials/expenses" },
  { name: "Hesap Planı", href: "/financials/chart-of-accounts" },
]

export function MainNav() {
  const pathname = usePathname()

  const isFinancialActive = pathname.startsWith("/financials")

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {item.name}
        </Link>
      ))}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
              isFinancialActive ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Finansal
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {financialNavigation.map((item) => (
            <DropdownMenuItem key={item.name} asChild>
              <Link
                href={item.href}
                className={cn(
                  "w-full cursor-pointer",
                  pathname === item.href ? "bg-accent text-accent-foreground" : "",
                )}
              >
                {item.name}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenuSeparator className="h-6" />

      <form action={logoutAction}>
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </Button>
      </form>
    </nav>
  )
}
