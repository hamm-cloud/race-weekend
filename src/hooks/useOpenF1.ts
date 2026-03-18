import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'

const BASE_URL = 'https://api.openf1.org/v1'

export interface Session {
  session_key: number
  session_name: string
  session_type: string
  date_start: string
  date_end: string
  gmt_offset: string
  circuit_key: number
  circuit_short_name: string
  country_name: string
  country_key: number
  country_code: string
  location: string
  meeting_name: string
  meeting_key: number
  year: number
}

export interface Driver {
  driver_number: number
  broadcast_name: string
  full_name: string
  name_acronym: string
  team_name: string
  team_colour: string
  country_code: string
  headshot_url: string
  session_key: number
}

export interface Position {
  driver_number: number
  date: string
  meeting_key: number
  session_key: number
  position: number
  x: number
  y: number
  z: number
}

export interface Interval {
  driver_number: number
  date: string
  meeting_key: number
  session_key: number
  gap_to_leader: number | null
  interval: number | null
}

export interface Lap {
  driver_number: number
  lap_number: number
  lap_duration: number | null
  i1_speed: number | null
  i2_speed: number | null
  st_speed: number | null
  date_start: string
  duration_sector_1: number | null
  duration_sector_2: number | null
  duration_sector_3: number | null
  is_pit_out_lap: boolean
  meeting_key: number
  session_key: number
  segments_sector_1: number[] | null
  segments_sector_2: number[] | null
  segments_sector_3: number[] | null
}

export interface Stint {
  driver_number: number
  stint_number: number
  lap_start: number
  lap_end: number
  compound: string
  tyre_age_at_start: number
  meeting_key: number
  session_key: number
}

async function fetchFromAPI<T>(endpoint: string, params?: Record<string, string | number>): Promise<T[]> {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params,
      timeout: 10000,
    })
    return response.data as T[]
  } catch (err) {
    console.warn(`OpenF1 API error for ${endpoint}:`, err)
    return []
  }
}

export function useLatestSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await fetchFromAPI<Session>('/sessions', { session_key: 'latest' })
      if (data.length > 0) {
        setSession(data[data.length - 1])
      }
      setLoading(false)
    }
    load()
  }, [])

  const isLive = session ? new Date(session.date_start) <= new Date() && new Date(session.date_end) >= new Date() : false

  return { session, loading, isLive }
}

export function useSessions(year: number) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await fetchFromAPI<Session>('/sessions', { year })
      setSessions(data)
      setLoading(false)
    }
    load()
  }, [year])

  return { sessions, loading }
}

export function useDrivers(sessionKey: number | null) {
  const [drivers, setDrivers] = useState<Driver[]>([])

  useEffect(() => {
    if (!sessionKey) return
    const load = async () => {
      const data = await fetchFromAPI<Driver>('/drivers', { session_key: sessionKey })
      setDrivers(data)
    }
    load()
  }, [sessionKey])

  return drivers
}

export function useTimingData(sessionKey: number | null, pollInterval: number = 5000) {
  const [intervals, setIntervals] = useState<Map<number, Interval>>(new Map())
  const [lastLaps, setLastLaps] = useState<Map<number, Lap>>(new Map())
  const [stints, setStints] = useState<Map<number, Stint>>(new Map())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    if (!sessionKey) return

    // Fetch latest intervals
    const intervalData = await fetchFromAPI<Interval>('/intervals', { session_key: sessionKey })
    const intervalMap = new Map<number, Interval>()
    for (const iv of intervalData) {
      const existing = intervalMap.get(iv.driver_number)
      if (!existing || new Date(iv.date) > new Date(existing.date)) {
        intervalMap.set(iv.driver_number, iv)
      }
    }
    if (intervalMap.size > 0) setIntervals(intervalMap)

    // Fetch latest laps
    const lapData = await fetchFromAPI<Lap>('/laps', { session_key: sessionKey })
    const lapMap = new Map<number, Lap>()
    for (const lap of lapData) {
      if (lap.lap_duration == null) continue
      const existing = lapMap.get(lap.driver_number)
      if (!existing || lap.lap_number > existing.lap_number) {
        lapMap.set(lap.driver_number, lap)
      }
    }
    if (lapMap.size > 0) setLastLaps(lapMap)

    // Fetch stints for tyre info
    const stintData = await fetchFromAPI<Stint>('/stints', { session_key: sessionKey })
    const stintMap = new Map<number, Stint>()
    for (const stint of stintData) {
      const existing = stintMap.get(stint.driver_number)
      if (!existing || stint.stint_number > existing.stint_number) {
        stintMap.set(stint.driver_number, stint)
      }
    }
    if (stintMap.size > 0) setStints(stintMap)

  }, [sessionKey])

  useEffect(() => {
    if (!sessionKey) return
    fetchData()
    timerRef.current = setInterval(fetchData, pollInterval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [sessionKey, fetchData, pollInterval])

  return { intervals, lastLaps, stints }
}

export function useCarPositions(sessionKey: number | null, pollInterval: number = 2000) {
  const [carPositions, setCarPositions] = useState<Map<number, { x: number; y: number }>>(new Map())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchPositions = useCallback(async () => {
    if (!sessionKey) return

    const data = await fetchFromAPI<Position>('/location', { session_key: sessionKey })
    const posMap = new Map<number, { x: number; y: number; date: string }>()

    for (const pos of data) {
      const existing = posMap.get(pos.driver_number)
      if (!existing || new Date(pos.date) > new Date(existing.date)) {
        posMap.set(pos.driver_number, { x: pos.x, y: pos.y, date: pos.date })
      }
    }

    if (posMap.size > 0) {
      const cleanMap = new Map<number, { x: number; y: number }>()
      posMap.forEach((val, key) => {
        cleanMap.set(key, { x: val.x, y: val.y })
      })
      setCarPositions(cleanMap)
    }
  }, [sessionKey])

  useEffect(() => {
    if (!sessionKey) return
    fetchPositions()
    timerRef.current = setInterval(fetchPositions, pollInterval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [sessionKey, fetchPositions, pollInterval])

  return carPositions
}
