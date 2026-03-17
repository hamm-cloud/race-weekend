import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/layout/Header'
import Layout from './components/layout/Layout'
import TimingPage from './pages/TimingPage'
import TrackPage from './pages/TrackPage'
import SchedulePage from './pages/SchedulePage'
import { useLatestSession } from './hooks/useOpenF1'

type Tab = 'timing' | 'track' | 'schedule'

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('timing')
  const { session, loading: sessionLoading, isLive } = useLatestSession()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080808' }}>
      <Header
        session={session}
        isLive={isLive}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <Layout>
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
              <TimingPage session={session} sessionLoading={sessionLoading} />
            )}
            {activeTab === 'track' && (
              <TrackPage session={session} />
            )}
            {activeTab === 'schedule' && (
              <SchedulePage />
            )}
          </motion.div>
        </AnimatePresence>
      </Layout>
    </div>
  )
}
