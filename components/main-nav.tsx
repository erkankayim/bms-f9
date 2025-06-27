"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Package2,
  Users,
  Building,
  ShoppingCart,
  FileText,
  DollarSign,
  Briefcase,
  LayoutDashboard,
  AlertTriangle,
  ChevronDown,
  LogOut,
  UserPlus,
  Wrench,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const navItems = [
  { href: "/", label: "Kontrol Paneli", icon: LayoutDashboard },
  { href: "/customers", label: "Müşteriler", icon: Users },
  { href: "/suppliers", label: "Tedarikçiler", icon: Building },
  { href: "/inventory", label: "Envanter", icon: ShoppingCart },
  { href: "/inventory/adjust", label: "Stok Ayarla", icon: ShoppingCart },
  { href: "/inventory/alerts", label: "Stok Uyarıları", icon: AlertTriangle },
  { href: "/products", label: "Ürünler", icon: Package2 },
  { href: "/sales", label: "Satışlar", icon: DollarSign },
  { href: "/service", label: "Servis", icon: Wrench },
  {
    href: "/invoices",
    label: "Faturalar",
    icon: FileText,
    isDropdown: true,
    subItems: [
      { href: "/invoices", label: "Fatura Listesi" },
      { href: "/invoices/new", label: "Yeni Fatura" },
    ],
  },
  {
    href: "/financials",
    label: "Finansal",
    icon: Briefcase,
    isDropdown: true,
    subItems: [
      { href: "/financials", label: "Finansal Özet" },
      { href: "/financials/chart-of-accounts", label: "Hesap Planı" },
      { href: "/financials/income/new", label: "Yeni Gelir Girişi" },
      { href: "/financials/expenses/new", label: "Yeni Gider Girişi" },
    ],
  },
  { href: "/users", label: "Kullanıcılar", icon: UserPlus },
]

export function MainNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Package2 className="h-6 w-6" />
          <span className="sr-only">İş Yönetimi</span>
        </Link>
        {navItems.map((item) => {
          if (item.isDropdown && item.subItems) {
            return (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "transition-colors hover:text-foreground flex items-center gap-1 px-3 py-2 text-sm font-medium",
                      pathname.startsWith(item.href) ? "text-foreground bg-accent" : "text-muted-foreground",
                    )}
                  >
                    <item.icon className="mr-1 inline-block h-4 w-4" />
                    {item.label}
                    <ChevronDown className="ml-1 h-4 w-4 opacity-75" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {item.subItems.map((subItem) => (
                    <DropdownMenuItem key={subItem.href} asChild>
                      <Link href={subItem.href}>{subItem.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "transition-colors hover:text-foreground px-3 py-2 text-sm font-medium",
                pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                  ? "text-foreground bg-accent rounded-md"
                  : "text-muted-foreground",
              )}
            >
              <item.icon className="mr-1 inline-block h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Navigasyon menüsünü aç/kapat</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="sr-only">İş Yönetimi</span>
            </Link>
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2 transition-colors hover:text-foreground ${
                    pathname === item.href ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=36&width=36" alt="Kullanıcı Avatarı" />
                <AvatarFallback>KA</AvatarFallback>
              </Avatar>
              <span className="sr-only">Kullanıcı menüsünü aç/kapat</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/users">Kullanıcı Yönetimi</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer">
              <LogOut className="h-4 w-4 mr-2" />
              Çıkış Yap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
