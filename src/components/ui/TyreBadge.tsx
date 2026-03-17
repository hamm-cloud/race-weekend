interface TyreBadgeProps {
  compound?: string | null
}

const COMPOUND_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  SOFT: { bg: '#E8002D', text: '#FFFFFF', label: 'S' },
  MEDIUM: { bg: '#FFC906', text: '#000000', label: 'M' },
  HARD: { bg: '#E8E8E8', text: '#000000', label: 'H' },
  INTERMEDIATE: { bg: '#39B54A', text: '#FFFFFF', label: 'I' },
  WET: { bg: '#0067FF', text: '#FFFFFF', label: 'W' },
}

export default function TyreBadge({ compound }: TyreBadgeProps) {
  if (!compound) return <span style={{ color: '#666666', fontSize: '0.75rem' }}>—</span>

  const upper = compound.toUpperCase()
  const config = COMPOUND_CONFIG[upper] ?? { bg: '#666666', text: '#FFFFFF', label: compound[0] ?? '?' }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: config.bg,
        color: config.text,
        fontSize: '0.65rem',
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
        flexShrink: 0,
      }}
    >
      {config.label}
    </span>
  )
}
