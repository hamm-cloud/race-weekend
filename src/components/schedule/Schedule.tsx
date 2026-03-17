import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatCountdown, formatDate, getSessionTypeLabel, getSessionTypeColor } from '../../lib/utils'
import type { Session } from '../../hooks/useOpenF1'

interface ScheduleProps {
  sessions: Session[]
  loading: boolean
}

interface MeetingGroup {
  meetingKey: number
  meetingName: string
  location: string
  countryName: string
  sessions: Session[]
}

function groupSessionsByMeeting(sessions: Session[]): MeetingGroup[] {
  const map = new Map<number, MeetingGroup>()
  for (const session of sessions) {
    if (!map.has(session.meeting_key)) {
      map.set(session.meeting_key, {
        meetingKey: session.meeting_key,
        meetingName: session.meeting_name,
        location: session.location,
        countryName: session.country_name,
        sessions: [],
      })
    }
    map.get(session.meeting_key)!.sessions.push(session)
  }
  return Array.from(map.values())
}

// Fallback mock schedule
// Note: Bahrain & Saudi Arabia GPs cancelled (2026) due to Iran conflict
const MOCK_SESSIONS: Session[] = [
  { session_key: 6, session_name: 'Race', session_type: 'Race', date_start: '2026-04-19T07:00:00', date_end: '2026-04-19T09:00:00', gmt_offset: '+08:00', circuit_key: 3, circuit_short_name: 'Melbourne', country_name: 'Australia', country_key: 3, country_code: 'AUS', location: 'Melbourne', meeting_name: 'Australian Grand Prix', meeting_key: 3, year: 2026 },
  { session_key: 7, session_name: 'Qualifying', session_type: 'Qualifying', date_start: '2026-04-18T08:00:00', date_end: '2026-04-18T09:00:00', gmt_offset: '+08:00', circuit_key: 3, circuit_short_name: 'Melbourne', country_name: 'Australia', country_key: 3, country_code: 'AUS', location: 'Melbourne', meeting_name: 'Australian Grand Prix', meeting_key: 3, year: 2026 },
  { session_key: 8, session_name: 'Race', session_type: 'Race', date_start: '2026-05-03T07:00:00', date_end: '2026-05-03T09:00:00', gmt_offset: '+08:00', circuit_key: 4, circuit_short_name: 'Shanghai', country_name: 'China', country_key: 4, country_code: 'CHN', location: 'Shanghai', meeting_name: 'Chinese Grand Prix', meeting_key: 4, year: 2026 },
  { session_key: 9, session_name: 'Race', session_type: 'Race', date_start: '2026-05-24T13:00:00', date_end: '2026-05-24T15:00:00', gmt_offset: '+08:00', circuit_key: 5, circuit_short_name: 'Miami', country_name: 'United States', country_key: 5, country_code: 'USA', location: 'Miami', meeting_name: 'Miami Grand Prix', meeting_key: 5, year: 2026 },
]

const COUNTRY_FLAGS: Record<string, string> = {
  BHR: '🇧🇭', SAU: '🇸🇦', AUS: '🇦🇺', CHN: '🇨🇳', USA: '🇺🇸',
  JPN: '🇯🇵', GBR: '🇬🇧', ESP: '🇪🇸', CAN: '🇨🇦', AUT: '🇦🇹',
  HUN: '🇭🇺', BEL: '🇧🇪', NED: '🇳🇱', ITA: '🇮🇹', AZE: '🇦🇿',
  SGP: '🇸🇬', MEX: '🇲🇽', BRA: '🇧🇷', LAS: '🇺🇸', ABU: '🇦🇪',
  MON: '🇲🇨',
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [countdown, setCountdown] = useState(formatCountdown(new Date(targetDate)))

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatCountdown(new Date(targetDate)))
    }, 60000)
    return () => clearInterval(interval)
  }, [targetDate])

  return <span>{countdown}</span>
}

export default function Schedule({ sessions, loading }: ScheduleProps) {
  const useMock = sessions.length === 0
  const displaySessions = useMock ? MOCK_SESSIONS : sessions

  const now = new Date()
  const upcomingSessions = displaySessions.filter(s => new Date(s.date_start) >= now)
  const meetings = groupSessionsByMeeting(upcomingSessions.length > 0 ? upcomingSessions : displaySessions.slice(-20))

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2
          style={{
            fontFamily: '"Bebas Neue", cursive',
            fontSize: '2rem',
            color: '#F0F0F0',
            margin: 0,
            letterSpacing: '0.05em',
          }}
        >
          2026 SEASON SCHEDULE
        </h2>
        {useMock && (
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.7rem',
              color: '#666666',
              backgroundColor: '#1A1A1A',
              padding: '0.25rem 0.5rem',
              border: '1px solid #2A2A2A',
            }}
          >
            DEMO DATA
          </span>
        )}
      </div>

      {loading && sessions.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666666', fontFamily: 'Inter, sans-serif' }}>
          Loading schedule...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: '#2A2A2A' }}>
          {meetings.map((meeting, idx) => {
            const nextRace = meeting.sessions.find(s => s.session_type === 'Race')
            const isUpcoming = nextRace ? new Date(nextRace.date_start) >= now : false

            return (
              <motion.div
                key={meeting.meetingKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  backgroundColor: '#111111',
                  padding: '1.25rem 1.5rem',
                  borderLeft: isUpcoming ? '3px solid #E8002D' : '3px solid #2A2A2A',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>
                        {COUNTRY_FLAGS[meeting.countryName?.substring(0, 3).toUpperCase()] ??
                         COUNTRY_FLAGS[meeting.sessions[0]?.country_code?.toUpperCase()] ?? '🏁'}
                      </span>
                      <h3
                        style={{
                          fontFamily: '"Bebas Neue", cursive',
                          fontSize: '1.5rem',
                          color: '#F0F0F0',
                          margin: 0,
                          letterSpacing: '0.05em',
                        }}
                      >
                        {meeting.meetingName}
                      </h3>
                    </div>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.8rem',
                        color: '#666666',
                        margin: '0 0 0.75rem',
                      }}
                    >
                      {meeting.location}, {meeting.countryName}
                    </p>

                    {/* Session chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {meeting.sessions.map((session) => (
                        <div
                          key={session.session_key}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            backgroundColor: '#1A1A1A',
                            border: '1px solid #2A2A2A',
                            borderTop: `2px solid ${getSessionTypeColor(session.session_type)}`,
                            padding: '0.375rem 0.625rem',
                            borderRadius: '2px',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              color: getSessionTypeColor(session.session_type),
                              letterSpacing: '0.08em',
                            }}
                          >
                            {getSessionTypeLabel(session.session_type)}
                          </span>
                          <span
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '0.65rem',
                              color: '#666666',
                              marginTop: '1px',
                            }}
                          >
                            {formatDate(session.date_start)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Countdown */}
                  {isUpcoming && nextRace && (
                    <div
                      style={{
                        textAlign: 'right',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: '"Bebas Neue", cursive',
                          fontSize: '2rem',
                          color: '#E8002D',
                          lineHeight: 1,
                          letterSpacing: '0.05em',
                        }}
                      >
                        <CountdownTimer targetDate={nextRace.date_start} />
                      </div>
                      <div
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '0.65rem',
                          color: '#666666',
                          letterSpacing: '0.08em',
                          marginTop: '2px',
                        }}
                      >
                        TO RACE
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
