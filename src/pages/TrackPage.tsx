import TrackMap from '../components/track/TrackMap'
import { useDrivers, useCarPositions } from '../hooks/useOpenF1'
import type { Session } from '../hooks/useOpenF1'

interface TrackPageProps {
  session: Session | null
}

export default function TrackPage({ session }: TrackPageProps) {
  const drivers = useDrivers(session?.session_key ?? null)
  const carPositions = useCarPositions(session?.session_key ?? null, 2000)

  return (
    <TrackMap
      drivers={drivers}
      carPositions={carPositions}
      loading={!session}
    />
  )
}
