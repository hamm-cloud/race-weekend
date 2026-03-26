import { useState, useEffect } from 'react'
import axios from 'axios'

const CIRCUIT_COORDS: Record<string, [number, number]> = {
  "bahrain": [26.032, 50.511],
  "sakhir": [26.032, 50.511],
  "jeddah": [21.632, 39.104],
  "saudi arabia": [21.632, 39.104],
  "albert park": [-37.849, 144.968],
  "melbourne": [-37.849, 144.968],
  "shanghai": [31.338, 121.220],
  "china": [31.338, 121.220],
  "miami": [25.958, -80.239],
  "imola": [44.344, 11.714],
  "monaco": [43.737, 7.427],
  "barcelona": [41.570, 2.261],
  "spain": [41.570, 2.261],
  "montreal": [45.500, -73.522],
  "canada": [45.500, -73.522],
  "silverstone": [52.079, -1.017],
  "great britain": [52.079, -1.017],
  "hungaroring": [47.582, 19.251],
  "hungary": [47.582, 19.251],
  "spa": [50.437, 5.971],
  "monza": [45.619, 9.281],
  "italy": [45.619, 9.281],
  "baku": [40.373, 49.853],
  "azerbaijan": [40.373, 49.853],
  "singapore": [1.292, 103.864],
  "suzuka": [34.844, 136.541],
  "japan": [34.844, 136.541],
  "austin": [30.133, -97.641],
  "cota": [30.133, -97.641],
  "mexico city": [19.404, -99.091],
  "mexico": [19.404, -99.091],
  "sao paulo": [-23.701, -46.697],
  "brazil": [-23.701, -46.697],
  "las vegas": [36.272, -115.013],
  "abu dhabi": [24.471, 54.603],
  "yas marina": [24.471, 54.603],
  "zandvoort": [52.387, 4.541],
  "netherlands": [52.387, 4.541],
}

const WEATHER_EMOJIS: Record<number, string> = {
  0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️',
  45: '🌫', 48: '🌫',
  51: '🌦', 53: '🌦', 55: '🌧',
  61: '🌧', 63: '🌧', 65: '🌧',
  71: '❄️', 73: '❄️', 75: '❄️',
  80: '🌦', 81: '🌧', 82: '⛈',
  95: '⛈', 96: '⛈', 99: '⛈',
}

function getWeatherEmoji(code: number): string {
  return WEATHER_EMOJIS[code] ?? '🌡'
}

interface WeatherData {
  airTemp: number
  trackTemp?: number
  windSpeed: number
  humidity?: number
  precipProb: number
  weatherCode: number
  rainfall?: boolean
  source: 'openf1' | 'meteo'
}

interface OpenF1Weather {
  air_temperature: number
  track_temperature: number
  wind_speed: number
  humidity: number
  rainfall: boolean
  date: string
}

interface WeatherWidgetProps {
  circuitShortName: string | null | undefined
  sessionKey?: number | null
  expanded?: boolean
}

export default function WeatherWidget({ circuitShortName, sessionKey, expanded = false }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)

  useEffect(() => {
    // Try OpenF1 first if we have a session key
    const loadOpenF1 = async () => {
      if (!sessionKey) return false
      try {
        const r = await axios.get('https://api.openf1.org/v1/weather', {
          params: { session_key: sessionKey },
          timeout: 8000,
        })
        const data = r.data as OpenF1Weather[]
        if (data.length === 0) return false
        // Get latest
        const latest = data[data.length - 1]
        setWeather({
          airTemp: Math.round(latest.air_temperature),
          trackTemp: Math.round(latest.track_temperature),
          windSpeed: Math.round(latest.wind_speed * 3.6), // m/s to km/h
          humidity: Math.round(latest.humidity),
          precipProb: latest.rainfall ? 100 : 0,
          weatherCode: latest.rainfall ? 61 : 0,
          rainfall: latest.rainfall,
          source: 'openf1',
        })
        return true
      } catch {
        return false
      }
    }

    const loadMeteo = async () => {
      if (!circuitShortName) return
      const key = circuitShortName.toLowerCase()
      const coords = CIRCUIT_COORDS[key]
      if (!coords) return
      const [lat, lon] = coords
      try {
        const r = await axios.get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: lat,
            longitude: lon,
            current: 'temperature_2m,precipitation_probability,wind_speed_10m,weather_code,relative_humidity_2m',
            timezone: 'auto',
          },
          timeout: 8000,
        })
        const cur = r.data?.current
        if (cur) {
          setWeather({
            airTemp: Math.round(cur.temperature_2m),
            windSpeed: Math.round(cur.wind_speed_10m),
            precipProb: cur.precipitation_probability ?? 0,
            weatherCode: cur.weather_code ?? 0,
            humidity: cur.relative_humidity_2m,
            rainfall: (cur.precipitation_probability ?? 0) > 50,
            source: 'meteo',
          })
        }
      } catch {
        console.warn('Weather fetch failed')
      }
    }

    setWeather(null)
    const load = async () => {
      const got = await loadOpenF1()
      if (!got) await loadMeteo()
    }
    load()
  }, [circuitShortName, sessionKey])

  if (!weather) return null

  if (!expanded) {
    return (
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#999' }}>
        {getWeatherEmoji(weather.weatherCode)} {weather.airTemp}°C
        {weather.trackTemp ? ` · track ${weather.trackTemp}°C` : ''}
        {' '}· 💨 {weather.windSpeed}km/h
        {weather.humidity ? ` · 💧 ${weather.humidity}%` : ` · 🌧 ${weather.precipProb}%`}
        {weather.rainfall ? ' · 🌧 RAIN' : ''}
      </span>
    )
  }

  // Expanded weather card
  return (
    <div style={{
      display: 'flex',
      gap: '1.5rem',
      padding: '0.75rem 1rem',
      backgroundColor: '#0D0D0D',
      border: '1px solid #1A1A1A',
      borderRadius: '4px',
      flexWrap: 'wrap',
      marginTop: '0.5rem',
    }}>
      {[
        { label: 'AIR', value: `${weather.airTemp}°C`, icon: '🌡' },
        ...(weather.trackTemp ? [{ label: 'TRACK', value: `${weather.trackTemp}°C`, icon: '🏁' }] : []),
        { label: 'WIND', value: `${weather.windSpeed} km/h`, icon: '💨' },
        ...(weather.humidity ? [{ label: 'HUMIDITY', value: `${weather.humidity}%`, icon: '💧' }] : []),
        { label: 'RAIN', value: weather.rainfall ? 'YES' : `${weather.precipProb}%`, icon: '🌧', alert: weather.rainfall },
      ].map(item => (
        <div key={item.label}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', color: '#444', letterSpacing: '0.1em', marginBottom: '2px' }}>
            {item.label}
          </div>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: (item as { alert?: boolean }).alert ? '#E8002D' : '#F0F0F0',
          }}>
            {item.icon} {item.value}
          </div>
        </div>
      ))}
      <div style={{ marginLeft: 'auto', fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', color: '#333', alignSelf: 'flex-end' }}>
        {weather.source === 'openf1' ? 'via OpenF1' : 'via Open-Meteo'}
      </div>
    </div>
  )
}
