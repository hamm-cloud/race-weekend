import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import axios from 'axios'
import { getTeamColor } from '../lib/teamColors'

interface OpenF1Driver {
  driver_number: number
  broadcast_name: string
  full_name: string
  name_acronym: string
  team_name: string
  team_colour: string | null
  country_code: string | null
  headshot_url: string | null
  session_key: number
}

interface DriverStat {
  dob: string
  nat: string
  wins: number
  podiums: number
  poles: number
  championships: number
  seasons: number
}

interface LiveStats {
  wins: number
  podiums: number
  poles: number
}

// Ergast/Jolpica driverId mapping from OpenF1 acronym
const ERGAST_ID: Record<string, string> = {
  VER: 'max_verstappen', NOR: 'norris', LEC: 'leclerc', HAM: 'hamilton',
  PIA: 'piastri', SAI: 'sainz', RUS: 'russell', ALO: 'alonso',
  ANT: 'antonelli', HUL: 'hulkenberg', TSU: 'tsunoda', STR: 'stroll',
  ALB: 'albon', OCO: 'ocon', GAS: 'gasly', BEA: 'bearman',
  DOO: 'doohan', BOT: 'bottas', HAD: 'hadjar', LAW: 'lawson',
}

// Static fallback — base info (dob, nationality, championships, seasons) + last-known numbers
// wins/podiums/poles are overridden by live API fetch when detail opens
const DRIVER_STATS: Record<string, DriverStat> = {
  VER: { dob: "1997-09-30", nat: "Dutch",          wins: 71,  podiums: 122, poles: 62,  championships: 4, seasons: 11 },
  NOR: { dob: "1999-11-13", nat: "British",         wins: 11,  podiums: 37,  poles: 29,  championships: 1, seasons: 7  },
  LEC: { dob: "1997-10-16", nat: "Monégasque",      wins: 8,   podiums: 44,  poles: 32,  championships: 0, seasons: 8  },
  HAM: { dob: "1985-01-07", nat: "British",         wins: 105, podiums: 206, poles: 117, championships: 7, seasons: 18 },
  PIA: { dob: "2001-04-06", nat: "Australian",      wins: 9,   podiums: 22,  poles: 14,  championships: 0, seasons: 4  },
  SAI: { dob: "1994-09-01", nat: "Spanish",         wins: 4,   podiums: 28,  poles: 11,  championships: 0, seasons: 11 },
  RUS: { dob: "1998-02-15", nat: "British",         wins: 6,   podiums: 22,  poles: 13,  championships: 0, seasons: 7  },
  ALO: { dob: "1981-07-29", nat: "Spanish",         wins: 32,  podiums: 108, poles: 23,  championships: 2, seasons: 23 },
  ANT: { dob: "2006-08-25", nat: "Italian",         wins: 1,   podiums: 1,   poles: 1,   championships: 0, seasons: 1  },
  HUL: { dob: "1987-08-19", nat: "German",          wins: 0,   podiums: 0,   poles: 1,   championships: 0, seasons: 15 },
  TSU: { dob: "2000-05-11", nat: "Japanese",        wins: 0,   podiums: 0,   poles: 1,   championships: 0, seasons: 5  },
  STR: { dob: "1998-10-29", nat: "Canadian",        wins: 0,   podiums: 3,   poles: 1,   championships: 0, seasons: 9  },
  ALB: { dob: "1996-03-23", nat: "Thai",            wins: 0,   podiums: 2,   poles: 1,   championships: 0, seasons: 6  },
  OCO: { dob: "1996-09-17", nat: "French",          wins: 1,   podiums: 3,   poles: 0,   championships: 0, seasons: 8  },
  GAS: { dob: "1996-02-07", nat: "French",          wins: 1,   podiums: 4,   poles: 0,   championships: 0, seasons: 8  },
  BEA: { dob: "2005-05-08", nat: "British",         wins: 0,   podiums: 0,   poles: 0,   championships: 0, seasons: 1  },
  DOO: { dob: "2003-01-20", nat: "Australian",      wins: 0,   podiums: 0,   poles: 0,   championships: 0, seasons: 1  },
  BOT: { dob: "1989-08-28", nat: "Finnish",         wins: 10,  podiums: 67,  poles: 19,  championships: 0, seasons: 13 },
  HAD: { dob: "2004-09-28", nat: "French",          wins: 0,   podiums: 1,   poles: 1,   championships: 0, seasons: 1  },
  LAW: { dob: "2002-02-11", nat: "New Zealander",   wins: 0,   podiums: 0,   poles: 0,   championships: 0, seasons: 2  },
}

async function fetchLiveStats(acronym: string): Promise<LiveStats | null> {
  const ergastId = ERGAST_ID[acronym]
  if (!ergastId) return null
  try {
    const base = 'https://api.jolpi.ca/ergast/f1'
    // Fetch wins and poles in parallel
    const [winsRes, polesRes] = await Promise.all([
      axios.get(`${base}/drivers/${ergastId}/results/1/`, { params: { limit: 1 }, timeout: 8000 }),
      axios.get(`${base}/drivers/${ergastId}/qualifying/1/`, { params: { limit: 1 }, timeout: 8000 }),
    ])
    const wins = parseInt(winsRes.data?.MRData?.total ?? '0', 10)
    const poles = parseInt(polesRes.data?.MRData?.total ?? '0', 10)

    // Fetch all race results to count podiums (paginate if needed)
    const firstPage = await axios.get(`${base}/drivers/${ergastId}/results/`, { params: { limit: 500 }, timeout: 10000 })
    const total = parseInt(firstPage.data?.MRData?.total ?? '0', 10)
    let allRaces = firstPage.data?.MRData?.RaceTable?.Races ?? []
    if (total > 500) {
      const second = await axios.get(`${base}/drivers/${ergastId}/results/`, { params: { limit: 500, offset: 500 }, timeout: 10000 })
      allRaces = [...allRaces, ...(second.data?.MRData?.RaceTable?.Races ?? [])]
    }
    const podiums = allRaces.filter((r: { Results: Array<{ position: string }> }) => {
      const pos = parseInt(r.Results?.[0]?.position ?? '99', 10)
      return pos >= 1 && pos <= 3
    }).length

    return { wins, podiums, poles }
  } catch {
    return null
  }
}

function calcAge(dob: string): number {
  return Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000)
}

function getDriverColor(driver: OpenF1Driver): string {
  if (driver.team_colour) {
    return driver.team_colour.startsWith('#') ? driver.team_colour : `#${driver.team_colour}`
  }
  return getTeamColor(driver.team_name)
}

interface DriverDetailProps {
  driver: OpenF1Driver
  isMobile: boolean
  onClose: () => void
}

function DriverDetail({ driver, isMobile, onClose }: DriverDetailProps) {
  const stats = DRIVER_STATS[driver.name_acronym]
  const teamColor = getDriverColor(driver)
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null)
  const [loadingLive, setLoadingLive] = useState(true)

  useEffect(() => {
    setLoadingLive(true)
    fetchLiveStats(driver.name_acronym).then((result) => {
      setLiveStats(result)
      setLoadingLive(false)
    })
  }, [driver.name_acronym])

  const wins = liveStats?.wins ?? stats?.wins ?? '—'
  const podiums = liveStats?.podiums ?? stats?.podiums ?? '—'
  const poles = liveStats?.poles ?? stats?.poles ?? '—'

  const overlayVariants = isMobile
    ? {
        initial: { y: '100%' },
        animate: { y: 0 },
        exit: { y: '100%' },
      }
    : {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
      }

  const statTiles = [
    { emoji: '🏆', label: 'Championships', value: stats?.championships ?? '—', live: false },
    { emoji: '🥇', label: 'Wins',          value: wins,                          live: true  },
    { emoji: '🏅', label: 'Podiums',       value: podiums,                       live: true  },
    { emoji: '⏱',  label: 'Poles',         value: poles,                         live: true  },
    { emoji: '📅', label: 'Seasons in F1', value: stats?.seasons ?? '—',         live: false },
  ]

  return (
    <motion.div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Panel */}
      <motion.div
        variants={overlayVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'relative',
          backgroundColor: '#111111',
          border: '1px solid #2A2A2A',
          borderTop: `4px solid ${teamColor}`,
          width: isMobile ? '100%' : '480px',
          maxHeight: isMobile ? '85vh' : '90vh',
          overflowY: 'auto',
          padding: '1.5rem',
          borderRadius: isMobile ? '16px 16px 0 0' : '8px',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            color: '#999',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            borderRadius: '4px',
          }}
        >
          <X size={16} />
        </button>

        {/* Headshot + header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          {driver.headshot_url ? (
            <img
              src={driver.headshot_url}
              alt={driver.full_name}
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                borderRadius: '50%',
                border: `2px solid ${teamColor}`,
                flexShrink: 0,
              }}
              onError={(e) => {
                const target = e.currentTarget
                target.style.display = 'none'
                const fallback = target.nextSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
          ) : null}
          {/* Initials fallback */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: `2px solid ${teamColor}`,
              backgroundColor: '#1A1A1A',
              display: driver.headshot_url ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"Bebas Neue", cursive',
              fontSize: '1.5rem',
              color: teamColor,
              flexShrink: 0,
            }}
          >
            {driver.name_acronym}
          </div>

          <div>
            <div
              style={{
                fontFamily: '"Bebas Neue", cursive',
                fontSize: '2rem',
                color: '#F0F0F0',
                letterSpacing: '0.05em',
                lineHeight: 1,
              }}
            >
              {driver.full_name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span
                style={{
                  backgroundColor: teamColor,
                  color: '#000',
                  fontFamily: '"Bebas Neue", cursive',
                  fontSize: '1rem',
                  padding: '0.1rem 0.5rem',
                  borderRadius: '3px',
                }}
              >
                #{driver.driver_number}
              </span>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.8rem',
                  color: teamColor,
                  fontWeight: 600,
                }}
              >
                {driver.team_name}
              </span>
            </div>
          </div>
        </div>

        {/* Info row */}
        {stats && (
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              marginBottom: '1.5rem',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.8rem',
              color: '#999',
            }}
          >
            <div>
              <div style={{ color: '#555', fontSize: '0.7rem', marginBottom: '2px' }}>NATIONALITY</div>
              <div style={{ color: '#F0F0F0' }}>{stats.nat}</div>
            </div>
            <div>
              <div style={{ color: '#555', fontSize: '0.7rem', marginBottom: '2px' }}>AGE</div>
              <div style={{ color: '#F0F0F0' }}>{calcAge(stats.dob)}</div>
            </div>
            <div>
              <div style={{ color: '#555', fontSize: '0.7rem', marginBottom: '2px' }}>DOB</div>
              <div style={{ color: '#F0F0F0' }}>{stats.dob}</div>
            </div>
          </div>
        )}

        {/* Stat tiles */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
          }}
        >
          {statTiles.map((tile) => {
            const isLoading = tile.live && loadingLive
            return (
              <div
                key={tile.label}
                style={{
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  borderRadius: '6px',
                  padding: '0.875rem 1rem',
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{tile.emoji}</div>
                <div
                  style={{
                    fontFamily: '"Bebas Neue", cursive',
                    fontSize: '1.75rem',
                    color: isLoading ? '#2A2A2A' : '#F0F0F0',
                    lineHeight: 1,
                    minWidth: '2ch',
                    backgroundColor: isLoading ? '#2A2A2A' : 'transparent',
                    borderRadius: isLoading ? '4px' : undefined,
                    animation: isLoading ? 'pulse 1.5s ease-in-out infinite' : undefined,
                  }}
                >
                  {isLoading ? '—' : tile.value}
                </div>
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.65rem',
                    color: '#666',
                    marginTop: '2px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {tile.label}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<OpenF1Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDriver, setSelectedDriver] = useState<OpenF1Driver | null>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const response = await axios.get('https://api.openf1.org/v1/drivers', {
          params: { session_key: 'latest' },
          timeout: 10000,
        })
        const data = response.data as OpenF1Driver[]
        // Deduplicate by driver_number
        const seen = new Set<number>()
        const unique: OpenF1Driver[] = []
        for (const d of data) {
          if (!seen.has(d.driver_number)) {
            seen.add(d.driver_number)
            unique.push(d)
          }
        }
        // Sort by driver number
        unique.sort((a, b) => a.driver_number - b.driver_number)
        setDrivers(unique)
      } catch (err) {
        console.warn('Failed to fetch drivers:', err)
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <h2
        style={{
          fontFamily: '"Bebas Neue", cursive',
          fontSize: '2rem',
          color: '#F0F0F0',
          margin: '0 0 1.5rem 0',
          letterSpacing: '0.05em',
        }}
      >
        2026 DRIVERS
      </h2>

      {loading ? (
        <div style={{ color: '#555', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' }}>
          Loading drivers…
        </div>
      ) : drivers.length === 0 ? (
        <div style={{ color: '#555', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' }}>
          No driver data available
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
            gap: '0.75rem',
          }}
        >
          {drivers.map((driver) => {
            const teamColor = getDriverColor(driver)
            return (
              <motion.div
                key={driver.driver_number}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDriver(driver)}
                style={{
                  backgroundColor: '#111111',
                  border: '1px solid #2A2A2A',
                  borderLeft: `3px solid ${teamColor}`,
                  borderRadius: '6px',
                  padding: '0.875rem',
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    fontFamily: '"Bebas Neue", cursive',
                    fontSize: isMobile ? '1.75rem' : '2.25rem',
                    color: teamColor,
                    lineHeight: 1,
                    marginBottom: '0.125rem',
                  }}
                >
                  {driver.driver_number}
                </div>
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#F0F0F0',
                    letterSpacing: '0.05em',
                  }}
                >
                  {driver.name_acronym}
                </div>
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.65rem',
                    color: '#999',
                    marginTop: '0.125rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {driver.full_name}
                </div>
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.6rem',
                    color: '#555',
                    marginTop: '0.125rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {driver.team_name}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedDriver && (
          <DriverDetail
            driver={selectedDriver}
            isMobile={isMobile}
            onClose={() => setSelectedDriver(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
