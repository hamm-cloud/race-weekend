import TrackMap from '../components/track/TrackMap'
import { useDrivers, useCarPositions } from '../hooks/useOpenF1'
import type { Session } from '../hooks/useOpenF1'

interface TrackPageProps {
  session: Session | null
  isLive: boolean
}

export default function TrackPage({ session, isLive }: TrackPageProps) {
  const drivers = useDrivers(session?.session_key ?? null)
  const carPositions = useCarPositions(session?.session_key ?? null, isLive ? 2000 : 0)

  return (
    <TrackMap
      drivers={drivers}
      carPositions={carPositions}
      loading={!session}
      hasSession={!!session}
      isLive={isLive}
      circuitKey={session?.circuit_key ?? null}
    />
  )
}
