export function formatLapTime(seconds: number | null | undefined): string {
  if (seconds == null || isNaN(seconds)) return '—'
  const mins = Math.floor(seconds / 60)
  const secs = (seconds % 60).toFixed(3).padStart(6, '0')
  if (mins > 0) return `${mins}:${secs}`
  return `${secs}s`
}

export function formatGap(gap: number | null | undefined): string {
  if (gap == null || isNaN(gap)) return '—'
  if (gap === 0) return '—'
  return `+${gap.toFixed(3)}`
}

export function formatCountdown(targetDate: Date): string {
  const now = new Date()
  const diff = targetDate.getTime() - now.getTime()
  if (diff <= 0) return 'Started'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getSessionTypeLabel(sessionType: string): string {
  const map: Record<string, string> = {
    'Race': 'RACE',
    'Qualifying': 'QUALI',
    'Sprint': 'SPRINT',
    'Sprint Qualifying': 'SPRINT Q',
    'Practice 1': 'FP1',
    'Practice 2': 'FP2',
    'Practice 3': 'FP3',
  }
  return map[sessionType] ?? sessionType.toUpperCase()
}

export function getSessionTypeColor(sessionType: string): string {
  if (sessionType === 'Race') return '#E8002D'
  if (sessionType === 'Qualifying') return '#9B59B6'
  if (sessionType.includes('Sprint')) return '#FF8000'
  return '#666666'
}
