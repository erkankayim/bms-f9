"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, LogOut, Home } from "lucide-react"
import { logoutAction } from "@/app/auth/actions"

const navigation = [
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
    <div className="flex items-center justify-between w-full">
      {/* Sol taraf - Dashboard */}
      <div className="flex items-center">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors hover:text-primary rounded-md",
            pathname === "/" ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-accent",
          )}
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
      </div>

      {/* Orta - Ana navigasyon */}
      <nav className="flex items-center space-x-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md hover:bg-accent",
              pathname === item.href ? "text-primary bg-primary/10" : "text-muted-foreground",
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
                "px-3 py-2 text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 rounded-md",
                isFinancialActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-accent",
              )}
            >
              Finansal
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56">
            {financialNavigation.map((item) => (
              <DropdownMenuItem key={item.name} asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "w-full cursor-pointer",
                    pathname === item.href ? "bg-accent text-accent-foreground font-medium" : "",
                  )}
                >
                  {item.name}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* Sağ taraf - Çıkış */}
      <div className="flex items-center">
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent rounded-md flex items-center gap-2 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </Button>
        </form>
      </div>
    </div>
  )
}
