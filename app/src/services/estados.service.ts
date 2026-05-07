import { api } from '../lib/api'

export interface Estado {
  id: number
  codigo: number
  nome: string
  uf: string
}

export interface EstadoPayload {
  codigo: number
  nome: string
  uf: string
}

export async function listEstados(): Promise<Estado[]> {
  const { data } = await api.get<Estado[]>('/estados')
  return data
}

export async function getEstado(id: number): Promise<Estado> {
  const { data } = await api.get<Estado>(`/estados/${id}`)
  return data
}

export async function createEstado(payload: EstadoPayload): Promise<Estado> {
  const { data } = await api.post<Estado>('/estados', payload)
  return data
}

export async function updateEstado(id: number, payload: EstadoPayload): Promise<Estado> {
  const { data } = await api.put<Estado>(`/estados/${id}`, payload)
  return data
}

export async function deleteEstado(id: number): Promise<void> {
  await api.delete(`/estados/${id}`)
}
