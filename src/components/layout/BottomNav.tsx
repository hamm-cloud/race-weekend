import { Timer, Map, BarChart2, Calendar, Users } from 'lucide-react'

type Tab = 'timing' | 'track' | 'standings' | 'schedule' | 'drivers'

interface NavItem {
  key: Tab
  label: string
  icon: React.ComponentType<{ size?: number; color?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { key: 'timing', label: 'Timing', icon: Timer },
  { key: 'track', label: 'Track', icon: Map },
  { key: 'standings', label: 'Standings', icon: BarChart2 },
  { key: 'schedule', label: 'Schedule', icon: Calendar },
  { key: 'drivers', label: 'Drivers', icon: Users },
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
              gap: '3px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <Icon size={20} color={isActive ? '#E8002D' : '#555'} />
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '9px',
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
