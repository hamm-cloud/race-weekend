import { motion, AnimatePresence } from 'framer-motion'
import { getTeamColor } from '../../lib/teamColors'
import type { Driver } from '../../hooks/useOpenF1'

interface TrackMapProps {
  drivers: Driver[]
  carPositions: Map<number, { x: number; y: number }>
  loading?: boolean
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
const MOCK_POSITIONS = new Map([
  [1, { x: -1000, y: 500 }],
  [4, { x: -800, y: 600 }],
  [16, { x: -600, y: 700 }],
  [44, { x: -400, y: 800 }],
  [81, { x: -200, y: 900 }],
  [55, { x: 0, y: 1000 }],
  [63, { x: 200, y: 900 }],
  [14, { x: 400, y: 800 }],
  [10, { x: 600, y: 700 }],
  [23, { x: 800, y: 600 }],
])

const MOCK_DRIVERS: Driver[] = [
  { driver_number: 1, broadcast_name: 'M.VERSTAPPEN', full_name: 'Max Verstappen', name_acronym: 'VER', team_name: 'Red Bull Racing', team_colour: '3671C6', country_code: 'NED', headshot_url: '', session_key: 0 },
  { driver_number: 4, broadcast_name: 'L.NORRIS', full_name: 'Lando Norris', name_acronym: 'NOR', team_name: 'McLaren', team_colour: 'FF8000', country_code: 'GBR', headshot_url: '', session_key: 0 },
  { driver_number: 16, broadcast_name: 'C.LECLERC', full_name: 'Charles Leclerc', name_acronym: 'LEC', team_name: 'Ferrari', team_colour: 'E8002D', country_code: 'MON', headshot_url: '', session_key: 0 },
  { driver_number: 44, broadcast_name: 'L.HAMILTON', full_name: 'Lewis Hamilton', name_acronym: 'HAM', team_name: 'Ferrari', team_colour: 'E8002D', country_code: 'GBR', headshot_url: '', session_key: 0 },
  { driver_number: 81, broadcast_name: 'O.PIASTRI', full_name: 'Oscar Piastri', name_acronym: 'PIA', team_name: 'McLaren', team_colour: 'FF8000', country_code: 'AUS', headshot_url: '', session_key: 0 },
  { driver_number: 55, broadcast_name: 'C.SAINZ', full_name: 'Carlos Sainz', name_acronym: 'SAI', team_name: 'Williams', team_colour: '64C4FF', country_code: 'ESP', headshot_url: '', session_key: 0 },
  { driver_number: 63, broadcast_name: 'G.RUSSELL', full_name: 'George Russell', name_acronym: 'RUS', team_name: 'Mercedes', team_colour: '00D2BE', country_code: 'GBR', headshot_url: '', session_key: 0 },
  { driver_number: 14, broadcast_name: 'F.ALONSO', full_name: 'Fernando Alonso', name_acronym: 'ALO', team_name: 'Aston Martin', team_colour: '358C75', country_code: 'ESP', headshot_url: '', session_key: 0 },
  { driver_number: 10, broadcast_name: 'P.GASLY', full_name: 'Pierre Gasly', name_acronym: 'GAS', team_name: 'Alpine', team_colour: 'FF87BC', country_code: 'FRA', headshot_url: '', session_key: 0 },
  { driver_number: 23, broadcast_name: 'A.ALBON', full_name: 'Alexander Albon', name_acronym: 'ALB', team_name: 'Williams', team_colour: '64C4FF', country_code: 'THA', headshot_url: '', session_key: 0 },
]

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

export default function TrackMap({ drivers, carPositions }: TrackMapProps) {
  const useMock = carPositions.size === 0 || drivers.length === 0
  const displayPositions = useMock ? MOCK_POSITIONS : carPositions
  const displayDrivers = useMock ? MOCK_DRIVERS : drivers

  const driverMap = new Map<number, Driver>()
  displayDrivers.forEach(d => driverMap.set(d.driver_number, d))

  const { normalized } = normalizePositions(displayPositions)

  return (
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
              DEMO MODE
            </span>
          )}
        </div>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg
            viewBox="0 0 800 600"
            style={{
              width: '100%',
              maxWidth: '800px',
              height: 'auto',
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
  )
}
