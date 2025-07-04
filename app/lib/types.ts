export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  role: UserRole
  status: "active" | "inactive"
  created_at: string
  updated_at: string
}

export interface UserWithAuth extends UserProfile {
  email: string
}

export type UserRole = "admin" | "acc" | "tech"

export interface CreateUserData {
  full_name: string
  email: string
  password: string
  role: UserRole
  status: "active" | "inactive"
}

export interface UpdateUserData {
  full_name: string
  email?: string
  password?: string
  role: UserRole
  status: "active" | "inactive"
}
