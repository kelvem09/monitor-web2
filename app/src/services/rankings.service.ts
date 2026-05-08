import { api } from '../lib/api'
import type { Indicador } from './indicadores.service'

export interface Ranking {
  id: number
  indicador: Indicador
  codMunicipio: string
  ano: number
  posicaoRankingValor: number
  posicaoRankingPercentual: number
  valorNumerico: number
  valorPercentual: number
}

interface RankingsResponse {
  data: Ranking[]
}

export async function listRankings(params?: {
  indicadorId?: number
  ano?: number
  codMunicipio?: string
}): Promise<Ranking[]> {
  const { data } = await api.get<RankingsResponse | Ranking[]>('/rankings', { params })
  return Array.isArray(data) ? data : data.data
}
