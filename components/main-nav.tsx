"use client"

import * as React from "react"
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
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/auth/actions"

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Finansal Özet",
    href: "/financials",
    description: "Genel finansal durum ve özet bilgiler",
  },
  {
    title: "Gelir Listesi",
    href: "/financials/income",
    description: "Tüm gelir kayıtlarını görüntüle ve yönet",
  },
  {
    title: "Gider Listesi",
    href: "/financials/expenses",
    description: "Tüm gider kayıtlarını görüntüle ve yönet",
  },
  {
    title: "Hesap Planı",
    href: "/financials/chart-of-accounts",
    description: "Finansal hesap planını yönet",
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <div className="flex items-center space-x-4 lg:space-x-6">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Ana Sayfa</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/customers" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Müşteriler</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/products" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Ürünler</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/inventory" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Envanter</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/sales" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Satışlar</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/invoices" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Faturalar</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Finansal</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {components.map((component) => (
                  <ListItem key={component.title} title={component.title} href={component.href}>
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/suppliers" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Tedarikçiler</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/service" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Servis</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/users" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>Kullanıcılar</NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <form action={logoutAction}>
        <Button type="submit" variant="outline" size="sm">
          Çıkış Yap
        </Button>
      </form>
    </div>
  )
}

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className,
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  },
)
ListItem.displayName = "ListItem"
