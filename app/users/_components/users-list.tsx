"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DeleteUserDialog } from "./delete-user-dialog"
import { getUsers, type UserProfile } from "../_actions/users-actions"

const roleLabels = {
  admin: "Yönetici",
  tech: "Teknisyen",
  acc: "Muhasebe",
}

const roleColors = {
  admin: "destructive",
  tech: "default",
  acc: "secondary",
} as const

export function UsersList() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const result = await getUsers()
        if (result.error) {
          setError(result.error)
        } else {
          setUsers(result.data || [])
        }
      } catch (err) {
        setError("Kullanıcılar yüklenirken hata oluştu")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return <div className="text-center py-4">Kullanıcılar yükleniyor...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Henüz kullanıcı bulunmuyor.</p>
        <Button asChild className="mt-4">
          <Link href="/users/new">İlk kullanıcıyı ekle</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ad Soyad</TableHead>
            <TableHead>E-posta</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Kayıt Tarihi</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.full_name || "İsimsiz Kullanıcı"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={roleColors[user.role]}>{roleLabels[user.role]}</Badge>
              </TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString("tr-TR")}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/users/${user.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <DeleteUserDialog userId={user.id} userName={user.full_name || user.email} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
