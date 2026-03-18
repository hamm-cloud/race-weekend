import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, X } from 'lucide-react'
import { getTeamColor } from '../../lib/teamColors'
import { getCircuitData } from '../../lib/circuitData'
import type { Driver } from '../../hooks/useOpenF1'

interface TrackMapProps {
  drivers: Driver[]
  carPositions: Map<number, { x: number; y: number }>
  loading?: boolean
  hasSession?: boolean
  isLive?: boolean
  /** OpenF1 session.circuit_key — determines which real SVG to render */
  circuitKey?: number | null
}

const SVG_W = 800
const SVG_H = 600
const PADDING = 24

function gpsToSvg(
  gpsX: number,
  gpsY: number,
  minX: number, maxX: number,
  minY: number, maxY: number
): { x: number; y: number } {
  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1
  const availW = SVG_W - 2 * PADDING
  const availH = SVG_H - 2 * PADDING

  // Maintain aspect ratio: scale uniformly so both axes fit
  const scale = Math.min(availW / rangeX, availH / rangeY)
  const offsetX = PADDING + (availW - rangeX * scale) / 2
  const offsetY = PADDING + (availH - rangeY * scale) / 2

  return {
    x: offsetX + (gpsX - minX) * scale,
    // Flip Y: OpenF1 Y increases upward (north), SVG Y increases downward
    y: offsetY + (maxY - gpsY) * scale,
  }
}

export default function TrackMap({
  drivers,
  carPositions,
  hasSession = false,
  isLive = false,
  circuitKey,
}: TrackMapProps) {
  const [fullscreen, setFullscreen] = useState(false)

  const hasRealPositions = carPositions.size > 0 && drivers.length > 0 && isLive
  const displayPositions = hasRealPositions ? carPositions : new Map<number, { x: number; y: number }>()
  const displayDrivers = hasRealPositions ? drivers : []

  // Look up circuit data; falls back to Spa for unknown/null circuit_key
  const circuit = getCircuitData(circuitKey)
  const { path: circuitPath, viewBox, gpsBounds } = circuit
  const { minX, maxX, minY, maxY } = gpsBounds

  const statusBadge = hasRealPositions
    ? 'LIVE'
    : hasSession
      ? 'SESSION ENDED'
      : 'NO LIVE SESSION'

  const driverMap = new Map<number, Driver>()
  displayDrivers.forEach(d => driverMap.set(d.driver_number, d))

  const mapSvg = (
    <svg
      viewBox={viewBox}
      style={{
        width: '100%',
        height: fullscreen ? '100%' : 'auto',
        maxWidth: fullscreen ? 'none' : '800px',
        display: 'block',
        margin: '0 auto',
        backgroundColor: '#0D0D0D',
      }}
    >
      {/* Subtle grid */}
      {[...Array(8)].map((_, i) => (
        <line key={`vg-${i}`} x1={i * 100 + 50} y1={0} x2={i * 100 + 50} y2={600} stroke="#161616" strokeWidth={1} />
      ))}
      {[...Array(6)].map((_, i) => (
        <line key={`hg-${i}`} x1={0} y1={i * 100 + 50} x2={800} y2={i * 100 + 50} stroke="#161616" strokeWidth={1} />
      ))}

      {/* ── Real circuit outline ── */}
      {/* Thick dark road base */}
      <path
        d={circuitPath}
        fill="none"
        stroke="#2A2A2A"
        strokeWidth={26}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Road surface */}
      <path
        d={circuitPath}
        fill="none"
        stroke="#1E1E1E"
        strokeWidth={22}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Kerb edge line */}
      <path
        d={circuitPath}
        fill="none"
        stroke="#383838"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="8 4"
      />

      {/* Circuit name label */}
      <text
        x={14}
        y={580}
        style={{
          fontFamily: '"Bebas Neue", "Arial Narrow", cursive',
          fontSize: '11px',
          fill: '#444444',
          letterSpacing: '0.08em',
        }}
      >
        {circuit.name.toUpperCase()}
      </text>

      {/* ── Car position dots ── */}
      <AnimatePresence>
        {Array.from(displayPositions.entries()).map(([driverNum, gpsPos]) => {
          const driver = driverMap.get(driverNum)
          if (!driver) return null

          const svgPos = gpsToSvg(gpsPos.x, gpsPos.y, minX, maxX, minY, maxY)
          const teamColor = driver.team_colour
            ? `#${driver.team_colour}`
            : getTeamColor(driver.team_name)

          return (
            <motion.g
              key={driverNum}
              initial={false}
              animate={{ x: svgPos.x, y: svgPos.y }}
              transition={{ type: 'spring', stiffness: 60, damping: 20 }}
            >
              {/* Glow ring */}
              <circle cx={0} cy={0} r={10} fill={teamColor} opacity={0.18}
                filter={`drop-shadow(0 0 6px ${teamColor})`} />
              {/* Main dot */}
              <circle cx={0} cy={0} r={5.5} fill={teamColor}
                filter={`drop-shadow(0 0 4px ${teamColor})`} />
              {/* Acronym label */}
              <text
                x={0} y={-9}
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
      {/* ── Fullscreen overlay ── */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 300,
              backgroundColor: '#080808',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.75rem 1rem', borderBottom: '1px solid #2A2A2A', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  fontFamily: '"Bebas Neue", cursive', fontSize: '1.25rem',
                  color: '#F0F0F0', letterSpacing: '0.05em',
                }}>
                  TRACK MAP
                </span>
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.65rem',
                  color: '#888888', letterSpacing: '0.05em',
                }}>
                  {circuit.name.toUpperCase()}
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
            <div style={{ flex: 1, overflow: 'hidden', padding: '0.5rem', position: 'relative' }}>
              {mapSvg}
              {!hasRealPositions && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none',
                }}>
                  <div style={{
                    backgroundColor: 'rgba(8,8,8,0.8)', border: '1px solid #2A2A2A',
                    padding: '0.75rem 1.25rem', fontFamily: 'Inter, sans-serif',
                    fontSize: '0.8rem', color: '#666', textAlign: 'center',
                  }}>
                    🏁 Live car positions available during active sessions
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main card ── */}
      <div>
        <div style={{
          backgroundColor: '#111111', border: '1px solid #2A2A2A',
          padding: '1.5rem', marginBottom: '1rem',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{
                fontFamily: '"Bebas Neue", cursive', fontSize: '1.5rem',
                color: '#F0F0F0', margin: 0, letterSpacing: '0.05em',
              }}>
                TRACK MAP
              </h2>
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.7rem',
                color: '#555555', letterSpacing: '0.05em',
              }}>
                {circuit.name.toUpperCase()}
              </span>
            </div>
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
            {!hasRealPositions && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <div style={{
                  backgroundColor: 'rgba(8,8,8,0.8)', border: '1px solid #2A2A2A',
                  padding: '0.75rem 1.25rem', fontFamily: 'Inter, sans-serif',
                  fontSize: '0.8rem', color: '#666', textAlign: 'center',
                }}>
                  🏁 Live car positions available during active sessions
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Driver legend ── */}
        <div style={{
          backgroundColor: '#111111', border: '1px solid #2A2A2A', padding: '1rem',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '0.5rem',
          }}>
            {displayDrivers.slice(0, 20).map((driver) => {
              const teamColor = driver.team_colour
                ? `#${driver.team_colour}`
                : getTeamColor(driver.team_name)
              return (
                <div
                  key={driver.driver_number}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.375rem 0.5rem',
                    backgroundColor: '#0D0D0D', border: '1px solid #1A1A1A',
                    borderLeft: `3px solid ${teamColor}`,
                  }}
                >
                  <span style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '0.75rem',
                    fontWeight: 700, color: '#F0F0F0', minWidth: '28px',
                  }}>
                    {driver.name_acronym}
                  </span>
                  <span style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#666666',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
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
