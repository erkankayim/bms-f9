"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Package, Users, ShoppingCart, FileText, Calculator, Truck, Settings, Wrench, LogOut } from "lucide-react"
import { logoutAction } from "@/app/auth/actions"
import { useActionState } from "react"
import { useEffect } from "react"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Ürünler", href: "/products", icon: Package },
  { name: "Müşteriler", href: "/customers", icon: Users },
  { name: "Satışlar", href: "/sales", icon: ShoppingCart },
  { name: "Faturalar", href: "/invoices", icon: FileText },
  { name: "Finansal", href: "/financials", icon: Calculator },
  { name: "Tedarikçiler", href: "/suppliers", icon: Truck },
  { name: "Envanter", href: "/inventory", icon: Package },
  { name: "Servis", href: "/service", icon: Wrench },
  { name: "Kullanıcılar", href: "/users", icon: Settings },
]

export function MainNav() {
  const pathname = usePathname()
  const [logoutState, logoutFormAction, isLoggingOut] = useActionState(logoutAction, null)

  // Çıkış başarılı olduğunda client-side yönlendirme
  useEffect(() => {
    if (logoutState?.success) {
      window.location.href = "/auth/login"
    }
  }, [logoutState?.success])

  const handleLogout = async () => {
    await logoutFormAction()
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4">
          <h1 className="text-xl font-bold">İşletme Yönetimi</h1>
        </div>

        <nav className="flex-1 px-4 py-2">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:bg-gray-700 hover:text-white"
            disabled={isLoggingOut}
          >
            <LogOut className="mr-3 h-5 w-5" />
            {isLoggingOut ? "Çıkış yapılıyor..." : "Çıkış Yap"}
          </Button>
        </div>
      </div>
    </div>
  )
}
