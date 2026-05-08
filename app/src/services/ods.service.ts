import { api } from '../lib/api'

export interface Ods {
  id: number
  numeroOds: number
  temaOds: string
}

export async function listOds(): Promise<Ods[]> {
  const { data } = await api.get<Ods[]>('/ods')
  return data
}
