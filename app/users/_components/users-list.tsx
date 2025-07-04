"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, CheckCircle2 } from "lucide-react"
import { DeleteUserDialog } from "./delete-user-dialog"
import type { UserWithAuth } from "@/lib/auth"

interface UsersListProps {
  users: UserWithAuth[]
  onDelete: (id: string) => Promise<{ success?: string; error?: string }>
}

export function UsersList({ users, onDelete }: UsersListProps) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleDelete = async (id: string) => {
    const result = await onDelete(id)

    if (result.success) {
      setMessage({ type: "success", text: result.success })
      // 3 saniye sonra mesajı temizle
      setTimeout(() => setMessage(null), 3000)
    } else if (result.error) {
      setMessage({ type: "error", text: result.error })
    }

    return result
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">Yönetici</Badge>
      case "acc":
        return <Badge variant="secondary">Muhasebe</Badge>
      case "tech":
        return <Badge variant="outline">Teknisyen</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    return status === "active" ? <Badge variant="default">Aktif</Badge> : <Badge variant="secondary">Pasif</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Kullanıcılar</h1>
          <p className="text-muted-foreground">Sistem kullanıcılarını yönetin</p>
        </div>
        <Link href="/users/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kullanıcı
          </Button>
        </Link>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "success" && <CheckCircle2 className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Henüz kullanıcı bulunmuyor</p>
            <Link href="/users/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                İlk Kullanıcıyı Ekle
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{user.full_name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Oluşturulma: {new Date(user.created_at).toLocaleDateString("tr-TR")}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/users/${user.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <DeleteUserDialog user={user} onDelete={handleDelete} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
