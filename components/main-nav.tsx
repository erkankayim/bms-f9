"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { LayoutDashboard, Users, Package, ShoppingCart, Building, Package2, FileText, Calculator, TrendingUp, Receipt, CreditCard, PieChart } from 'lucide-react'

const navigation = [
  {
    name: "Kontrol Paneli",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Müşteriler",
    href: "/customers",
    icon: Users,
  },
  {
    name: "Ürünler",
    href: "/products",
    icon: Package,
  },
  {
    name: "Satışlar",
    href: "/sales",
    icon: ShoppingCart,
  },
  {
    name: "Tedarikçiler",
    href: "/suppliers",
    icon: Building,
  },
  {
    name: "Envanter",
    href: "/inventory",
    icon: Package2,
  },
  {
    name: "Faturalar",
    href: "/invoices",
    icon: FileText,
  },
  {
    name: "Hizmetler",
    href: "/service",
    icon: Calculator,
  },
]

const financialNavigation = [
  {
    name: "Finansal Özet",
    href: "/financials",
    description: "Genel finansal durum ve raporlar",
    icon: PieChart,
  },
  {
    name: "Gelir Listesi",
    href: "/financials/income",
    description: "Tüm gelir kayıtlarını görüntüle",
    icon: TrendingUp,
  },
  {
    name: "Gider Listesi",
    href: "/financials/expenses",
    description: "Tüm gider kayıtlarını görüntüle",
    icon: Receipt,
  },
  {
    name: "Hesap Planı",
    href: "/financials/chart-of-accounts",
    description: "Mali hesapları yönet",
    icon: CreditCard,
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <NavigationMenuItem key={item.name}>
              <Link href={item.href} legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    pathname === item.href && "bg-accent text-accent-foreground"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.name}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          )
        })}

        {/* Finansal Dropdown Menu */}
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              pathname.startsWith("/financials") && "bg-accent text-accent-foreground"
            )}
          >
            <Calculator className="mr-2 h-4 w-4" />
            Finansal
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {financialNavigation.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.name}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          pathname === item.href && "bg-accent text-accent-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div className="text-sm font-medium leading-none">{item.name}</div>
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          {item.description}
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                )
              })}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
