import { api } from '../lib/api'
import type { Indicador } from './indicadores.service'

export interface IndicadorCalculado {
  id: number
  indicador: Indicador
  ano: number
  codMunicipio: string
  valorNumerico?: number | null
  unidadeMedida?: string | null
  valorPercentual?: number | null
}

export interface ProcessarResult {
  indicadorId: number
  indicadorNome: string
  anosProcessados: number[]
  totalRegistrosGerados: number
}

export interface LimparResult {
  deletados: number
}

export async function processarIndicador(id: number): Promise<ProcessarResult> {
  const { data } = await api.post<ProcessarResult>(
    `/indicadores-calculados/processar/${id}`,
  )
  return data
}

export async function limparIndicadoresCalculados(
  indicadorId?: number,
): Promise<LimparResult> {
  const { data } = await api.delete<LimparResult>(
    '/indicadores-calculados/limpar',
    { params: indicadorId !== undefined ? { indicadorId } : undefined },
  )
  return data
}

export async function listIndicadoresCalculados(params?: {
  indicadorId?: number
  ano?: number
  codMunicipio?: string
}): Promise<IndicadorCalculado[]> {
  const { data } = await api.get<IndicadorCalculado[]>(
    '/indicadores-calculados',
    { params },
  )
  return data
}

export async function indicadorJaFoiCalculado(
  indicadorId: number,
): Promise<boolean> {
  const registros = await listIndicadoresCalculados({ indicadorId })
  return registros.length > 0
}
