import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { PublicTopBar } from '../../components/PublicTopBar'
import { Legend } from '../../components/Legend'
import {
  ANOS_DISPONIVEIS,
  COLOR_SCALE,
  INDICADORES_PUBLICOS,
} from './indicadoresMock'
import { fetchRNMunicipiosGeoJSON, type RNGeoJSON } from '../../services/geojson.service'
import { listMunicipios, type Municipio } from '../../services/municipios.service'
import './Mapa.css'

const RN_CENTER: [number, number] = [-36.7, -5.7]
const RN_ZOOM = 6.6
const RN_BOUNDS: [[number, number], [number, number]] = [
  [-39.0, -7.2],
  [-34.5, -4.5],
]

type MunValor = {
  ibge: string
  nome: string
  valor: number
}

function buildRandomValores(geo: RNGeoJSON): Map<string, MunValor> {
  const map = new Map<string, MunValor>()
  for (const f of geo.features) {
    const ibge = String(f.properties.id ?? f.id ?? '')
    if (!ibge) continue
    map.set(ibge, {
      ibge,
      nome: String(f.properties.name ?? ibge),
      valor: Math.random(),
    })
  }
  return map
}

function colorFor(valor: number): string {
  const idx = Math.min(COLOR_SCALE.length - 1, Math.max(0, Math.floor(valor * COLOR_SCALE.length)))
  return COLOR_SCALE[idx]
}

function enrichGeoJSON(geo: RNGeoJSON, valores: Map<string, MunValor>): RNGeoJSON {
  return {
    type: 'FeatureCollection',
    features: geo.features.map((f) => {
      const ibge = String(f.properties.id ?? f.id ?? '')
      const v = valores.get(ibge)
      return {
        ...f,
        properties: {
          ...f.properties,
          ibge,
          valor: v?.valor ?? 0,
          fillColor: colorFor(v?.valor ?? 0),
        },
      }
    }),
  }
}

function buildHistogram(valores: Map<string, MunValor>, bins = 20): number[] {
  const out = Array<number>(bins).fill(0)
  for (const v of valores.values()) {
    const i = Math.min(bins - 1, Math.max(0, Math.floor(v.valor * bins)))
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

  const [indId, setIndId] = useState<string>(INDICADORES_PUBLICOS[0]!.id)
  const [ano, setAno] = useState<number>(2024)
  const [geo, setGeo] = useState<RNGeoJSON | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState<boolean>(true)
  const [, setMunicipiosApi] = useState<Municipio[]>([])

  const indicador = useMemo(
    () => INDICADORES_PUBLICOS.find((i) => i.id === indId) ?? INDICADORES_PUBLICOS[0]!,
    [indId],
  )

  useEffect(() => {
    let cancel = false

    Promise.all([fetchRNMunicipiosGeoJSON(), listMunicipios().catch(() => [] as Municipio[])])
      .then(([data, mun]) => {
        if (cancel) return
        setGeo(data)
        setMunicipiosApi(mun)
      })
      .catch((e: unknown) => {
        if (cancel) return
        setErro(e instanceof Error ? e.message : 'Falha ao carregar dados')
      })
      .finally(() => {
        if (!cancel) setCarregando(false)
      })

    return () => {
      cancel = true
    }
  }, [])

  const valores = useMemo<Map<string, MunValor>>(
    () => (geo ? buildRandomValores(geo) : new Map()),
    // Regenera valores aleatórios ao trocar indicador/ano (placeholder até backend).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [geo, indId, ano],
  )

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BLANK_STYLE,
      center: RN_CENTER,
      zoom: RN_ZOOM,
      maxBounds: RN_BOUNDS,
      attributionControl: false,
    })

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
    mapRef.current = map

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

    const enriched = enrichGeoJSON(geo, valores)

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
          map.setFeatureState(
            { source: SOURCE_ID, id: hoveredId },
            { hover: false },
          )
        }
        hoveredId = (f.id as string | number) ?? null
        if (hoveredId !== null) {
          map.setFeatureState(
            { source: SOURCE_ID, id: hoveredId },
            { hover: true },
          )
        }

        const props = f.properties as { name?: string; valor?: number; ibge?: string }
        const nome = props.name ?? props.ibge ?? '—'
        const v = typeof props.valor === 'number' ? props.valor : 0
        const html = `
          <div class="mapa__tooltip">
            <span class="mapa__tooltip-title">${nome}</span>
            <span class="mapa__tooltip-value num">${(v * 100).toFixed(1)}</span>
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
          map.setFeatureState(
            { source: SOURCE_ID, id: hoveredId },
            { hover: false },
          )
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
  }, [geo, valores])

  const histogram = useMemo(() => buildHistogram(valores), [valores])
  const histMax = Math.max(1, ...histogram)

  const handleZoomIn = () => mapRef.current?.zoomIn()
  const handleZoomOut = () => mapRef.current?.zoomOut()
  const handleRecenter = () => {
    mapRef.current?.flyTo({ center: RN_CENTER, zoom: RN_ZOOM, essential: true })
  }

  return (
    <div className="mapa">
      <PublicTopBar active="mapa" />

      <div className="mapa__body">
        <aside className="mapa__sidebar">
          <span className="h-eyebrow">Indicador</span>
          <div className="mapa__indicadores">
            {INDICADORES_PUBLICOS.map((i) => {
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
                    {i.codigo} · {i.base}
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
                    COLOR_SCALE[Math.min(COLOR_SCALE.length - 1, Math.floor((i / histogram.length) * COLOR_SCALE.length))],
                }}
              />
            ))}
          </div>
          <div className="mapa__hist-eixo num">
            <span>0,0{indicador.unidade}</span>
            <span>100,0{indicador.unidade}</span>
          </div>

          <div className="mapa__sobre">
            <span className="h-eyebrow">Sobre o indicador</span>
            <p className="mapa__sobre-desc">{indicador.desc}</p>
            <div className="mapa__sobre-chips">
              <span className="chip">{indicador.categoria}</span>
              <span className="chip">unid. {indicador.unidade || '—'}</span>
            </div>
          </div>
        </aside>

        <main className="mapa__main">
          <header className="mapa__header">
            <div>
              <span className="h-eyebrow">
                {indicador.codigo} · {ano}
              </span>
              <h2 className="h-display mapa__title">{indicador.nome}</h2>
            </div>
            <div className="mapa__actions">
              <Legend scale={COLOR_SCALE} min={0} max={100} unit={indicador.unidade} />
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
                Carregando municípios…
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
