import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { getTeamColor } from '../lib/teamColors'
import { formatLapTime } from '../lib/utils'

const BASE_URL = 'https://api.openf1.org/v1'

// Japan 2026 session keys
const JAPAN_SESSIONS = [
  { key: 11246, label: 'FP1', name: 'Practice 1', type: 'Practice' },
  { key: 11247, label: 'FP2', name: 'Practice 2', type: 'Practice' },
  { key: 11248, label: 'FP3', name: 'Practice 3', type: 'Practice' },
  { key: 11249, label: 'QUALI', name: 'Qualifying', type: 'Qualifying' },
  { key: 11253, label: 'RACE', name: 'Race', type: 'Race' },
]

interface Driver {
  driver_number: number
  name_acronym: string
  full_name: string
  team_name: string
  team_colour: string
}

interface Lap {
  driver_number: number
  lap_number: number
  lap_duration: number | null
  is_pit_out_lap: boolean
  duration_sector_1: number | null
  duration_sector_2: number | null
  duration_sector_3: number | null
}

interface Position {
  driver_number: number
  position: number
  date: string
}

interface DriverResult {
  driver_number: number
  name_acronym: string
  full_name: string
  team_name: string
  position: number
  bestLap: number | null
  fastestLap: boolean
}

async function fetchDrivers(sessionKey: number): Promise<Driver[]> {
  try {
    const r = await axios.get(`${BASE_URL}/drivers`, { params: { session_key: sessionKey }, timeout: 10000 })
    return r.data as Driver[]
  } catch { return [] }
}

async function fetchBestLaps(sessionKey: number): Promise<Map<number, number>> {
  try {
    const r = await axios.get(`${BASE_URL}/laps`, { params: { session_key: sessionKey }, timeout: 15000 })
    const laps = r.data as Lap[]
    const bestMap = new Map<number, number>()
    for (const lap of laps) {
      if (!lap.lap_duration || lap.is_pit_out_lap) continue
      const existing = bestMap.get(lap.driver_number)
      if (!existing || lap.lap_duration < existing) {
        bestMap.set(lap.driver_number, lap.lap_duration)
      }
    }
    return bestMap
  } catch { return new Map() }
}

async function fetchFinalPositions(sessionKey: number): Promise<Map<number, number>> {
  try {
    const r = await axios.get(`${BASE_URL}/position`, { params: { session_key: sessionKey }, timeout: 15000 })
    const positions = r.data as Position[]
    // Get last position entry per driver
    const posMap = new Map<number, { position: number; date: string }>()
    for (const pos of positions) {
      const existing = posMap.get(pos.driver_number)
      if (!existing || pos.date > existing.date) {
        posMap.set(pos.driver_number, { position: pos.position, date: pos.date })
      }
    }
    const result = new Map<number, number>()
    posMap.forEach((val, key) => result.set(key, val.position))
    return result
  } catch { return new Map() }
}

function SessionResults({ sessionKey, sessionType }: { sessionKey: number; sessionType: string }) {
  const [results, setResults] = useState<DriverResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [dataAvailable, setDataAvailable] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(false)
      try {
        const [drivers, bestLaps, positions] = await Promise.all([
          fetchDrivers(sessionKey),
          fetchBestLaps(sessionKey),
          fetchFinalPositions(sessionKey),
        ])

        if (drivers.length === 0) {
          setDataAvailable(false)
          setLoading(false)
          return
        }

        // Find overall fastest lap
        let overallBest: number | null = null
        bestLaps.forEach(v => {
          if (overallBest === null || v < overallBest) overallBest = v
        })

        const mapped: DriverResult[] = drivers.map(d => ({
          driver_number: d.driver_number,
          name_acronym: d.name_acronym,
          full_name: d.full_name,
          team_name: d.team_name,
          position: positions.get(d.driver_number) ?? 99,
          bestLap: bestLaps.get(d.driver_number) ?? null,
          fastestLap: bestLaps.get(d.driver_number) === overallBest && overallBest !== null,
        }))

        mapped.sort((a, b) => {
          // Sort by best lap time if positions all equal, else by position
          if (a.position !== b.position) return a.position - b.position
          if (a.bestLap && b.bestLap) return a.bestLap - b.bestLap
          if (a.bestLap) return -1
          if (b.bestLap) return 1
          return 0
        })

        setResults(mapped)
      } catch {
        setError(true)
      }
      setLoading(false)
    }
    load()
  }, [sessionKey])

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#555', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' }}>
        Loading session data…
      </div>
    )
  }

  if (error || !dataAvailable || results.length === 0) {
    return (
      <div style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        backgroundColor: '#111111',
        border: '1px solid #1A1A1A',
        borderRadius: '4px',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#555' }}>
          {sessionType === 'Race' ? 'Race hasn\'t started yet' : 'Session data not available yet'}
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#333', marginTop: '0.25rem' }}>
          Check back during or after the session
        </div>
      </div>
    )
  }

  // Re-rank by best lap for practice/quali if positions all same
  const allSamePos = results.every(r => r.position === results[0].position)
  const displayResults = allSamePos
    ? [...results].sort((a, b) => {
        if (a.bestLap && b.bestLap) return a.bestLap - b.bestLap
        if (a.bestLap) return -1
        if (b.bestLap) return 1
        return 0
      })
    : results

  const p1Time = displayResults[0]?.bestLap ?? null

  return (
    <div>
      {/* Header row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '40px 60px 1fr 140px 110px 110px',
        padding: '0.4rem 0.75rem',
        borderBottom: '1px solid #1A1A1A',
        gap: '0.5rem',
      }}>
        {['P', 'DRV', 'NAME', 'TEAM', 'BEST LAP', 'GAP'].map(h => (
          <div key={h} style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.6rem',
            color: '#444',
            fontWeight: 600,
            letterSpacing: '0.1em',
          }}>{h}</div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {displayResults.map((result, idx) => {
          const teamColor = getTeamColor(result.team_name)
          const gap = p1Time && result.bestLap ? result.bestLap - p1Time : null
          return (
            <motion.div
              key={result.driver_number}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 60px 1fr 140px 110px 110px',
                padding: '0.625rem 0.75rem',
                borderBottom: '1px solid #1A1A1A',
                gap: '0.5rem',
                alignItems: 'center',
                borderLeft: `3px solid ${teamColor}`,
              }}
            >
              {/* Position */}
              <div style={{
                fontFamily: '"Bebas Neue", cursive',
                fontSize: '1.25rem',
                color: idx === 0 ? '#F0F0F0' : '#666',
                lineHeight: 1,
              }}>
                {idx + 1}
              </div>

              {/* Acronym */}
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#F0F0F0',
                letterSpacing: '0.05em',
              }}>
                {result.name_acronym}
              </div>

              {/* Full name */}
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.75rem',
                color: '#888',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {result.full_name}
              </div>

              {/* Team */}
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.7rem',
                color: teamColor,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {result.team_name}
              </div>

              {/* Best lap */}
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: result.fastestLap ? '#A855F7' : idx === 0 ? '#22C55E' : '#F0F0F0',
                letterSpacing: '0.02em',
              }}>
                {result.bestLap ? formatLapTime(result.bestLap) : '—'}
                {result.fastestLap && <span style={{ fontSize: '0.6rem', marginLeft: '4px' }}>⚡</span>}
              </div>

              {/* Gap */}
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.75rem',
                color: idx === 0 ? '#555' : '#888',
              }}>
                {idx === 0 ? 'LEADER' : gap ? `+${gap.toFixed(3)}` : '—'}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const [activeSession, setActiveSession] = useState(0)

  const session = JAPAN_SESSIONS[activeSession]

  return (
    <div>
      <h2 style={{
        fontFamily: '"Bebas Neue", cursive',
        fontSize: '2rem',
        color: '#F0F0F0',
        margin: '0 0 1rem 0',
        letterSpacing: '0.05em',
      }}>
        🇯🇵 SESSION RESULTS
      </h2>

      {/* Session tabs */}
      <div style={{
        display: 'flex',
        gap: '0',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #2A2A2A',
        overflowX: 'auto',
      }}>
        {JAPAN_SESSIONS.map((s, idx) => (
          <button
            key={s.key}
            onClick={() => setActiveSession(idx)}
            style={{
              padding: '0.625rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeSession === idx ? '2px solid #E8002D' : '2px solid transparent',
              color: activeSession === idx ? '#F0F0F0' : '#555',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Session name */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: '1.25rem', color: '#888', letterSpacing: '0.08em' }}>
          {session.name} · Suzuka 2026
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '500px' }}>
          <SessionResults
            key={session.key}
            sessionKey={session.key}
            sessionType={session.type}
          />
        </div>
      </div>
    </div>
  )
}
