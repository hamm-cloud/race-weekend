import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/layout/Header'
import Layout from './components/layout/Layout'
import BottomNav from './components/layout/BottomNav'
import TimingPage from './pages/TimingPage'
import TrackPage from './pages/TrackPage'
import SchedulePage from './pages/SchedulePage'
import StandingsPage from './pages/StandingsPage'
import ResultsPage from './pages/ResultsPage'
import StrategyPage from './pages/StrategyPage'
import TelemetryPage from './pages/TelemetryPage'
import { useLatestSession } from './hooks/useOpenF1'
import { useIsMobile } from './hooks/useIsMobile'

export type Tab = 'timing' | 'track' | 'schedule' | 'standings' | 'results' | 'strategy' | 'telemetry'

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('timing')
  const { session, loading: sessionLoading, isLive } = useLatestSession()
  const isMobile = useIsMobile()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080808' }}>
      <Header
        session={session}
        isLive={isLive}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <Layout>
        <div style={{ paddingBottom: isMobile ? '70px' : '0' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={PAGE_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'timing' && (
                <TimingPage session={session} sessionLoading={sessionLoading} isLive={isLive} />
              )}
              {activeTab === 'track' && (
                <TrackPage session={session} isLive={isLive} />
              )}
              {activeTab === 'schedule' && (
                <SchedulePage />
              )}
              {activeTab === 'standings' && (
                <StandingsPage />
              )}
              {activeTab === 'results' && (
                <ResultsPage />
              )}
              {activeTab === 'strategy' && (
                <StrategyPage session={session} />
              )}
              {activeTab === 'telemetry' && (
                <TelemetryPage session={session} sessionLoading={sessionLoading} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Layout>
      {isMobile && (
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  )
}
