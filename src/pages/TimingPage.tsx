import TimingTower from '../components/timing/TimingTower'
import { useDrivers, useTimingData } from '../hooks/useOpenF1'
import type { Session } from '../hooks/useOpenF1'

interface TimingPageProps {
  session: Session | null
  sessionLoading: boolean
}

export default function TimingPage({ session, sessionLoading }: TimingPageProps) {
  const drivers = useDrivers(session?.session_key ?? null)
  const { intervals, lastLaps, stints } = useTimingData(session?.session_key ?? null, 5000)

  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <h2
          style={{
            fontFamily: '"Bebas Neue", cursive',
            fontSize: '2rem',
            color: '#F0F0F0',
            margin: 0,
            letterSpacing: '0.05em',
          }}
        >
          {session ? `${session.meeting_name} · ${session.session_type}` : 'LIVE TIMING'}
        </h2>
        {session && (
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.7rem',
              color: '#666666',
              backgroundColor: '#1A1A1A',
              padding: '0.25rem 0.625rem',
              border: '1px solid #2A2A2A',
            }}
          >
            {session.circuit_short_name?.toUpperCase() || session.location?.toUpperCase()}
          </span>
        )}
      </div>
      <TimingTower
        drivers={drivers}
        intervals={intervals}
        lastLaps={lastLaps}
        stints={stints}
        loading={sessionLoading}
      />
    </div>
  )
}
