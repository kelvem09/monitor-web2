import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { PublicTopBar } from '../../components/PublicTopBar'
import { Legend } from '../../components/Legend'
import { ANOS_DISPONIVEIS, COLOR_SCALE } from './indicadoresMock'
import { fetchRNMunicipiosGeoJSON, type RNGeoJSON } from '../../services/geojson.service'
import { listIndicadores, type Indicador } from '../../services/indicadores.service'
import {
  listIndicadoresCalculados,
  type IndicadorCalculado,
} from '../../services/indicadores-calculados.service'
import './Mapa.css'

const RN_BOUNDS: [[number, number], [number, number]] = [
  [-39.0, -7.2],
  [-34.5, -4.5],
]
const NO_DATA_COLOR = '#d4d4d4'

type MunValor = {
  ibge: string
  nome: string
  valor: number | null
  unidadeMedida: string | null
  hasData: boolean
}

function buildValoresFromCalculados(
  geo: RNGeoJSON,
  calculados: IndicadorCalculado[],
): Map<string, MunValor> {
  const calcMap = new Map<string, IndicadorCalculado>()
  for (const c of calculados) {
    calcMap.set(c.codMunicipio, c)
  }

  const map = new Map<string, MunValor>()
  for (const f of geo.features) {
    const ibge = String(f.properties.id ?? f.id ?? '')
    if (!ibge) continue
    const calc = calcMap.get(ibge)
    map.set(ibge, {
      ibge,
      nome: String(f.properties.name ?? ibge),
      valor: calc?.valorNumerico ?? null,
      unidadeMedida: calc?.unidadeMedida ?? null,
      hasData: calc !== undefined,
    })
  }
  return map
}

function colorFor(normalized: number): string {
  const idx = Math.min(COLOR_SCALE.length - 1, Math.floor(normalized * COLOR_SCALE.length))
  return COLOR_SCALE[idx]
}

function normalizeValor(valor: number, min: number, max: number): number {
  if (max === min) return 0.5
  return Math.min(1, Math.max(0, (valor - min) / (max - min)))
}

function computeDataStats(valores: Map<string, MunValor>): {
  min: number
  max: number
  unidadeMedida: string
} {
  let min = Infinity
  let max = -Infinity
  let unit = ''
  for (const v of valores.values()) {
    if (!v.hasData || v.valor == null) continue
    if (v.valor < min) min = v.valor
    if (v.valor > max) max = v.valor
    if (!unit && v.unidadeMedida) unit = v.unidadeMedida
  }
  return {
    min: isFinite(min) ? min : 0,
    max: isFinite(max) ? max : 0,
    unidadeMedida: unit,
  }
}

function enrichGeoJSON(
  geo: RNGeoJSON,
  valores: Map<string, MunValor>,
  dataMin: number,
  dataMax: number,
): RNGeoJSON {
  return {
    type: 'FeatureCollection',
    features: geo.features.map((f) => {
      const ibge = String(f.properties.id ?? f.id ?? '')
      const v = valores.get(ibge)
      const hasData = v?.hasData && v.valor != null
      const fillColor = hasData
        ? colorFor(normalizeValor(v!.valor!, dataMin, dataMax))
        : NO_DATA_COLOR
      return {
        ...f,
        properties: {
          ...f.properties,
          ibge,
          valor: v?.valor ?? null,
          unidadeMedida: v?.unidadeMedida ?? null,
          hasData: v?.hasData ?? false,
          fillColor,
        },
      }
    }),
  }
}

function buildHistogram(
  valores: Map<string, MunValor>,
  dataMin: number,
  dataMax: number,
  bins = 20,
): number[] {
  const out = Array<number>(bins).fill(0)
  for (const v of valores.values()) {
    if (!v.hasData || v.valor == null) continue
    const normalized = normalizeValor(v.valor, dataMin, dataMax)
    const i = Math.min(bins - 1, Math.max(0, Math.floor(normalized * bins)))
    out[i] += 1
  }
  return out
}

const SOURCE_ID = 'rn-municipios'
const FILL_LAYER_ID = 'rn-municipios-fill'
const LINE_LAYER_ID = 'rn-municipios-line'
const HOVER_LAYER_ID = 'rn-municipios-hover'

const BLANK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {},
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#ffffff' },
    },
  ],
}

export function Mapa() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const popupRef = useRef<maplibregl.Popup | null>(null)

  const [indicadores, setIndicadores] = useState<Indicador[]>([])
  const [indId, setIndId] = useState<number | null>(null)
  const [ano, setAno] = useState<number>(2024)
  const [geo, setGeo] = useState<RNGeoJSON | null>(null)
  const [calculados, setCalculados] = useState<IndicadorCalculado[]>([])
  const [carregandoGeo, setCarregandoGeo] = useState<boolean>(true)
  const [carregandoCalculados, setCarregandoCalculados] = useState<boolean>(false)
  const [erro, setErro] = useState<string | null>(null)

  const indicadorAtivo = useMemo(
    () => indicadores.find((i) => i.id === indId) ?? null,
    [indicadores, indId],
  )

  useEffect(() => {
    let cancel = false
    setCarregandoGeo(true)

    Promise.all([fetchRNMunicipiosGeoJSON(), listIndicadores()])
      .then(([data, inds]) => {
        if (cancel) return
        setGeo(data)
        setIndicadores(inds)
        if (inds.length > 0) setIndId(inds[0]!.id)
      })
      .catch((e: unknown) => {
        if (cancel) return
        setErro(e instanceof Error ? e.message : 'Falha ao carregar dados')
      })
      .finally(() => {
        if (!cancel) setCarregandoGeo(false)
      })

    return () => {
      cancel = true
    }
  }, [])

  useEffect(() => {
    if (indId === null) return

    let cancel = false
    setCarregandoCalculados(true)
    setErro(null)

    listIndicadoresCalculados({ indicadorId: indId, ano })
      .then((data) => {
        if (cancel) return
        setCalculados(data)
      })
      .catch((e: unknown) => {
        if (cancel) return
        setErro(e instanceof Error ? e.message : 'Falha ao carregar indicadores calculados')
      })
      .finally(() => {
        if (!cancel) setCarregandoCalculados(false)
      })

    return () => {
      cancel = true
    }
  }, [indId, ano])

  const valores = useMemo<Map<string, MunValor>>(
    () => (geo ? buildValoresFromCalculados(geo, calculados) : new Map()),
    [geo, calculados],
  )

  const dataStats = useMemo(() => computeDataStats(valores), [valores])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BLANK_STYLE,
      center: [-36.7, -5.7] as [number, number],
      zoom: 6,
      maxBounds: RN_BOUNDS,
      attributionControl: false,
    })

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
    mapRef.current = map

    map.once('load', () => {
      map.resize()
      map.fitBounds(RN_BOUNDS, { padding: 50 })
    })

    return () => {
      popupRef.current?.remove()
      popupRef.current = null
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !geo || valores.size === 0) return

    const enriched = enrichGeoJSON(geo, valores, dataStats.min, dataStats.max)

    const apply = () => {
      const src = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined
      if (src) {
        src.setData(enriched as unknown as GeoJSON.FeatureCollection)
        return
      }

      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: enriched as unknown as GeoJSON.FeatureCollection,
        promoteId: 'ibge',
      })

      map.addLayer({
        id: FILL_LAYER_ID,
        type: 'fill',
        source: SOURCE_ID,
        paint: {
          'fill-color': ['get', 'fillColor'],
          'fill-opacity': 0.95,
        },
      })

      map.addLayer({
        id: LINE_LAYER_ID,
        type: 'line',
        source: SOURCE_ID,
        paint: {
          'line-color': '#ffffff',
          'line-width': 0.8,
        },
      })

      map.addLayer({
        id: HOVER_LAYER_ID,
        type: 'line',
        source: SOURCE_ID,
        paint: {
          'line-color': '#14140f',
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1.6,
            0,
          ],
        },
      })

      let hoveredId: string | number | null = null

      map.on('mousemove', FILL_LAYER_ID, (e) => {
        const f = e.features?.[0]
        if (!f) return
        map.getCanvas().style.cursor = 'pointer'

        if (hoveredId !== null && hoveredId !== f.id) {
          map.setFeatureState({ source: SOURCE_ID, id: hoveredId }, { hover: false })
        }
        hoveredId = (f.id as string | number) ?? null
        if (hoveredId !== null) {
          map.setFeatureState({ source: SOURCE_ID, id: hoveredId }, { hover: true })
        }

        const props = f.properties as {
          name?: string
          valor?: number | null
          ibge?: string
          unidadeMedida?: string | null
          hasData?: boolean
        }
        const nome = props.name ?? props.ibge ?? '—'

        let valueHtml: string
        if (!props.hasData || props.valor == null) {
          valueHtml = '<span class="mapa__tooltip-value">Sem dados</span>'
        } else if (props.unidadeMedida) {
          valueHtml = `<span class="mapa__tooltip-value num">${props.valor.toLocaleString('pt-BR')} ${props.unidadeMedida}</span>`
        } else {
          valueHtml = `<span class="mapa__tooltip-value num">${props.valor.toLocaleString('pt-BR')}</span>`
        }

        const html = `
          <div class="mapa__tooltip">
            <span class="mapa__tooltip-title">${nome}</span>
            ${valueHtml}
          </div>
        `
        if (!popupRef.current) {
          popupRef.current = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            className: 'mapa__popup',
            offset: 8,
          })
        }
        popupRef.current.setLngLat(e.lngLat).setHTML(html).addTo(map)
      })

      map.on('mouseleave', FILL_LAYER_ID, () => {
        map.getCanvas().style.cursor = ''
        if (hoveredId !== null) {
          map.setFeatureState({ source: SOURCE_ID, id: hoveredId }, { hover: false })
          hoveredId = null
        }
        popupRef.current?.remove()
      })
    }

    if (map.isStyleLoaded()) {
      apply()
    } else {
      map.once('load', apply)
    }
  }, [geo, valores, dataStats])

  const carregando = carregandoGeo || carregandoCalculados
  const histogram = useMemo(
    () => buildHistogram(valores, dataStats.min, dataStats.max),
    [valores, dataStats],
  )
  const histMax = Math.max(1, ...histogram)

  const handleZoomIn = () => mapRef.current?.zoomIn()
  const handleZoomOut = () => mapRef.current?.zoomOut()
  const handleRecenter = () => {
    mapRef.current?.fitBounds(RN_BOUNDS, { padding: 50, essential: true })
  }

  return (
    <div className="mapa">
      <PublicTopBar active="mapa" />

      <div className="mapa__body">
        <aside className="mapa__sidebar">
          <span className="h-eyebrow">Indicador</span>
          <div className="mapa__indicadores">
            {indicadores.map((i) => {
              const ativo = i.id === indId
              return (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => setIndId(i.id)}
                  className={`mapa__indicador${ativo ? ' mapa__indicador--ativo' : ''}`}
                >
                  <span className="mapa__indicador-nome">{i.nome}</span>
                  <span className="mapa__indicador-meta">
                    {i.fonte ?? i.tema.nome}
                  </span>
                </button>
              )
            })}
          </div>

          <span className="h-eyebrow">Ano</span>
          <div className="mapa__anos">
            {ANOS_DISPONIVEIS.map((a) => {
              const ativo = a === ano
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAno(a)}
                  className={`chip mapa__ano${ativo ? ' chip-active' : ''}`}
                >
                  {a}
                </button>
              )
            })}
          </div>

          <span className="h-eyebrow">Distribuição</span>
          <div className="mapa__hist">
            {histogram.map((b, i) => (
              <span
                key={i}
                style={{
                  height: `${(b / histMax) * 100}%`,
                  background:
                    COLOR_SCALE[
                      Math.min(
                        COLOR_SCALE.length - 1,
                        Math.floor((i / histogram.length) * COLOR_SCALE.length),
                      )
                    ],
                }}
              />
            ))}
          </div>
          <div className="mapa__hist-eixo num">
            <span>{dataStats.min.toLocaleString('pt-BR')} {dataStats.unidadeMedida}</span>
            <span>{dataStats.max.toLocaleString('pt-BR')} {dataStats.unidadeMedida}</span>
          </div>

          {indicadorAtivo && (
            <div className="mapa__sobre">
              <span className="h-eyebrow">Sobre o indicador</span>
              <p className="mapa__sobre-desc">{indicadorAtivo.descricao ?? '—'}</p>
              <div className="mapa__sobre-chips">
                <span className="chip">{indicadorAtivo.tema.nome}</span>
                {indicadorAtivo.fonte && (
                  <span className="chip">{indicadorAtivo.fonte}</span>
                )}
              </div>
            </div>
          )}
        </aside>

        <main className="mapa__main">
          <header className="mapa__header">
            <div>
              <span className="h-eyebrow">
                {indicadorAtivo?.fonte ?? '—'} · {ano}
              </span>
              <h2 className="h-display mapa__title">{indicadorAtivo?.nome ?? '—'}</h2>
            </div>
            <div className="mapa__actions">
              <Legend
                scale={COLOR_SCALE}
                min={dataStats.min}
                max={dataStats.max}
                unit={dataStats.unidadeMedida}
              />
              <button type="button" className="btn btn-sm">
                ⤓ Exportar
              </button>
            </div>
          </header>

          <div className="card mapa__canvas">
            <div ref={containerRef} className="mapa__map" />

            <div className="mapa__zoom">
              <button
                type="button"
                onClick={handleZoomIn}
                className="btn btn-sm mapa__zoom-btn"
                aria-label="Aproximar"
              >
                +
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="btn btn-sm mapa__zoom-btn"
                aria-label="Afastar"
              >
                −
              </button>
              <button
                type="button"
                onClick={handleRecenter}
                className="btn btn-sm mapa__zoom-btn"
                aria-label="Centralizar"
              >
                ⌖
              </button>
            </div>

            {carregando && (
              <div className="mapa__overlay" role="status">
                {carregandoGeo ? 'Carregando municípios…' : 'Carregando dados…'}
              </div>
            )}
            {erro && !carregando && (
              <div className="mapa__overlay mapa__overlay--erro" role="alert">
                {erro}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
