import { motion } from 'framer-motion'

interface LiveBadgeProps {
  isLive: boolean
}

export default function LiveBadge({ isLive }: LiveBadgeProps) {
  if (!isLive) return null

  return (
    <div className="flex items-center gap-1.5">
      <motion.div
        className="w-2 h-2 rounded-full bg-[#E8002D]"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span
        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.1em', color: '#E8002D' }}
      >
        LIVE
      </span>
    </div>
  )
}
