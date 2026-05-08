import { api } from '../lib/api'

export interface BaseDados {
  id: number
  nome: string
  sigla: string
  descricao?: string | null
  ativa: boolean
}

export async function listBases(): Promise<BaseDados[]> {
  const { data } = await api.get<BaseDados[]>('/bases')
  return data
}
