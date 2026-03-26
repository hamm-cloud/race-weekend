import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Japan 2026 schedule - all times in UTC then displayed as AEST (UTC+10)
// FP1: Thu Mar 27, 02:30 UTC = 12:30 AEST
// FP2: Thu Mar 27, 06:00 UTC = 16:00 AEST
// FP3: Fri Mar 28, 02:30 UTC = 12:30 AEST
// Q:   Fri Mar 28, 06:00 UTC = 16:00 AEST
// Race: Sat Mar 29, 05:00 UTC = 15:00 AEST

interface SessionInfo {
  key: number
  name: string
  type: string
  startUTC: string // ISO UTC
  endUTC: string
  label: string
  color: string
}

const JAPAN_SESSIONS: SessionInfo[] = [
  { key: 11246, name: 'Practice 1', type: 'Practice', startUTC: '2026-03-27T02:30:00Z', endUTC: '2026-03-27T03:30:00Z', label: 'FP1', color: '#666666' },
  { key: 11247, name: 'Practice 2', type: 'Practice', startUTC: '2026-03-27T06:00:00Z', endUTC: '2026-03-27T07:00:00Z', label: 'FP2', color: '#666666' },
  { key: 11248, name: 'Practice 3', type: 'Practice', startUTC: '2026-03-28T02:30:00Z', endUTC: '2026-03-28T03:30:00Z', label: 'FP3', color: '#666666' },
  { key: 11249, name: 'Qualifying', type: 'Qualifying', startUTC: '2026-03-28T06:00:00Z', endUTC: '2026-03-28T07:00:00Z', label: 'QUALI', color: '#9B59B6' },
  { key: 11253, name: 'Race', type: 'Race', startUTC: '2026-03-29T05:00:00Z', endUTC: '2026-03-29T07:00:00Z', label: 'RACE', color: '#E8002D' },
]

function formatAEST(utcStr: string): string {
  const d = new Date(utcStr)
  // AEST = UTC+10
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Australia/Brisbane',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }
  return d.toLocaleString('en-AU', options) + ' AEST'
}

function formatTimeOnly(utcStr: string): string {
  const d = new Date(utcStr)
  return d.toLocaleString('en-AU', {
    timeZone: 'Australia/Brisbane',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function formatJST(utcStr: string): string {
  const d = new Date(utcStr)
  return d.toLocaleString('en-AU', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }) + ' JST'
}

function formatCountdown(targetUTC: string): string {
  const now = new Date()
  const target = new Date(targetUTC)
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return 'Started'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (days > 0) return `${days}d ${hours}h ${mins}m`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

function getSessionStatus(session: SessionInfo): 'past' | 'live' | 'upcoming' | 'next' {
  const now = new Date()
  const start = new Date(session.startUTC)
  const end = new Date(session.endUTC)
  if (now >= start && now <= end) return 'live'
  if (now > end) return 'past'
  return 'upcoming'
}

export default function SchedulePage() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Find next upcoming session
  const nextSessionIdx = JAPAN_SESSIONS.findIndex(s => new Date(s.startUTC) > now)

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2
          style={{
            fontFamily: '"Bebas Neue", cursive',
            fontSize: '2rem',
            color: '#F0F0F0',
            margin: '0 0 0.25rem 0',
            letterSpacing: '0.05em',
          }}
        >
          🇯🇵 JAPANESE GRAND PRIX
        </h2>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#666' }}>
          Suzuka International Racing Course · Round 3, 2026
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {JAPAN_SESSIONS.map((session, idx) => {
          const status = getSessionStatus(session)
          const isNext = status === 'upcoming' && idx === nextSessionIdx
          const isPast = status === 'past'
          const isLive = status === 'live'

          return (
            <motion.div
              key={session.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              style={{
                backgroundColor: isPast ? '#0D0D0D' : '#111111',
                border: '1px solid',
                borderColor: isLive ? session.color : isPast ? '#1A1A1A' : '#2A2A2A',
                borderLeft: `3px solid ${isLive ? session.color : isPast ? '#333' : isNext ? session.color : '#2A2A2A'}`,
                borderRadius: '4px',
                padding: '1rem 1.25rem',
                opacity: isPast ? 0.6 : 1,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Live pulse */}
              {isLive && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, ${session.color}, transparent)`,
                }} />
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                    {/* Badge */}
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: '#000',
                      backgroundColor: session.color,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '2px',
                      letterSpacing: '0.08em',
                    }}>
                      {session.label}
                    </span>

                    {/* Session name */}
                    <span style={{
                      fontFamily: '"Bebas Neue", cursive',
                      fontSize: '1.25rem',
                      color: isPast ? '#555' : '#F0F0F0',
                      letterSpacing: '0.05em',
                    }}>
                      {session.name}
                    </span>

                    {/* Live badge */}
                    {isLive && (
                      <span style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        color: '#fff',
                        backgroundColor: '#E8002D',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '2px',
                        letterSpacing: '0.1em',
                        animation: 'pulse 1.5s infinite',
                      }}>
                        🔴 LIVE NOW
                      </span>
                    )}

                    {/* Next badge */}
                    {isNext && !isLive && (
                      <span style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        color: session.color,
                        border: `1px solid ${session.color}`,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '2px',
                        letterSpacing: '0.08em',
                      }}>
                        NEXT
                      </span>
                    )}

                    {/* Past badge */}
                    {isPast && (
                      <span style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.65rem',
                        color: '#444',
                        letterSpacing: '0.05em',
                      }}>
                        COMPLETED
                      </span>
                    )}
                  </div>

                  {/* Times */}
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#888', marginBottom: '1px' }}>
                        AEST (Brisbane)
                      </div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: isPast ? '#555' : '#F0F0F0' }}>
                        {formatAEST(session.startUTC)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: '#888', marginBottom: '1px' }}>
                        JST (Suzuka)
                      </div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', color: '#666' }}>
                        {formatJST(session.startUTC)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Countdown / Time */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {isLive ? (
                    <div>
                      <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: '1.5rem', color: session.color, letterSpacing: '0.05em' }}>
                        IN PROGRESS
                      </div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#666' }}>
                        ends {formatTimeOnly(session.endUTC)} AEST
                      </div>
                    </div>
                  ) : isPast ? (
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#444' }}>
                      ✓ Done
                    </div>
                  ) : (
                    <div>
                      <div
                        style={{
                          fontFamily: '"Bebas Neue", cursive',
                          fontSize: '1.75rem',
                          color: isNext ? session.color : '#555',
                          letterSpacing: '0.05em',
                          lineHeight: 1,
                        }}
                      >
                        {formatCountdown(session.startUTC)}
                      </div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', color: '#444', letterSpacing: '0.08em', marginTop: '2px' }}>
                        TO START
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Race info footer */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: '#0D0D0D',
        border: '1px solid #1A1A1A',
        borderRadius: '4px',
      }}>
        <div style={{ fontFamily: '"Bebas Neue", cursive', fontSize: '1rem', color: '#444', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          CIRCUIT INFO
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {[
            ['Circuit', 'Suzuka International Racing Course'],
            ['Laps', '53'],
            ['Distance', '307.471 km'],
            ['Lap Record', '1:30.983 (Leclerc, 2019)'],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#444', letterSpacing: '0.08em' }}>{label}</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#888', marginTop: '1px' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
