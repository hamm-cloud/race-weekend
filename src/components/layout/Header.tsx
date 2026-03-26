import { Flag } from 'lucide-react'
import LiveBadge from '../ui/LiveBadge'
import { useIsMobile } from '../../hooks/useIsMobile'
import type { Session } from '../../hooks/useOpenF1'
import type { Tab } from '../../App'

interface HeaderProps {
  session: Session | null
  isLive: boolean
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'timing', label: 'TIMING' },
  { key: 'track', label: 'TRACK' },
  { key: 'schedule', label: 'SCHEDULE' },
  { key: 'standings', label: 'STANDINGS' },
  { key: 'results', label: 'RESULTS' },
  { key: 'strategy', label: 'STRATEGY' },
]

export default function Header({ session, isLive, activeTab, onTabChange }: HeaderProps) {
  const isMobile = useIsMobile()

  return (
    <header
      style={{
        backgroundColor: '#111111',
        borderBottom: '1px solid #2A2A2A',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flag size={18} color="#E8002D" />
            <div>
              <div
                style={{
                  fontFamily: '"Bebas Neue", cursive',
                  fontSize: '1.75rem',
                  letterSpacing: '0.08em',
                  color: '#F0F0F0',
                  lineHeight: 1,
                }}
              >
                RACE WEEKEND
              </div>
              {session && (
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.7rem',
                    color: '#666666',
                    fontWeight: 400,
                    lineHeight: 1.2,
                    marginTop: '1px',
                  }}
                >
                  {session.meeting_name} · {session.session_type}
                </div>
              )}
            </div>
          </div>

          {/* Nav tabs — hidden on mobile (BottomNav handles it) */}
          <nav style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: '0', overflowX: 'auto' }}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                style={{
                  padding: '0 1rem',
                  height: '64px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab.key ? '2px solid #F0F0F0' : '2px solid transparent',
                  color: activeTab === tab.key ? '#F0F0F0' : '#666666',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  transition: 'color 0.15s, border-color 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Live badge */}
          <div style={{ minWidth: '80px', display: 'flex', justifyContent: 'flex-end' }}>
            <LiveBadge isLive={isLive} />
          </div>
        </div>
      </div>
    </header>
  )
}
