import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, X } from 'lucide-react'
import { getTeamColor } from '../../lib/teamColors'
import type { Driver } from '../../hooks/useOpenF1'

interface TrackMapProps {
  drivers: Driver[]
  carPositions: Map<number, { x: number; y: number }>
  loading?: boolean
  hasSession?: boolean
  isLive?: boolean
}

// Silverstone-ish circuit path (simplified placeholder)
const CIRCUIT_PATH = `
  M 400 80
  C 500 75, 580 90, 620 130
  C 660 170, 670 220, 650 260
  C 630 300, 600 320, 580 350
  C 560 380, 560 420, 580 450
  C 600 480, 640 500, 660 530
  C 680 560, 680 600, 660 630
  C 640 660, 600 680, 560 690
  C 520 700, 480 700, 450 690
  C 410 680, 390 660, 370 640
  C 340 610, 320 570, 290 550
  C 260 530, 220 530, 190 550
  C 160 570, 140 610, 140 650
  C 140 690, 160 720, 200 740
  C 240 760, 290 760, 330 750
  C 370 740, 390 720, 400 700
  C 410 680, 410 650, 400 630
  C 390 610, 370 590, 360 560
  C 350 530, 350 490, 360 460
  C 370 430, 390 410, 400 390
  C 410 370, 410 340, 400 320
  C 390 300, 360 290, 340 270
  C 310 240, 290 200, 290 160
  C 290 120, 320 90, 360 80
  Z
`

// Mock positions when no real data

function normalizePositions(positions: Map<number, { x: number; y: number }>) {
  if (positions.size === 0) return { normalized: new Map(), minX: 0, minY: 0, rangeX: 1, rangeY: 1 }

  const xs = Array.from(positions.values()).map(p => p.x)
  const ys = Array.from(positions.values()).map(p => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1

  const normalized = new Map<number, { x: number; y: number }>()
  positions.forEach((pos, num) => {
    normalized.set(num, {
      x: ((pos.x - minX) / rangeX) * 760 + 20,
      y: ((pos.y - minY) / rangeY) * 560 + 20,
    })
  })

  return { normalized, minX, minY, rangeX, rangeY }
}

export default function TrackMap({ drivers, carPositions, hasSession = false, isLive = false }: TrackMapProps) {
  const [fullscreen, setFullscreen] = useState(false)
  const hasRealPositions = carPositions.size > 0 && drivers.length > 0 && isLive

  // Only use real data — mock dots are misleading (coords don't align to circuit path)
  const displayPositions = hasRealPositions ? carPositions : new Map()
  const displayDrivers = hasRealPositions ? drivers : []
  const useMock = !hasRealPositions

  // Status badge
  const statusBadge = hasRealPositions
    ? 'LIVE'
    : hasSession
      ? 'SESSION ENDED'
      : 'NO LIVE SESSION'

  const driverMap = new Map<number, Driver>()
  displayDrivers.forEach(d => driverMap.set(d.driver_number, d))

  const { normalized } = normalizePositions(displayPositions)

  const mapSvg = (
    <svg
      viewBox="0 0 800 600"
      style={{
        width: '100%',
        height: fullscreen ? '100%' : 'auto',
        maxWidth: fullscreen ? 'none' : '800px',
        display: 'block',
        margin: '0 auto',
        backgroundColor: '#0D0D0D',
      }}
    >
            {/* Grid lines */}
            {[...Array(8)].map((_, i) => (
              <line key={`vg-${i}`} x1={i * 100 + 50} y1={0} x2={i * 100 + 50} y2={600} stroke="#1A1A1A" strokeWidth={1} />
            ))}
            {[...Array(6)].map((_, i) => (
              <line key={`hg-${i}`} x1={0} y1={i * 100 + 50} x2={800} y2={i * 100 + 50} stroke="#1A1A1A" strokeWidth={1} />
            ))}

            {/* Circuit outline */}
            <path
              d={CIRCUIT_PATH}
              fill="none"
              stroke="#2A2A2A"
              strokeWidth={28}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={CIRCUIT_PATH}
              fill="none"
              stroke="#1A1A1A"
              strokeWidth={24}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={CIRCUIT_PATH}
              fill="none"
              stroke="#333333"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="10 5"
            />

            {/* Start/finish line */}
            <line x1={390} y1={72} x2={410} y2={72} stroke="#E8002D" strokeWidth={3} />

            {/* Driver dots */}
            <AnimatePresence>
              {Array.from(normalized.entries()).map(([driverNum, pos]) => {
                const driver = driverMap.get(driverNum)
                if (!driver) return null
                const teamColor = driver.team_colour ? `#${driver.team_colour}` : getTeamColor(driver.team_name)

                return (
                  <motion.g
                    key={driverNum}
                    initial={false}
                    animate={{ x: pos.x, y: pos.y }}
                    transition={{ type: 'spring', stiffness: 60, damping: 20 }}
                  >
                    {/* Glow */}
                    <circle
                      cx={0}
                      cy={0}
                      r={10}
                      fill={teamColor}
                      opacity={0.2}
                      filter={`drop-shadow(0 0 6px ${teamColor})`}
                    />
                    {/* Main dot */}
                    <circle
                      cx={0}
                      cy={0}
                      r={6}
                      fill={teamColor}
                      filter={`drop-shadow(0 0 4px ${teamColor})`}
                    />
                    {/* Label */}
                    <text
                      x={0}
                      y={-10}
                      textAnchor="middle"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '8px',
                        fontWeight: 700,
                        fill: '#F0F0F0',
                      }}
                    >
                      {driver.name_acronym}
                    </text>
                  </motion.g>
                )
              })}
            </AnimatePresence>
    </svg>
  )

  return (
    <>
      {/* Fullscreen overlay */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 300,
              backgroundColor: '#080808',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Fullscreen header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #2A2A2A',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontFamily: '"Bebas Neue", cursive', fontSize: '1.25rem', color: '#F0F0F0', letterSpacing: '0.05em' }}>
                  TRACK MAP
                </span>
                {statusBadge && (
                  <span style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '0.65rem',
                    color: statusBadge === 'LIVE' ? '#E8002D' : '#666',
                    border: `1px solid ${statusBadge === 'LIVE' ? '#E8002D' : '#2A2A2A'}`,
                    padding: '0.2rem 0.4rem',
                  }}>
                    {statusBadge}
                  </span>
                )}
              </div>
              <button
                onClick={() => setFullscreen(false)}
                style={{
                  background: '#1A1A1A', border: '1px solid #2A2A2A',
                  color: '#999', width: '36px', height: '36px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', borderRadius: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>
            {/* Fullscreen map */}
            <div style={{ flex: 1, overflow: 'hidden', padding: '0.5rem', position: 'relative' }}>
              {mapSvg}
              {useMock && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    backgroundColor: 'rgba(8,8,8,0.75)',
                    border: '1px solid #2A2A2A',
                    padding: '0.75rem 1.25rem',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.8rem',
                    color: '#666',
                    textAlign: 'center',
                  }}>
                    🏁 Live car positions available during active sessions
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    <div>
      <div
        style={{
          backgroundColor: '#111111',
          border: '1px solid #2A2A2A',
          padding: '1.5rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2
            style={{
              fontFamily: '"Bebas Neue", cursive',
              fontSize: '1.5rem',
              color: '#F0F0F0',
              margin: 0,
              letterSpacing: '0.05em',
            }}
          >
            TRACK MAP
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {statusBadge && (
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.7rem',
                color: statusBadge === 'LIVE' ? '#E8002D' : '#666666',
                backgroundColor: '#1A1A1A', padding: '0.25rem 0.5rem',
                border: `1px solid ${statusBadge === 'LIVE' ? '#E8002D' : '#2A2A2A'}`,
              }}>
                {statusBadge}
              </span>
            )}
            <button
              onClick={() => setFullscreen(true)}
              title="Fullscreen"
              style={{
                background: '#1A1A1A', border: '1px solid #2A2A2A',
                color: '#999', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', borderRadius: '4px',
              }}
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>

        <div style={{ width: '100%', overflowX: 'auto', position: 'relative' }}>
          {mapSvg}
          {useMock && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{
                backgroundColor: 'rgba(8,8,8,0.75)',
                border: '1px solid #2A2A2A',
                padding: '0.75rem 1.25rem',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.8rem',
                color: '#666',
                textAlign: 'center',
              }}>
                🏁 Live car positions available during active sessions
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Driver legend */}
      <div
        style={{
          backgroundColor: '#111111',
          border: '1px solid #2A2A2A',
          padding: '1rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '0.5rem',
          }}
        >
          {displayDrivers.slice(0, 20).map((driver) => {
            const teamColor = driver.team_colour ? `#${driver.team_colour}` : getTeamColor(driver.team_name)
            return (
              <div
                key={driver.driver_number}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.375rem 0.5rem',
                  backgroundColor: '#0D0D0D',
                  border: '1px solid #1A1A1A',
                  borderLeft: `3px solid ${teamColor}`,
                }}
              >
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: '#F0F0F0', minWidth: '28px' }}>
                  {driver.name_acronym}
                </span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#666666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {driver.team_name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
    </>
  )
}
