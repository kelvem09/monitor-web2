import { api } from '../lib/api'

export interface Tema {
  id: number
  nome: string
}

export interface TemaPayload {
  nome: string
}

export async function listTemas(): Promise<Tema[]> {
  const { data } = await api.get<Tema[]>('/temas-indicadores')
  return data
}

export async function getTema(id: number): Promise<Tema> {
  const { data } = await api.get<Tema>(`/temas-indicadores/${id}`)
  return data
}

export async function createTema(payload: TemaPayload): Promise<Tema> {
  const { data } = await api.post<Tema>('/temas-indicadores', payload)
  return data
}

export async function updateTema(
  id: number,
  payload: TemaPayload,
): Promise<Tema> {
  const { data } = await api.patch<Tema>(`/temas-indicadores/${id}`, payload)
  return data
}

export async function deleteTema(id: number): Promise<void> {
  await api.delete(`/temas-indicadores/${id}`)
}
