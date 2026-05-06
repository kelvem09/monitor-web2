import { api } from '../lib/api'

export type UserRole = 'ADMIN' | 'GESTOR_PUBLICO'

export interface User {
  id: number
  name: string
  email: string
  isActive: boolean
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: User
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', payload)
  return data
}
