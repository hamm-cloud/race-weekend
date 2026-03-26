import { AnimatePresence, motion } from 'framer-motion'
import DriverRow from './DriverRow'
import type { Driver, Interval, Lap, Stint } from '../../hooks/useOpenF1'

interface TimingTowerProps {
  drivers: Driver[]
  intervals: Map<number, Interval>
  lastLaps: Map<number, Lap>
  stints: Map<number, Stint>
  loading: boolean
}

// 2026 driver lineup mock data
const MOCK_DRIVERS: Driver[] = [
  { driver_number: 1, broadcast_name: 'L.NORRIS', full_name: 'Lando Norris', name_acronym: 'NOR', team_name: 'McLaren', team_colour: 'F47600', country_code: 'GBR', headshot_url: '', session_key: 0 },
  { driver_number: 81, broadcast_name: 'O.PIASTRI', full_name: 'Oscar Piastri', name_acronym: 'PIA', team_name: 'McLaren', team_colour: 'F47600', country_code: 'AUS', headshot_url: '', session_key: 0 },
  { driver_number: 3, broadcast_name: 'M.VERSTAPPEN', full_name: 'Max Verstappen', name_acronym: 'VER', team_name: 'Red Bull Racing', team_colour: '4781D7', country_code: 'NED', headshot_url: '', session_key: 0 },
  { driver_number: 6, broadcast_name: 'I.HADJAR', full_name: 'Isack Hadjar', name_acronym: 'HAD', team_name: 'Red Bull Racing', team_colour: '4781D7', country_code: 'FRA', headshot_url: '', session_key: 0 },
  { driver_number: 5, broadcast_name: 'G.BORTOLETO', full_name: 'Gabriel Bortoleto', name_acronym: 'BOR', team_name: 'Audi', team_colour: 'F50537', country_code: 'BRA', headshot_url: '', session_key: 0 },
  { driver_number: 27, broadcast_name: 'N.HULKENBERG', full_name: 'Nico Hülkenberg', name_acronym: 'HUL', team_name: 'Audi', team_colour: 'F50537', country_code: 'DEU', headshot_url: '', session_key: 0 },
  { driver_number: 10, broadcast_name: 'P.GASLY', full_name: 'Pierre Gasly', name_acronym: 'GAS', team_name: 'Alpine', team_colour: '00A1E8', country_code: 'FRA', headshot_url: '', session_key: 0 },
  { driver_number: 43, broadcast_name: 'F.COLAPINTO', full_name: 'Franco Colapinto', name_acronym: 'COL', team_name: 'Alpine', team_colour: '00A1E8', country_code: 'ARG', headshot_url: '', session_key: 0 },
  { driver_number: 11, broadcast_name: 'S.PEREZ', full_name: 'Sergio Pérez', name_acronym: 'PER', team_name: 'Cadillac', team_colour: '909090', country_code: 'MEX', headshot_url: '', session_key: 0 },
  { driver_number: 77, broadcast_name: 'V.BOTTAS', full_name: 'Valtteri Bottas', name_acronym: 'BOT', team_name: 'Cadillac', team_colour: '909090', country_code: 'FIN', headshot_url: '', session_key: 0 },
  { driver_number: 12, broadcast_name: 'A.ANTONELLI', full_name: 'Andrea Kimi Antonelli', name_acronym: 'ANT', team_name: 'Mercedes', team_colour: '00D7B6', country_code: 'ITA', headshot_url: '', session_key: 0 },
  { driver_number: 63, broadcast_name: 'G.RUSSELL', full_name: 'George Russell', name_acronym: 'RUS', team_name: 'Mercedes', team_colour: '00D7B6', country_code: 'GBR', headshot_url: '', session_key: 0 },
  { driver_number: 14, broadcast_name: 'F.ALONSO', full_name: 'Fernando Alonso', name_acronym: 'ALO', team_name: 'Aston Martin', team_colour: '229971', country_code: 'ESP', headshot_url: '', session_key: 0 },
  { driver_number: 18, broadcast_name: 'L.STROLL', full_name: 'Lance Stroll', name_acronym: 'STR', team_name: 'Aston Martin', team_colour: '229971', country_code: 'CAN', headshot_url: '', session_key: 0 },
  { driver_number: 16, broadcast_name: 'C.LECLERC', full_name: 'Charles Leclerc', name_acronym: 'LEC', team_name: 'Ferrari', team_colour: 'ED1131', country_code: 'MON', headshot_url: '', session_key: 0 },
  { driver_number: 44, broadcast_name: 'L.HAMILTON', full_name: 'Lewis Hamilton', name_acronym: 'HAM', team_name: 'Ferrari', team_colour: 'ED1131', country_code: 'GBR', headshot_url: '', session_key: 0 },
  { driver_number: 23, broadcast_name: 'A.ALBON', full_name: 'Alexander Albon', name_acronym: 'ALB', team_name: 'Williams', team_colour: '1868DB', country_code: 'THA', headshot_url: '', session_key: 0 },
  { driver_number: 55, broadcast_name: 'C.SAINZ', full_name: 'Carlos Sainz', name_acronym: 'SAI', team_name: 'Williams', team_colour: '1868DB', country_code: 'ESP', headshot_url: '', session_key: 0 },
  { driver_number: 30, broadcast_name: 'L.LAWSON', full_name: 'Liam Lawson', name_acronym: 'LAW', team_name: 'Racing Bulls', team_colour: '6C98FF', country_code: 'NZL', headshot_url: '', session_key: 0 },
  { driver_number: 41, broadcast_name: 'J.LINDBLAD', full_name: 'Jack Lindblad', name_acronym: 'LIN', team_name: 'Racing Bulls', team_colour: '6C98FF', country_code: 'GBR', headshot_url: '', session_key: 0 },
  { driver_number: 31, broadcast_name: 'E.OCON', full_name: 'Esteban Ocon', name_acronym: 'OCO', team_name: 'Haas F1 Team', team_colour: '9C9FA2', country_code: 'FRA', headshot_url: '', session_key: 0 },
  { driver_number: 87, broadcast_name: 'O.BEARMAN', full_name: 'Oliver Bearman', name_acronym: 'BEA', team_name: 'Haas F1 Team', team_colour: '9C9FA2', country_code: 'GBR', headshot_url: '', session_key: 0 },
]

const MOCK_LAPS: Map<number, Lap> = new Map([
  [1, { driver_number: 1, lap_number: 12, lap_duration: 91.234, i1_speed: null, i2_speed: null, st_speed: null, date_start: '', duration_sector_1: 28.1, duration_sector_2: 37.5, duration_sector_3: 25.6, is_pit_out_lap: false, meeting_key: 0, session_key: 0, segments_sector_1: null, segments_sector_2: null, segments_sector_3: null }],
  [81, { driver_number: 81, lap_number: 12, lap_duration: 91.456, i1_speed: null, i2_speed: null, st_speed: null, date_start: '', duration_sector_1: 28.3, duration_sector_2: 37.6, duration_sector_3: 25.6, is_pit_out_lap: false, meeting_key: 0, session_key: 0, segments_sector_1: null, segments_sector_2: null, segments_sector_3: null }],
  [3, { driver_number: 3, lap_number: 12, lap_duration: 91.789, i1_speed: null, i2_speed: null, st_speed: null, date_start: '', duration_sector_1: 28.5, duration_sector_2: 37.7, duration_sector_3: 25.6, is_pit_out_lap: false, meeting_key: 0, session_key: 0, segments_sector_1: null, segments_sector_2: null, segments_sector_3: null }],
  [16, { driver_number: 16, lap_number: 12, lap_duration: 92.012, i1_speed: null, i2_speed: null, st_speed: null, date_start: '', duration_sector_1: 28.6, duration_sector_2: 37.8, duration_sector_3: 25.6, is_pit_out_lap: false, meeting_key: 0, session_key: 0, segments_sector_1: null, segments_sector_2: null, segments_sector_3: null }],
  [44, { driver_number: 44, lap_number: 12, lap_duration: 92.234, i1_speed: null, i2_speed: null, st_speed: null, date_start: '', duration_sector_1: 28.7, duration_sector_2: 37.9, duration_sector_3: 25.6, is_pit_out_lap: false, meeting_key: 0, session_key: 0, segments_sector_1: null, segments_sector_2: null, segments_sector_3: null }],
])

const MOCK_INTERVALS: Map<number, Interval> = new Map([
  [1, { driver_number: 1, date: '', meeting_key: 0, session_key: 0, gap_to_leader: 0, interval: 0 }],
  [81, { driver_number: 81, date: '', meeting_key: 0, session_key: 0, gap_to_leader: 0.222, interval: 0.222 }],
  [3, { driver_number: 3, date: '', meeting_key: 0, session_key: 0, gap_to_leader: 0.555, interval: 0.333 }],
  [16, { driver_number: 16, date: '', meeting_key: 0, session_key: 0, gap_to_leader: 2.341, interval: 1.786 }],
  [44, { driver_number: 44, date: '', meeting_key: 0, session_key: 0, gap_to_leader: 4.123, interval: 1.782 }],
])

const MOCK_STINTS: Map<number, Stint> = new Map([
  [1, { driver_number: 1, stint_number: 1, lap_start: 1, lap_end: 12, compound: 'MEDIUM', tyre_age_at_start: 0, meeting_key: 0, session_key: 0 }],
  [81, { driver_number: 81, stint_number: 1, lap_start: 1, lap_end: 12, compound: 'MEDIUM', tyre_age_at_start: 0, meeting_key: 0, session_key: 0 }],
  [3, { driver_number: 3, stint_number: 1, lap_start: 1, lap_end: 12, compound: 'SOFT', tyre_age_at_start: 0, meeting_key: 0, session_key: 0 }],
  [16, { driver_number: 16, stint_number: 1, lap_start: 1, lap_end: 12, compound: 'HARD', tyre_age_at_start: 0, meeting_key: 0, session_key: 0 }],
  [44, { driver_number: 44, stint_number: 1, lap_start: 1, lap_end: 12, compound: 'SOFT', tyre_age_at_start: 0, meeting_key: 0, session_key: 0 }],
])

export default function TimingTower({ drivers, intervals, lastLaps, stints, loading }: TimingTowerProps) {
  const useMock = drivers.length === 0

  const displayDrivers = useMock ? MOCK_DRIVERS : drivers
  const displayIntervals = useMock ? MOCK_INTERVALS : intervals
  const displayLaps = useMock ? MOCK_LAPS : lastLaps
  const displayStints = useMock ? MOCK_STINTS : stints

  // Sort drivers by gap_to_leader
  const sortedDrivers = [...displayDrivers].sort((a, b) => {
    const aGap = displayIntervals.get(a.driver_number)?.gap_to_leader ?? Infinity
    const bGap = displayIntervals.get(b.driver_number)?.gap_to_leader ?? Infinity
    return aGap - bGap
  })

  // Find best lap time
  let bestLapTime: number | null = null
  displayLaps.forEach((lap) => {
    if (lap.lap_duration != null) {
      if (bestLapTime === null || lap.lap_duration < bestLapTime) {
        bestLapTime = lap.lap_duration
      }
    }
  })

  return (
    <div>
      {/* Column headers */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.5rem 0',
          borderBottom: '1px solid #2A2A2A',
          marginBottom: '0',
          minWidth: '580px',
        }}
      >
        <div style={{ width: '3px', flexShrink: 0 }} />
        <div style={{ width: '52px', paddingLeft: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#444444', fontWeight: 600, letterSpacing: '0.1em' }}>POS</div>
        <div style={{ width: '52px', fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#444444', fontWeight: 600, letterSpacing: '0.1em' }}>DRV</div>
        <div style={{ flex: 1, fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#444444', fontWeight: 600, letterSpacing: '0.1em' }}>NAME</div>
        <div style={{ width: '130px', fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#444444', fontWeight: 600, letterSpacing: '0.1em' }}>TEAM</div>
        <div style={{ width: '90px', fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#444444', fontWeight: 600, letterSpacing: '0.1em', textAlign: 'right', paddingRight: '1rem' }}>GAP</div>
        <div style={{ width: '100px', fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#444444', fontWeight: 600, letterSpacing: '0.1em', textAlign: 'right', paddingRight: '0.75rem' }}>LAST LAP</div>
        <div style={{ width: '48px', fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#444444', fontWeight: 600, letterSpacing: '0.1em', textAlign: 'center' }}>TYR</div>
      </div>

      {loading && drivers.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666666', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' }}>
          Loading session data...
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <AnimatePresence>
            {sortedDrivers.map((driver, index) => (
              <DriverRow
                key={driver.driver_number}
                position={index + 1}
                driver={driver}
                interval={displayIntervals.get(driver.driver_number)}
                lastLap={displayLaps.get(driver.driver_number)}
                stint={displayStints.get(driver.driver_number)}
                bestLapTime={bestLapTime}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {useMock && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderLeft: '3px solid #666666',
          }}
        >
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#666666', margin: 0 }}>
            Showing 2026 demo data — live data will appear when a session is active. Next: Japan GP qualifying Saturday 16:00 AEST.
          </p>
        </motion.div>
      )}
    </div>
  )
}
