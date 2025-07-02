export type UserRole = "admin" | "acc" | "tech"
export type UserStatus = "active" | "inactive"

export interface UserProfile {
  id: string // This is the user_id from auth.users
  full_name: string | null
  email: string
  role: UserRole
  status: UserStatus
  created_at: string
}
