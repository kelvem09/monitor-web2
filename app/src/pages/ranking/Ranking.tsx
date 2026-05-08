import { useEffect, useMemo, useState } from 'react'
import { PublicTopBar } from '../../components/PublicTopBar'
import { ANOS_DISPONIVEIS, COLOR_SCALE } from '../mapa/indicadoresMock'
import { listIndicadores, type Indicador } from '../../services/indicadores.service'
import { listRankings, type Ranking } from '../../services/rankings.service'
import { listMunicipios, type Municipio } from '../../services/municipios.service'
import './Ranking.css'

function colorForPct(pct: number): string {
  const idx = Math.min(COLOR_SCALE.length - 1, Math.floor((pct / 100) * COLOR_SCALE.length))
  return COLOR_SCALE[idx]
}

export function RankingPage() {
  const [indicadores, setIndicadores] = useState<Indicador[]>([])
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [indId, setIndId] = useState<number | null>(null)
  const [ano, setAno] = useState<number>(2024)
  const [tipoDado, setTipoDado] = useState<'unidade' | 'percentual'>('unidade')
  const [carregandoInit, setCarregandoInit] = useState(true)
  const [carregandoRankings, setCarregandoRankings] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let cancel = false
    setCarregandoInit(true)

    Promise.all([listIndicadores(), listMunicipios()])
      .then(([inds, muns]) => {
        if (cancel) return
        setIndicadores(inds)
        setMunicipios(muns)
        if (inds.length > 0) setIndId(inds[0]!.id)
      })
      .catch((e: unknown) => {
        if (cancel) return
        setErro(e instanceof Error ? e.message : 'Falha ao carregar dados')
      })
      .finally(() => {
        if (!cancel) setCarregandoInit(false)
      })

    return () => { cancel = true }
  }, [])

  useEffect(() => {
    if (indId === null) return

    let cancel = false
    setCarregandoRankings(true)
    setErro(null)

    listRankings({ indicadorId: indId, ano })
      .then((data) => {
        if (cancel) return
        setRankings(data)
      })
      .catch((e: unknown) => {
        if (cancel) return
        setErro(e instanceof Error ? e.message : 'Falha ao carregar rankings')
      })
      .finally(() => {
        if (!cancel) setCarregandoRankings(false)
      })

    return () => { cancel = true }
  }, [indId, ano])

  const municipioMap = useMemo(() => {
    const m = new Map<string, Municipio>()
    for (const mun of municipios) {
      m.set(String(mun.codigoIbge), mun)
    }
    return m
  }, [municipios])

  const sorted = useMemo(
    () =>
      tipoDado === 'unidade'
        ? [...rankings].sort((a, b) => a.posicaoRankingValor - b.posicaoRankingValor)
        : [...rankings].sort((a, b) => a.posicaoRankingPercentual - b.posicaoRankingPercentual),
    [rankings, tipoDado],
  )

  const maxValor = useMemo(() => {
    if (sorted.length === 0) return 1
    return tipoDado === 'unidade'
      ? Math.max(...sorted.map((r) => r.valorNumerico))
      : Math.max(...sorted.map((r) => r.valorPercentual))
  }, [sorted, tipoDado])

  const indicadorAtivo = useMemo(
    () => indicadores.find((i) => i.id === indId) ?? null,
    [indicadores, indId],
  )

  const mediana = useMemo(() => {
    if (sorted.length === 0) return null
    const mid = Math.floor(sorted.length / 2)
    return sorted[mid]
  }, [sorted])

  const carregando = carregandoInit || carregandoRankings

  return (
    <div className="ranking">
      <PublicTopBar active="ranking" />

      <div className="ranking__body">
        <div className="ranking__header">
          <div className="ranking__title-block">
            <span className="h-eyebrow ranking__eyebrow">Ranking municipal</span>
            <h2 className="h-display ranking__title">
              {indicadorAtivo?.nome ?? '—'}{' '}
              <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>· {ano}</span>
            </h2>
            <p className="ranking__subtitle">
              {indicadorAtivo?.descricao ?? ''}
              {sorted.length > 0 && ` · ${sorted.length} municípios`}
            </p>
          </div>

          <div className="ranking__controls">
            <select
              className="ranking__select"
              style={{ width: 240 }}
              value={indId ?? ''}
              onChange={(e) => setIndId(Number(e.target.value))}
            >
              {indicadores.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nome}
                </option>
              ))}
            </select>
            <select
              className="ranking__select"
              style={{ width: 120 }}
              value={tipoDado}
              onChange={(e) => setTipoDado(e.target.value as 'unidade' | 'percentual')}
            >
              <option value="unidade">Unidade</option>
              <option value="percentual">Percentual</option>
            </select>
            <select
              className="ranking__select"
              style={{ width: 90 }}
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
            >
              {ANOS_DISPONIVEIS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!carregando && !erro && sorted.length > 0 && (
          <div className="ranking__stats">
            {[
              {
                label: 'Melhor posição',
                item: sorted[0],
                color: COLOR_SCALE[0],
              },
              {
                label: 'Mediana',
                item: mediana,
                color: COLOR_SCALE[2],
              },
              {
                label: 'Última posição',
                item: sorted[sorted.length - 1],
                color: COLOR_SCALE[4],
              },
            ].map(({ label, item, color }) => {
              const nomeMun = item
                ? (municipioMap.get(item.codMunicipio)?.nome ?? item.codMunicipio)
                : '—'
              return (
                <div key={label} className="card ranking__stat-card">
                  <div className="ranking__stat-bar" style={{ background: color }} />
                  <div>
                    <div className="h-eyebrow ranking__stat-label">{label}</div>
                    <p className="num h-display ranking__stat-value">
                      {item
                        ? (tipoDado === 'unidade' ? item.posicaoRankingValor : item.posicaoRankingPercentual)
                        : '—'}
                      <span className="ranking__stat-unit">º</span>
                    </p>
                    <p className="ranking__stat-where">{nomeMun}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="card ranking__table-card">
          {carregando ? (
            <div className="ranking__overlay">
              {carregandoInit ? 'Carregando dados…' : 'Atualizando ranking…'}
            </div>
          ) : erro ? (
            <div className="ranking__overlay ranking__overlay--erro">{erro}</div>
          ) : sorted.length === 0 ? (
            <div className="ranking__overlay">Nenhum dado disponível para esta seleção.</div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Município</th>
                  <th style={{ width: 120 }} className="num">Valor</th>
                  <th style={{ width: 140 }} className="num">Valor percentual</th>
                  <th style={{ width: 200 }} className="ranking__pct-cell">
                    Comparado ao máximo
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r, idx) => {
                  const mun = municipioMap.get(r.codMunicipio)
                  const nomeMun = mun?.nome ?? r.codMunicipio
                  const position = tipoDado === 'unidade' ? r.posicaoRankingValor : r.posicaoRankingPercentual
                  const rawVal = tipoDado === 'unidade' ? r.valorNumerico : r.valorPercentual
                  const pct = maxValor > 0 ? (rawVal / maxValor) * 100 : 0

                  return (
                    <tr key={r.id}>
                      <td className="num" style={{ color: 'var(--ink-3)' }}>
                        {String(position).padStart(2, '0')}º
                      </td>
                      <td style={{ fontWeight: 500 }}>{nomeMun}</td>
                      <td className="num" style={{ color: 'var(--ink-2)' }}>
                        {r.valorNumerico.toLocaleString('pt-BR')}
                      </td>
                      <td className="num" style={{ color: 'var(--ink-2)' }}>
                        {r.valorPercentual.toFixed(2)}%
                      </td>
                      <td className="ranking__pct-cell">
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <div className="ranking__pct-track" style={{ flex: 1 }}>
                            <div
                              className="ranking__pct-fill"
                              style={{
                                width: `${pct}%`,
                                background: colorForPct(pct),
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
