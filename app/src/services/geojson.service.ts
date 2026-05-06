const RN_GEOJSON_URL =
  'https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-24-mun.json'

export interface MunicipioFeatureProps {
  id: string
  name: string
  description?: string
}

export interface RNGeoJSON {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    id?: string | number
    properties: MunicipioFeatureProps & Record<string, unknown>
    geometry: GeoJSON.Geometry
  }>
}

export async function fetchRNMunicipiosGeoJSON(): Promise<RNGeoJSON> {
  const res = await fetch(RN_GEOJSON_URL)
  if (!res.ok) {
    throw new Error(`Falha ao carregar GeoJSON dos municípios (HTTP ${res.status})`)
  }
  return (await res.json()) as RNGeoJSON
}
