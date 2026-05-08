import { api } from '../lib/api'

export interface Ods {
  id: number
  numeroOds: number
  temaOds: string
}

export interface OdsPayload {
  numeroOds: number
  temaOds: string
}

export async function listOds(): Promise<Ods[]> {
  const { data } = await api.get<Ods[]>('/ods')
  return data
}

export async function getOds(id: number): Promise<Ods> {
  const { data } = await api.get<Ods>(`/ods/${id}`)
  return data
}

export async function createOds(payload: OdsPayload): Promise<Ods> {
  const { data } = await api.post<Ods>('/ods', payload)
  return data
}

export async function updateOds(id: number, payload: Partial<OdsPayload>): Promise<Ods> {
  const { data } = await api.patch<Ods>(`/ods/${id}`, payload)
  return data
}

export async function deleteOds(id: number): Promise<void> {
  await api.delete(`/ods/${id}`)
}
