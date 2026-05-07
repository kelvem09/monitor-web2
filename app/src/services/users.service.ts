import { api } from '../lib/api'
import type { User, UserRole } from './auth.service'

export type { User, UserRole }

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: UserRole
  isActive?: boolean
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  password?: string
  role?: UserRole
  isActive?: boolean
}

export async function listUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>('/users')
  return data
}

export async function getUser(id: number): Promise<User> {
  const { data } = await api.get<User>(`/users/${id}`)
  return data
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await api.post<User>('/users', payload)
  return data
}

export async function updateUser(
  id: number,
  payload: UpdateUserPayload,
): Promise<User> {
  const { data } = await api.patch<User>(`/users/${id}`, payload)
  return data
}

export async function deleteUser(id: number): Promise<User> {
  const { data } = await api.delete<User>(`/users/${id}`)
  return data
}

export const USER_ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  GESTOR_PUBLICO: 'Gestor Público',
}

export const USER_ROLE_DESCRIPTION: Record<UserRole, string> = {
  ADMIN: 'Gestão completa do sistema, indicadores e usuários',
  GESTOR_PUBLICO: 'Cria e gerencia indicadores do seu município',
}
