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
  "spa-francorchamps": [50.437, 5.971],
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
  temperature: number
  windSpeed: number
  precipProb: number
  weatherCode: number
}

interface WeatherWidgetProps {
  circuitShortName: string | null | undefined
}

export default function WeatherWidget({ circuitShortName }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null)

  useEffect(() => {
    if (!circuitShortName) return

    const key = circuitShortName.toLowerCase()
    const coords = CIRCUIT_COORDS[key]
    if (!coords) return

    const [lat, lon] = coords

    const load = async () => {
      try {
        const response = await axios.get(
          'https://api.open-meteo.com/v1/forecast',
          {
            params: {
              latitude: lat,
              longitude: lon,
              current: 'temperature_2m,precipitation_probability,wind_speed_10m,weather_code',
              timezone: 'auto',
            },
            timeout: 8000,
          }
        )
        const cur = response.data?.current
        if (cur) {
          setWeather({
            temperature: Math.round(cur.temperature_2m),
            windSpeed: Math.round(cur.wind_speed_10m),
            precipProb: cur.precipitation_probability ?? 0,
            weatherCode: cur.weather_code ?? 0,
          })
        }
      } catch (err) {
        console.warn('Weather fetch failed:', err)
      }
    }

    setWeather(null)
    load()
  }, [circuitShortName])

  if (!weather) return null

  return (
    <span
      style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.75rem',
        color: '#999',
      }}
    >
      {getWeatherEmoji(weather.weatherCode)} {weather.temperature}°C · 💨 {weather.windSpeed}km/h · 🌧 {weather.precipProb}%
    </span>
  )
}
