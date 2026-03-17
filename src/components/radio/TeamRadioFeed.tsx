import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { getTeamColor } from '../../lib/teamColors'
import type { Driver } from '../../hooks/useOpenF1'

interface TeamRadioClip {
  meeting_key: number
  session_key: number
  driver_number: number
  date: string
  recording_url: string
}

interface TeamRadioFeedProps {
  sessionKey: number | null
  isLive: boolean
  drivers: Driver[]
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toISOString().slice(11, 19)
  } catch {
    return ''
  }
}

export default function TeamRadioFeed({ sessionKey, isLive, drivers }: TeamRadioFeedProps) {
  const [clips, setClips] = useState<TeamRadioClip[]>([])
  const [loading, setLoading] = useState(false)
  const [playingUrl, setPlayingUrl] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const nowTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Update "now" every second to refresh NEW badges during live session
  useEffect(() => {
    if (!isLive) return
    nowTimerRef.current = setInterval(() => setNow(Date.now()), 1000)
    return () => {
      if (nowTimerRef.current) clearInterval(nowTimerRef.current)
    }
  }, [isLive])

  const fetchClips = async (key: number, driverList: Driver[]) => {
    if (driverList.length === 0) return

    const results = await Promise.allSettled(
      driverList.map(driver =>
        axios.get<TeamRadioClip[]>('https://api.openf1.org/v1/team_radio', {
          params: { session_key: key, driver_number: driver.driver_number },
          timeout: 10000,
        })
      )
    )

    const allClips: TeamRadioClip[] = []
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allClips.push(...result.value.data)
      }
    }

    const sorted = allClips.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    setClips(sorted.slice(0, 20))
  }

  useEffect(() => {
    if (!sessionKey || drivers.length === 0) return

    setLoading(true)
    fetchClips(sessionKey, drivers).finally(() => setLoading(false))

    if (isLive) {
      timerRef.current = setInterval(() => {
        fetchClips(sessionKey, drivers)
      }, 30000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [sessionKey, isLive, drivers])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  const handlePlay = (url: string) => {
    if (playingUrl === url) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setPlayingUrl(null)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const audio = new Audio(url)
    audioRef.current = audio
    setPlayingUrl(url)

    audio.play().catch(err => {
      console.warn('Audio playback failed:', err)
      setPlayingUrl(null)
      audioRef.current = null
    })

    audio.addEventListener('ended', () => {
      setPlayingUrl(null)
      audioRef.current = null
    })
  }

  const driverMap = new Map<number, Driver>()
  for (const d of drivers) {
    driverMap.set(d.driver_number, d)
  }

  return (
    <div style={{ marginTop: '2rem' }}>
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
          TEAM RADIO 📻
        </h3>
      </div>

      {loading ? (
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.8rem',
            color: '#444',
            padding: '1rem 0',
          }}
        >
          Loading radio...
        </div>
      ) : clips.length === 0 ? (
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.8rem',
            color: '#444',
            padding: '1rem 0',
          }}
        >
          No radio clips available
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {clips.map((clip, idx) => {
            const driver = driverMap.get(clip.driver_number)
            const teamColor = driver?.team_colour
              ? `#${driver.team_colour}`
              : getTeamColor(driver?.team_name)
            const isNew = isLive && now - new Date(clip.date).getTime() < 60000
            const isPlaying = playingUrl === clip.recording_url

            return (
              <div
                key={`${clip.driver_number}-${clip.date}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  backgroundColor: '#111111',
                  border: '1px solid #1A1A1A',
                  borderLeft: `3px solid ${teamColor}`,
                  borderRadius: '4px',
                  padding: '0.5rem 0.75rem',
                }}
              >
                {/* NEW pulsing dot */}
                <div style={{ width: '8px', flexShrink: 0 }}>
                  {isNew && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#E8002D',
                        animation: 'teamRadioPulse 1s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>

                {/* Driver badge */}
                <div
                  style={{
                    color: teamColor,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    backgroundColor: '#1A1A1A',
                    padding: '0.2rem 0.4rem',
                    borderRadius: '3px',
                    flexShrink: 0,
                    minWidth: '32px',
                    textAlign: 'center',
                  }}
                >
                  {driver?.name_acronym ?? `#${clip.driver_number}`}
                </div>

                {/* Timestamp */}
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.7rem',
                    color: '#444',
                    flexShrink: 0,
                    fontVariantNumeric: 'tabular-nums',
                    minWidth: '56px',
                  }}
                >
                  {formatTime(clip.date)}
                </div>

                {/* Play button */}
                <button
                  onClick={() => handlePlay(clip.recording_url)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'transparent',
                    border: `2px solid ${teamColor}`,
                    color: teamColor,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    flexShrink: 0,
                    padding: 0,
                    marginLeft: 'auto',
                  }}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      <style>{`
        @keyframes teamRadioPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  )
}
