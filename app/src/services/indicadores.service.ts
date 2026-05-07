import { api } from '../lib/api'
import type { Tema } from './temas.service'

export type DirecaoInterpretativa = 'maior_melhor' | 'menor_melhor'
export type IndicadorStatus = 'ATIVO' | 'INATIVO' | 'RASCUNHO'

export interface Indicador {
  id: number
  previstoOds: boolean
  metaOds?: string | null
  numeroOds?: number | null
  nome: string
  descricao?: string | null
  tema: Tema
  fonte?: string | null
  direcaoInterpretativa?: DirecaoInterpretativa | null
  status: IndicadorStatus | string
}

export interface IndicadorPayload {
  previstoOds: boolean
  metaOds?: string | null
  numeroOds?: number | null
  nome: string
  descricao?: string | null
  temaId: number
  fonte?: string | null
  direcaoInterpretativa?: DirecaoInterpretativa | null
  status?: string
}

export async function listIndicadores(): Promise<Indicador[]> {
  const { data } = await api.get<Indicador[]>('/indicadores')
  return data
}

export async function getIndicador(id: number): Promise<Indicador> {
  const { data } = await api.get<Indicador>(`/indicadores/${id}`)
  return data
}

export async function createIndicador(
  payload: IndicadorPayload,
): Promise<Indicador> {
  const { data } = await api.post<Indicador>('/indicadores', payload)
  return data
}

export async function updateIndicador(
  id: number,
  payload: Partial<IndicadorPayload>,
): Promise<Indicador> {
  const { data } = await api.patch<Indicador>(`/indicadores/${id}`, payload)
  return data
}

export async function deleteIndicador(id: number): Promise<Indicador> {
  const { data } = await api.delete<Indicador>(`/indicadores/${id}`)
  return data
}

export const DIRECAO_LABEL: Record<DirecaoInterpretativa, string> = {
  maior_melhor: 'Maior é melhor',
  menor_melhor: 'Menor é melhor',
}
