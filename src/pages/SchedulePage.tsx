import Schedule from '../components/schedule/Schedule'
import { useSessions } from '../hooks/useOpenF1'

export default function SchedulePage() {
  const { sessions, loading } = useSessions(2026)

  return (
    <Schedule sessions={sessions} loading={loading} />
  )
}
