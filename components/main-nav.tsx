"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Building,
  Package2,
  FileText,
  Calculator,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Settings,
  LogOut,
  Wrench,
} from "lucide-react"
import { logoutAction } from "@/app/auth/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  { name: "Kontrol Paneli", href: "/", icon: LayoutDashboard },
  { name: "Müşteriler", href: "/customers", icon: Users },
  { name: "Ürünler", href: "/products", icon: Package },
  { name: "Satışlar", href: "/sales", icon: ShoppingCart },
  { name: "Tedarikçiler", href: "/suppliers", icon: Building },
  { name: "Envanter", href: "/inventory", icon: Package2 },
  { name: "Faturalar", href: "/invoices", icon: FileText },
  {
    name: "Finansal",
    href: "/financials",
    icon: Calculator,
    subItems: [
      { name: "Finansal Özet", href: "/financials", icon: Calculator },
      { name: "Gelir Listesi", href: "/financials/income", icon: TrendingUp },
      { name: "Gider Listesi", href: "/financials/expenses", icon: TrendingDown },
      { name: "Hesap Planı", href: "/financials/chart-of-accounts", icon: BookOpen },
    ],
  },
  { name: "Servis", href: "/service", icon: Wrench },
  { name: "Kullanıcılar", href: "/users", icon: Settings },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Package className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">İş Yönetimi</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.subItems ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "transition-colors hover:text-foreground/80",
                          pathname?.startsWith(item.href) ? "text-foreground" : "text-foreground/60",
                        )}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel>Finansal İşlemler</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {item.subItems.map((subItem) => (
                        <DropdownMenuItem key={subItem.name} asChild>
                          <Link
                            href={subItem.href}
                            className={cn(
                              "flex items-center w-full",
                              pathname === subItem.href ? "bg-accent text-accent-foreground" : "",
                            )}
                          >
                            <subItem.icon className="mr-2 h-4 w-4" />
                            {subItem.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center transition-colors hover:text-foreground/80",
                      pathname === item.href ? "text-foreground" : "text-foreground/60",
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">{/* Mobile menu can be added here */}</div>
          <nav className="flex items-center">
            <form action={logoutAction}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="mr-2 h-4 w-4" />
                Çıkış Yap
              </Button>
            </form>
          </nav>
        </div>
      </div>
    </header>
  )
}
