"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Edit, Search, UserPlus } from "lucide-react"
import { DeleteUserDialog } from "./delete-user-dialog"
import type { UserWithAuth } from "@/lib/auth"

interface UsersListProps {
  users: UserWithAuth[]
  currentUserRole: string | null
}

export function UsersList({ users, currentUserRole }: UsersListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive"
      case "acc":
        return "secondary"
      case "tech":
        return "outline"
      default:
        return "outline"
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "Yönetici"
      case "acc":
        return "Muhasebe"
      case "tech":
        return "Teknisyen"
      default:
        return role
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    return status === "active" ? "default" : "secondary"
  }

  const getStatusText = (status: string) => {
    return status === "active" ? "Aktif" : "Pasif"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Kullanıcı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {currentUserRole === "admin" && (
          <Button asChild>
            <Link href="/users/new">
              <UserPlus className="h-4 w-4 mr-2" />
              Yeni Kullanıcı
            </Link>
          </Button>
        )}
      </div>

      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              {searchTerm ? "Arama kriterlerine uygun kullanıcı bulunamadı." : "Henüz kullanıcı bulunmuyor."}
            </p>
            {currentUserRole === "admin" && !searchTerm && (
              <Button asChild className="mt-4">
                <Link href="/users/new">
                  <UserPlus className="h-4 w-4 mr-2" />
                  İlk Kullanıcıyı Ekle
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{user.full_name}</CardTitle>
                    <CardDescription className="text-sm">{user.email}</CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant={getRoleBadgeVariant(user.role)}>{getRoleText(user.role)}</Badge>
                    <Badge variant={getStatusBadgeVariant(user.status)}>{getStatusText(user.status)}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  {currentUserRole === "admin" && (
                    <>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/users/${user.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Düzenle
                        </Link>
                      </Button>
                      <DeleteUserDialog user={user} />
                    </>
                  )}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Oluşturulma: {new Date(user.created_at).toLocaleDateString("tr-TR")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
