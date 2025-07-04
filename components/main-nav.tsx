"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, LogOut, Home } from "lucide-react"
import { logoutAction } from "@/app/auth/actions"
import Image from "next/image"

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

  const handleLogout = async () => {
    await logoutAction()
    window.location.href = "/auth/login"
  }

  return (
    <div className="border-b bg-white">
      <div className="flex h-16 items-center px-4">
        {/* Logo */}
        <div className="flex items-center mr-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/mny-makine-logo.svg"
              alt="MNY Makine"
              width={208}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Dashboard */}
        <div className="flex items-center mr-6">
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

        {/* Ana navigasyon */}
        <nav className="flex items-center space-x-1 flex-1">
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

        {/* Çıkış */}
        <div className="flex items-center ml-auto">
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent rounded-md flex items-center gap-2 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </Button>
        </div>
      </div>
    </div>
  )
}
