import { useState, useRef, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'
import { useTeamRadio } from '../../hooks/useTeamRadio'
import { getTeamColor } from '../../lib/teamColors'
import type { Driver } from '../../hooks/useOpenF1'

interface TeamRadioFeedProps {
  sessionKey: number | null
  drivers: Driver[]
  isLive: boolean
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toISOString().slice(11, 19)
  } catch {
    return ''
  }
}

function DriverAvatar({ driver, color }: { driver: Driver | undefined; color: string }) {
  const [imgError, setImgError] = useState(false)

  if (driver?.headshot_url && !imgError) {
    return (
      <img
        src={driver.headshot_url}
        alt={driver.name_acronym}
        onError={() => setImgError(true)}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          border: `1px solid ${color}`,
        }}
      />
    )
  }

  const initials = driver
    ? driver.name_acronym.slice(0, 2)
    : '?'

  return (
    <div
      style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        backgroundColor: '#1A1A1A',
        border: `1px solid ${color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.55rem',
        fontWeight: 700,
        color,
      }}
    >
      {initials}
    </div>
  )
}

function PlayingBars({ color }: { color: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '2px',
        height: '14px',
        flexShrink: 0,
      }}
    >
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: '3px',
            backgroundColor: color,
            borderRadius: '1px',
            animation: `radioBar${i} 0.8s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function TeamRadioFeed({ sessionKey, isLive, drivers }: TeamRadioFeedProps) {
  const pollInterval = isLive ? 15000 : 60000
  const { messages, loading, isFallback } = useTeamRadio(sessionKey, drivers, pollInterval)

  const [playingUrl, setPlayingUrl] = useState<string | null>(null)
  const [errorUrls, setErrorUrls] = useState<Set<string>>(new Set())
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const handlePlay = (url: string) => {
    // Toggle off if already playing
    if (playingUrl === url) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setPlayingUrl(null)
      return
    }

    // Stop any current audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const audio = new Audio(url)
    audioRef.current = audio
    setPlayingUrl(url)

    audio.play().catch(() => {
      setErrorUrls(prev => new Set(prev).add(url))
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

  const displayed = messages.slice(0, 30)

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Header */}
      <div
        style={{
          borderTop: '1px solid #2A2A2A',
          paddingTop: '1.5rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
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
          📻 TEAM RADIO
        </h3>
        {isFallback && (
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.65rem',
              color: '#888',
              backgroundColor: '#1A1A1A',
              border: '1px solid #2A2A2A',
              padding: '0.15rem 0.4rem',
              borderRadius: '3px',
            }}
          >
            demo
          </span>
        )}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes radioBar0 {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
        @keyframes radioBar1 {
          0%, 100% { height: 8px; }
          50% { height: 4px; }
        }
        @keyframes radioBar2 {
          0%, 100% { height: 12px; }
          50% { height: 6px; }
        }
      `}</style>

      {loading && displayed.length === 0 ? (
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
      ) : displayed.length === 0 ? (
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.8rem',
            color: '#444',
            padding: '1rem 0',
          }}
        >
          No radio messages yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {displayed.map((msg, idx) => {
            const driver = driverMap.get(msg.driver_number)
            const teamColor = driver?.team_colour
              ? `#${driver.team_colour}`
              : getTeamColor(driver?.team_name)
            const isPlaying = playingUrl === msg.recording_url
            const hasError = errorUrls.has(msg.recording_url)

            return (
              <div
                key={`${msg.recording_url}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  backgroundColor: '#111111',
                  border: '1px solid #1A1A1A',
                  borderLeft: `3px solid ${teamColor}`,
                  borderRadius: '4px',
                  padding: '0.5rem 0.75rem',
                }}
              >
                {/* Avatar */}
                <DriverAvatar driver={driver} color={teamColor} />

                {/* Acronym + name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: teamColor,
                      }}
                    >
                      {driver?.name_acronym ?? `#${msg.driver_number}`}
                    </span>
                    {driver?.full_name && (
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '0.65rem',
                          color: '#555',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {driver.full_name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Timestamp */}
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.65rem',
                    color: '#444',
                    flexShrink: 0,
                    fontVariantNumeric: 'tabular-nums',
                    minWidth: '52px',
                    textAlign: 'right',
                  }}
                >
                  {formatTime(msg.date)}
                </div>

                {/* Playing bars indicator */}
                {isPlaying && (
                  <PlayingBars color={teamColor} />
                )}

                {/* Play/Pause or error */}
                {hasError ? (
                  <span
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.6rem',
                      color: '#666',
                      flexShrink: 0,
                    }}
                  >
                    ⚠ unavailable
                  </span>
                ) : (
                  <button
                    onClick={() => handlePlay(msg.recording_url)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: isPlaying ? teamColor : 'transparent',
                      border: `2px solid ${teamColor}`,
                      color: isPlaying ? '#000' : teamColor,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      padding: 0,
                    }}
                  >
                    {isPlaying
                      ? <Pause size={12} />
                      : <Play size={12} />
                    }
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
