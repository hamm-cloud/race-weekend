import { motion } from 'framer-motion'
import TyreBadge from '../ui/TyreBadge'
import Flag from '../ui/Flag'
import { getTeamColor } from '../../lib/teamColors'
import { formatLapTime, formatGap } from '../../lib/utils'
import type { Driver, Interval, Lap, Stint } from '../../hooks/useOpenF1'

interface DriverRowProps {
  position: number
  driver: Driver
  interval: Interval | undefined
  lastLap: Lap | undefined
  stint: Stint | undefined
  bestLapTime: number | null
}

export default function DriverRow({ position, driver, interval, lastLap, stint, bestLapTime }: DriverRowProps) {
  const teamColor = driver.team_colour ? `#${driver.team_colour}` : getTeamColor(driver.team_name)
  const lapDuration = lastLap?.lap_duration ?? null

  const isPersonalBest = lapDuration != null && lapDuration === bestLapTime
  const lapTimeColor = isPersonalBest ? '#9B59B6' : '#F0F0F0'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#111111',
        borderBottom: '1px solid #2A2A2A',
        position: 'relative',
        overflow: 'hidden',
        minWidth: '600px',
      }}
    >
      {/* Team colour bar */}
      <div
        style={{
          width: '3px',
          alignSelf: 'stretch',
          backgroundColor: teamColor,
          flexShrink: 0,
        }}
      />

      {/* Position */}
      <div
        style={{
          width: '52px',
          padding: '0.875rem 0.75rem',
          fontFamily: '"Bebas Neue", cursive',
          fontSize: '1.5rem',
          color: position <= 3 ? '#F0F0F0' : '#999999',
          flexShrink: 0,
          textAlign: 'center',
        }}
      >
        {position}
      </div>

      {/* Driver acronym */}
      <div
        style={{
          width: '52px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: '0.875rem',
          color: '#F0F0F0',
          letterSpacing: '0.05em',
          flexShrink: 0,
        }}
      >
        {driver.name_acronym}
      </div>

      {/* Driver full name + flag */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          minWidth: 0,
        }}
      >
        <Flag countryCode={driver.country_code} />
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.8rem',
            color: '#666666',
            fontWeight: 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {driver.full_name}
        </span>
      </div>

      {/* Team name */}
      <div
        style={{
          width: '140px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.7rem',
          color: '#444444',
          fontWeight: 400,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          display: window.innerWidth < 768 ? 'none' : undefined,
        }}
      >
        {driver.team_name}
      </div>

      {/* Gap */}
      <div
        style={{
          width: '90px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.8rem',
          color: '#F0F0F0',
          fontWeight: 500,
          textAlign: 'right',
          flexShrink: 0,
          paddingRight: '1rem',
        }}
      >
        {position === 1
          ? <span style={{ color: '#666666' }}>—</span>
          : <span style={{ color: '#F0F0F0' }}>{formatGap(interval?.gap_to_leader ?? null)}</span>
        }
      </div>

      {/* Last lap */}
      <div
        style={{
          width: '100px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.8rem',
          color: lapTimeColor,
          fontWeight: 500,
          textAlign: 'right',
          flexShrink: 0,
          paddingRight: '0.75rem',
        }}
      >
        {formatLapTime(lapDuration)}
      </div>

      {/* Tyre */}
      <div
        style={{
          width: '48px',
          display: 'flex',
          justifyContent: 'center',
          flexShrink: 0,
          paddingRight: '0.5rem',
        }}
      >
        <TyreBadge compound={stint?.compound} />
      </div>
    </motion.div>
  )
}
