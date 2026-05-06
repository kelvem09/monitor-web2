import { api } from '../lib/api'
import type { Estado } from './estados.service'

export interface Municipio {
  id: number
  codigoIbge: number
  nome: string
  estado: Estado
}

export interface MunicipioPayload {
  codigoIbge: number
  nome: string
  estadoId: number
}

export async function listMunicipios(): Promise<Municipio[]> {
  const { data } = await api.get<Municipio[]>('/municipios')
  return data
}

export async function getMunicipio(id: number): Promise<Municipio> {
  const { data } = await api.get<Municipio>(`/municipios/${id}`)
  return data
}

export async function createMunicipio(payload: MunicipioPayload): Promise<Municipio> {
  const { data } = await api.post<Municipio>('/municipios', payload)
  return data
}

export async function updateMunicipio(
  id: number,
  payload: MunicipioPayload,
): Promise<Municipio> {
  const { data } = await api.patch<Municipio>(`/municipios/${id}`, payload)
  return data
}

export async function deleteMunicipio(id: number): Promise<void> {
  await api.delete(`/municipios/${id}`)
}
