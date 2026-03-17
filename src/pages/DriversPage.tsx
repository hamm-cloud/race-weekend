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

const DRIVER_STATS: Record<string, DriverStat> = {
  VER: { dob: "1997-09-30", nat: "Dutch", wins: 63, podiums: 115, poles: 40, championships: 4, seasons: 10 },
  NOR: { dob: "1999-11-13", nat: "British", wins: 4, podiums: 27, poles: 6, championships: 0, seasons: 7 },
  LEC: { dob: "1997-10-16", nat: "Monégasque", wins: 8, podiums: 41, poles: 26, championships: 0, seasons: 7 },
  HAM: { dob: "1985-01-07", nat: "British", wins: 104, podiums: 202, poles: 104, championships: 7, seasons: 18 },
  PIA: { dob: "2001-04-06", nat: "Australian", wins: 3, podiums: 15, poles: 2, championships: 0, seasons: 3 },
  SAI: { dob: "1994-09-01", nat: "Spanish", wins: 4, podiums: 26, poles: 6, championships: 0, seasons: 10 },
  RUS: { dob: "1998-02-15", nat: "British", wins: 3, podiums: 20, poles: 5, championships: 0, seasons: 6 },
  ALO: { dob: "1981-07-29", nat: "Spanish", wins: 32, podiums: 106, poles: 22, championships: 2, seasons: 22 },
  ANT: { dob: "2006-08-25", nat: "Italian", wins: 0, podiums: 0, poles: 0, championships: 0, seasons: 1 },
  HUL: { dob: "1987-08-19", nat: "German", wins: 0, podiums: 0, poles: 1, championships: 0, seasons: 14 },
  TSU: { dob: "2000-05-11", nat: "Japanese", wins: 0, podiums: 0, poles: 0, championships: 0, seasons: 5 },
  STR: { dob: "1998-10-29", nat: "Canadian", wins: 0, podiums: 3, poles: 1, championships: 0, seasons: 8 },
  ALB: { dob: "1996-03-23", nat: "Thai", wins: 0, podiums: 2, poles: 0, championships: 0, seasons: 5 },
  OCO: { dob: "1996-09-17", nat: "French", wins: 1, podiums: 3, poles: 0, championships: 0, seasons: 8 },
  GAS: { dob: "1996-02-07", nat: "French", wins: 1, podiums: 4, poles: 1, championships: 0, seasons: 8 },
  BEA: { dob: "2005-05-08", nat: "British", wins: 0, podiums: 0, poles: 0, championships: 0, seasons: 1 },
  DOO: { dob: "2003-01-20", nat: "Australian", wins: 0, podiums: 0, poles: 0, championships: 0, seasons: 1 },
  BOT: { dob: "1989-08-28", nat: "Finnish", wins: 10, podiums: 67, poles: 20, championships: 0, seasons: 13 },
  HAD: { dob: "2004-09-28", nat: "French", wins: 0, podiums: 0, poles: 0, championships: 0, seasons: 1 },
  LAW: { dob: "2002-02-11", nat: "New Zealander", wins: 0, podiums: 0, poles: 0, championships: 0, seasons: 2 },
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
    { emoji: '🏆', label: 'Championships', value: stats?.championships ?? '—' },
    { emoji: '🥇', label: 'Wins', value: stats?.wins ?? '—' },
    { emoji: '🏅', label: 'Podiums', value: stats?.podiums ?? '—' },
    { emoji: '⏱', label: 'Poles', value: stats?.poles ?? '—' },
    { emoji: '📅', label: 'Seasons in F1', value: stats?.seasons ?? '—' },
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
          {statTiles.map((tile) => (
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
                  color: '#F0F0F0',
                  lineHeight: 1,
                }}
              >
                {tile.value}
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
          ))}
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
