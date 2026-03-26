import { Timer, Map, Calendar, BarChart2, ListOrdered, TrendingUp } from 'lucide-react'

type Tab = 'timing' | 'track' | 'schedule' | 'standings' | 'results' | 'strategy'

interface NavItem {
  key: Tab
  label: string
  icon: React.ComponentType<{ size?: number; color?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { key: 'timing', label: 'Timing', icon: Timer },
  { key: 'track', label: 'Track', icon: Map },
  { key: 'schedule', label: 'Schedule', icon: Calendar },
  { key: 'standings', label: 'Standings', icon: BarChart2 },
  { key: 'results', label: 'Results', icon: ListOrdered },
  { key: 'strategy', label: 'Strategy', icon: TrendingUp },
]

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: '#111111',
        borderTop: '1px solid #2A2A2A',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
      }}
    >
      {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
        const isActive = activeTab === key
        return (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <Icon size={18} color={isActive ? '#E8002D' : '#555'} />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '8px',
                color: isActive ? '#E8002D' : '#555',
                letterSpacing: 0,
              }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
