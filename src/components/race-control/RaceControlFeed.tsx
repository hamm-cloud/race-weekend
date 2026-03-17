import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import type { Session } from '../../hooks/useOpenF1'

interface RaceControlMessage {
  date: string
  category: string
  message: string
  flag: string | null
  scope: string | null
  sector: number | null
  driver_number: number | null
  lap_number: number | null
  meeting_key: number
  session_key: number
}

function getBadgeColor(category: string): string {
  switch (category) {
    case 'SafetyCar':
    case 'Safety Car':
      return '#FFD700'
    case 'VirtualSafetyCar':
    case 'Virtual Safety Car':
      return '#FFA500'
    case 'Flag':
      return '#E8002D'
    case 'Drs':
    case 'DRS':
      return '#00D2BE'
    default:
      return '#666666'
  }
}

function formatBadgeLabel(category: string): string {
  switch (category) {
    case 'SafetyCar': return 'SC'
    case 'VirtualSafetyCar': return 'VSC'
    case 'Flag': return 'FLAG'
    case 'Drs': return 'DRS'
    default: return category.toUpperCase().slice(0, 5)
  }
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toISOString().slice(11, 19)
  } catch {
    return ''
  }
}

interface RaceControlFeedProps {
  session: Session | null
}

export default function RaceControlFeed({ session }: RaceControlFeedProps) {
  const [messages, setMessages] = useState<RaceControlMessage[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchMessages = async (sessionKey: number) => {
    try {
      const response = await axios.get(
        `https://api.openf1.org/v1/race_control`,
        { params: { session_key: sessionKey }, timeout: 10000 }
      )
      const data = response.data as RaceControlMessage[]
      // Sort by date descending, take last 15
      const sorted = [...data].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      setMessages(sorted.slice(0, 15))
    } catch (err) {
      console.warn('Race control fetch failed:', err)
    }
  }

  useEffect(() => {
    if (!session?.session_key) return

    fetchMessages(session.session_key)

    timerRef.current = setInterval(() => {
      fetchMessages(session.session_key)
    }, 15000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [session?.session_key])

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Divider + title */}
      <div
        style={{
          borderTop: '1px solid #2A2A2A',
          paddingTop: '1.5rem',
          marginBottom: '1rem',
        }}
      >
        <h3
          style={{
            fontFamily: '"Bebas Neue", cursive',
            fontSize: '1.5rem',
            color: '#F0F0F0',
            margin: 0,
            letterSpacing: '0.08em',
          }}
        >
          RACE CONTROL
        </h3>
      </div>

      {messages.length === 0 ? (
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.8rem',
            color: '#444',
            padding: '1rem 0',
          }}
        >
          No messages yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {messages.map((msg, idx) => {
            const badgeColor = getBadgeColor(msg.category)
            return (
              <div
                key={`${msg.date}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  backgroundColor: '#111111',
                  border: '1px solid #1A1A1A',
                  borderRadius: '4px',
                  padding: '0.5rem 0.75rem',
                }}
              >
                {/* Time */}
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.7rem',
                    color: '#444',
                    flexShrink: 0,
                    paddingTop: '1px',
                    fontVariantNumeric: 'tabular-nums',
                    minWidth: '56px',
                  }}
                >
                  {formatTime(msg.date)}
                </div>

                {/* Badge */}
                <div
                  style={{
                    backgroundColor: badgeColor,
                    color: '#000',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.4rem',
                    borderRadius: '3px',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  {formatBadgeLabel(msg.category)}
                </div>

                {/* Message */}
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.8rem',
                    color: '#CCC',
                    lineHeight: 1.4,
                  }}
                >
                  {msg.message}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
