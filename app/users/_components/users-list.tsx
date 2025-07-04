"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Eye, Plus } from "lucide-react"
import { DeleteUserDialog } from "./delete-user-dialog"
import { useToast } from "@/hooks/use-toast"
import type { UserWithAuth } from "@/lib/auth"

interface UsersListProps {
  users: UserWithAuth[]
  deleteUser: (id: string) => Promise<{ success?: string; error?: string }>
}

export function UsersList({ users, deleteUser }: UsersListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserWithAuth | null>(null)
  const { toast } = useToast()

  const handleDeleteClick = (user: UserWithAuth) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      const result = await deleteUser(userToDelete.id.toString())

      if (result.success) {
        toast({
          title: "Başarılı",
          description: result.success,
          duration: 1500,
        })
      } else if (result.error) {
        toast({
          title: "Hata",
          description: result.error,
          variant: "destructive",
          duration: 1500,
        })
      }

      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const getRoleBadge = (role: string) => {
    const roleMap = {
      admin: { label: "Yönetici", variant: "destructive" as const },
      acc: { label: "Muhasebe", variant: "secondary" as const },
      tech: { label: "Teknisyen", variant: "default" as const },
    }
    const roleInfo = roleMap[role as keyof typeof roleMap] || { label: role, variant: "outline" as const }
    return <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "active" ? "default" : "secondary"}>{status === "active" ? "Aktif" : "Pasif"}</Badge>
    )
  }

  // Null kontrolü ekle
  const validUsers = users.filter((user) => user && user.full_name)

  if (validUsers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Bulunamadı</CardTitle>
          <CardDescription>Henüz hiç kullanıcı eklenmemiş.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/users/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              İlk Kullanıcıyı Ekle
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kullanıcılar ({validUsers.length})</CardTitle>
              <CardDescription>Sistem kullanıcılarını yönetin</CardDescription>
            </div>
            <Link href="/users/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Kullanıcı
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>E-posta</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Oluşturulma</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || "İsimsiz Kullanıcı"}</TableCell>
                  <TableCell>{user.email || "E-posta yok"}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString("tr-TR") : "Bilinmiyor"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/users/${user.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/users/${user.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(user)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <DeleteUserDialog
        user={userToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}
