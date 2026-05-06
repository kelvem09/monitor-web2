export interface IndicadorPublico {
  id: string
  codigo: string
  nome: string
  desc: string
  unidade: string
  base: string
  categoria: string
}

export const INDICADORES_PUBLICOS: ReadonlyArray<IndicadorPublico> = [
  {
    id: 'imi',
    codigo: 'IMI',
    nome: 'Taxa de Mortalidade Infantil',
    desc: 'Óbitos de menores de 1 ano por mil nascidos vivos',
    unidade: '‰',
    base: 'SINASC + SIM',
    categoria: 'Saúde Materno-Infantil',
  },
  {
    id: 'tn',
    codigo: 'TN',
    nome: 'Taxa de Natalidade',
    desc: 'Nascidos vivos por mil habitantes',
    unidade: '‰',
    base: 'SINASC',
    categoria: 'Demografia',
  },
  {
    id: 'mm',
    codigo: 'MM',
    nome: 'Razão de Mortalidade Materna',
    desc: 'Óbitos maternos por 100 mil nascidos vivos',
    unidade: '/100k',
    base: 'SINASC + SIM',
    categoria: 'Saúde Materno-Infantil',
  },
  {
    id: 'oce',
    codigo: 'OCE',
    nome: 'Óbitos por Causas Evitáveis',
    desc: 'Proporção de óbitos evitáveis no total de óbitos',
    unidade: '%',
    base: 'SIM',
    categoria: 'Mortalidade',
  },
  {
    id: 'rsx',
    codigo: 'RSX',
    nome: 'Razão de Sexos ao Nascer',
    desc: 'Nascidos vivos masculinos por 100 femininos',
    unidade: '',
    base: 'SINASC',
    categoria: 'Demografia',
  },
  {
    id: 'bpn',
    codigo: 'BPN',
    nome: 'Baixo Peso ao Nascer',
    desc: '% de nascidos com peso < 2500g',
    unidade: '%',
    base: 'SINASC',
    categoria: 'Saúde Materno-Infantil',
  },
]

export const ANOS_DISPONIVEIS: ReadonlyArray<number> = [2020, 2021, 2022, 2023, 2024]

export const COLOR_SCALE: ReadonlyArray<string> = [
  '#f1e4d8',
  '#e6b894',
  '#d28456',
  '#b75126',
  '#7a2510',
]
