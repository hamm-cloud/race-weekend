import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import type { Driver } from './useOpenF1'

export interface TeamRadioMessage {
  meeting_key: number
  session_key: number
  driver_number: number
  date: string
  recording_url: string
}

const FALLBACK_SESSION_KEY = 9158
const FALLBACK_DRIVER_NUMBERS = [1, 4, 11, 14, 16, 44, 55, 63]

async function fetchRadioForDriver(sessionKey: number, driverNumber: number): Promise<TeamRadioMessage[]> {
  try {
    const response = await axios.get<TeamRadioMessage[]>('https://api.openf1.org/v1/team_radio', {
      params: { session_key: sessionKey, driver_number: driverNumber },
      timeout: 10000,
    })
    return response.data
  } catch {
    return []
  }
}

async function fetchAllRadio(sessionKey: number, driverNumbers: number[]): Promise<TeamRadioMessage[]> {
  const results = await Promise.all(
    driverNumbers.map(num => fetchRadioForDriver(sessionKey, num))
  )
  const all: TeamRadioMessage[] = results.flat()

  // Deduplicate by recording_url
  const seen = new Set<string>()
  const deduped: TeamRadioMessage[] = []
  for (const msg of all) {
    if (!seen.has(msg.recording_url)) {
      seen.add(msg.recording_url)
      deduped.push(msg)
    }
  }

  return deduped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function useTeamRadio(
  sessionKey: number | null,
  drivers: Driver[],
  pollInterval: number
): { messages: TeamRadioMessage[]; loading: boolean; isFallback: boolean } {
  const [messages, setMessages] = useState<TeamRadioMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [isFallback, setIsFallback] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    // Try the real session first (if we have one and drivers)
    if (sessionKey && drivers.length > 0) {
      const driverNumbers = drivers.map(d => d.driver_number)
      const result = await fetchAllRadio(sessionKey, driverNumbers)
      if (result.length > 0) {
        setMessages(result)
        setIsFallback(false)
        return
      }
    }

    // Fallback to Singapore 2023 FP1 demo data
    const fallback = await fetchAllRadio(FALLBACK_SESSION_KEY, FALLBACK_DRIVER_NUMBERS)
    setMessages(fallback)
    setIsFallback(true)
  }, [sessionKey, drivers])

  useEffect(() => {
    setLoading(true)
    load().finally(() => setLoading(false))

    timerRef.current = setInterval(load, pollInterval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [load, pollInterval])

  return { messages, loading, isFallback }
}
