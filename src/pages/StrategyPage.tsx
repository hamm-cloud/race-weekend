import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { getTeamColor } from '../lib/teamColors'
import type { Session } from '../hooks/useOpenF1'

const BASE_URL = 'https://api.openf1.org/v1'

// Japan 2026 session keys
const JAPAN_SESSIONS = [
  { key: 11249, label: 'QUALI', name: 'Qualifying' },
  { key: 11253, label: 'RACE', name: 'Race' },
]

interface Stint {
  driver_number: number
  stint_number: number
  lap_start: number
  lap_end: number | null
  compound: string
  tyre_age_at_start: number
}

interface Driver {
  driver_number: number
  name_acronym: string
  full_name: string
  team_name: string
}

const COMPOUND_COLORS: Record<string, string> = {
  SOFT: '#E8002D',
  MEDIUM: '#F5C400',
  HARD: '#F0F0F0',
  INTERMEDIATE: '#39B54A',
  WET: '#0067FF',
  UNKNOWN: '#666666',
}

const COMPOUND_SHORT: Record<string, string> = {
  SOFT: 'S',
  MEDIUM: 'M',
  HARD: 'H',
  INTERMEDIATE: 'I',
  WET: 'W',
  UNKNOWN: '?',
}

function TyreChip({ compound, laps }: { compound: string; laps: number }) {
  const color = COMPOUND_COLORS[compound] ?? '#666'
  const short = COMPOUND_SHORT[compound] ?? '?'
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      backgroundColor: '#1A1A1A',
      border: `1px solid ${color}`,
      borderRadius: '3px',
      padding: '2px 6px',
    }}>
      <div style={{
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '9px',
        fontWeight: 700,
        color: compound === 'HARD' ? '#000' : '#fff',
        fontFamily: 'Inter, sans-serif',
        flexShrink: 0,
      }}>
        {short}
      </div>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#888' }}>
        {laps} laps
      </span>
    </div>
  )
}

interface StintTimelineProps {
  stints: Stint[]
  totalLaps: number
}

function StintTimeline({ stints, totalLaps }: StintTimelineProps) {
  if (stints.length === 0) return null
  const maxLap = Math.max(totalLaps, ...stints.map(s => s.lap_end ?? s.lap_start + 1))

  return (
    <div style={{ display: 'flex', height: '12px', borderRadius: '2px', overflow: 'hidden', gap: '1px' }}>
      {stints.map((stint, i) => {
        const lapEnd = stint.lap_end ?? maxLap
        const width = ((lapEnd - stint.lap_start + 1) / maxLap) * 100
        const color = COMPOUND_COLORS[stint.compound] ?? '#666'
        return (
          <div
            key={i}
            title={`Lap ${stint.lap_start}–${lapEnd}: ${stint.compound} (${stint.tyre_age_at_start}+${lapEnd - stint.lap_start + 1} laps)`}
            style={{
              width: `${width}%`,
              backgroundColor: color,
              opacity: 0.85,
              minWidth: '6px',
            }}
          />
        )
      })}
    </div>
  )
}

async function fetchDrivers(sessionKey: number): Promise<Driver[]> {
  try {
    const r = await axios.get(`${BASE_URL}/drivers`, { params: { session_key: sessionKey }, timeout: 10000 })
    return r.data as Driver[]
  } catch { return [] }
}

async function fetchStints(sessionKey: number): Promise<Stint[]> {
  try {
    const r = await axios.get(`${BASE_URL}/stints`, { params: { session_key: sessionKey }, timeout: 15000 })
    return r.data as Stint[]
  } catch { return [] }
}

interface DriverStrategy {
  driver: Driver
  stints: Stint[]
  currentStint: Stint | null
  tyreAge: number
}

function SessionStrategy({ sessionKey, isRace }: { sessionKey: number; isRace: boolean }) {
  const [data, setData] = useState<DriverStrategy[]>([])
  const [loading, setLoading] = useState(true)
  const [totalLaps] = useState(53) // Suzuka race laps

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [drivers, stints] = await Promise.all([
        fetchDrivers(sessionKey),
        fetchStints(sessionKey),
      ])

      if (drivers.length === 0) {
        setLoading(false)
        return
      }

      const stintsByDriver = new Map<number, Stint[]>()
      for (const stint of stints) {
        if (!stintsByDriver.has(stint.driver_number)) {
          stintsByDriver.set(stint.driver_number, [])
        }
        stintsByDriver.get(stint.driver_number)!.push(stint)
      }

      // Sort stints by stint_number
      stintsByDriver.forEach(s => s.sort((a, b) => a.stint_number - b.stint_number))

      const strategies: DriverStrategy[] = drivers.map(d => {
        const driverStints = stintsByDriver.get(d.driver_number) ?? []
        const currentStint = driverStints.length > 0 ? driverStints[driverStints.length - 1] : null
        const tyreAge = currentStint
          ? (currentStint.tyre_age_at_start + (currentStint.lap_end ? currentStint.lap_end - currentStint.lap_start : 0))
          : 0

        return { driver: d, stints: driverStints, currentStint, tyreAge }
      })

      // Sort by number of stints desc, then by driver number
      strategies.sort((a, b) => {
        if (b.stints.length !== a.stints.length) return b.stints.length - a.stints.length
        return a.driver.driver_number - b.driver.driver_number
      })

      setData(strategies)
      setLoading(false)
    }

    load()

    // Poll during live sessions
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [sessionKey])

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#555', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' }}>Loading strategy data…</div>
  }

  if (data.length === 0 || data.every(d => d.stints.length === 0)) {
    return (
      <div style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: '#111111', border: '1px solid #1A1A1A', borderRadius: '4px' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔄</div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#555' }}>
          {isRace ? 'Race strategy data not available yet' : 'No stint data for this session'}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {Object.entries(COMPOUND_COLORS).filter(([k]) => k !== 'UNKNOWN').map(([compound, color]) => (
          <div key={compound} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#666' }}>{compound}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {data.map((strategy, idx) => {
          const teamColor = getTeamColor(strategy.driver.team_name)
          const currentCompound = strategy.currentStint?.compound ?? null
          const compoundColor = currentCompound ? (COMPOUND_COLORS[currentCompound] ?? '#666') : '#666'

          return (
            <motion.div
              key={strategy.driver.driver_number}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
              style={{
                backgroundColor: '#111111',
                border: '1px solid #1A1A1A',
                borderLeft: `3px solid ${teamColor}`,
                borderRadius: '4px',
                padding: '0.75rem 1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                {/* Driver */}
                <div style={{ minWidth: '40px' }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: '#F0F0F0' }}>
                    {strategy.driver.name_acronym}
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#555' }}>
                    #{strategy.driver.driver_number}
                  </div>
                </div>

                {/* Team */}
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: teamColor, minWidth: '120px' }}>
                  {strategy.driver.team_name}
                </div>

                {/* Current tyre */}
                {currentCompound && isRace && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      backgroundColor: compoundColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 700, color: currentCompound === 'HARD' ? '#000' : '#fff',
                      fontFamily: 'Inter, sans-serif',
                    }}>
                      {COMPOUND_SHORT[currentCompound] ?? '?'}
                    </div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#888' }}>
                      {strategy.tyreAge} laps
                    </span>
                  </div>
                )}

                {/* Stint chips for quali/practice */}
                {!isRace && strategy.stints.map(stint => (
                  <TyreChip
                    key={stint.stint_number}
                    compound={stint.compound}
                    laps={stint.tyre_age_at_start}
                  />
                ))}

                {/* Stop count */}
                {isRace && strategy.stints.length > 1 && (
                  <span style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#888',
                    backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A',
                    padding: '0.15rem 0.4rem', borderRadius: '2px',
                  }}>
                    {strategy.stints.length - 1} STOP{strategy.stints.length - 1 > 1 ? 'S' : ''}
                  </span>
                )}
              </div>

              {/* Timeline for race */}
              {isRace && strategy.stints.length > 0 && (
                <StintTimeline stints={strategy.stints} totalLaps={totalLaps} />
              )}

              {/* Stint labels for race */}
              {isRace && strategy.stints.length > 0 && (
                <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.375rem', flexWrap: 'wrap' }}>
                  {strategy.stints.map(stint => (
                    <div key={stint.stint_number} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <div style={{
                        width: '12px', height: '12px', borderRadius: '50%',
                        backgroundColor: COMPOUND_COLORS[stint.compound] ?? '#666',
                        flexShrink: 0,
                      }} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#666' }}>
                        L{stint.lap_start}–{stint.lap_end ?? '?'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

interface StrategyPageProps {
  session: Session | null
}

export default function StrategyPage({ session: _session }: StrategyPageProps) {
  const [activeIdx, setActiveIdx] = useState(1) // Default to Race

  const activeSession = JAPAN_SESSIONS[activeIdx]

  return (
    <div>
      <h2 style={{
        fontFamily: '"Bebas Neue", cursive',
        fontSize: '2rem',
        color: '#F0F0F0',
        margin: '0 0 1rem 0',
        letterSpacing: '0.05em',
      }}>
        🔄 TYRE STRATEGY
      </h2>

      {/* Session tabs */}
      <div style={{
        display: 'flex',
        gap: '0',
        marginBottom: '1.5rem',
        borderBottom: '1px solid #2A2A2A',
      }}>
        {JAPAN_SESSIONS.map((s, idx) => (
          <button
            key={s.key}
            onClick={() => setActiveIdx(idx)}
            style={{
              padding: '0.625rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeIdx === idx ? '2px solid #E8002D' : '2px solid transparent',
              color: activeIdx === idx ? '#F0F0F0' : '#555',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: '1.25rem', color: '#888', letterSpacing: '0.08em' }}>
          {activeSession.name} · Suzuka 2026
        </div>
      </div>

      <SessionStrategy
        key={activeSession.key}
        sessionKey={activeSession.key}
        isRace={activeSession.label === 'RACE'}
      />
    </div>
  )
}
