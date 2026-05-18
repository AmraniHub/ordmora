'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Star } from 'lucide-react'

interface Props {
  points: number
  name: string
  soonExpiring: number
}

export default function WalletCard({ points, name, soonExpiring }: Props) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (points === 0) return
    const duration = 1200 // ms
    const start = performance.now()

    function tick(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * points))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [points])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl p-6 mb-6 relative overflow-hidden points-glow"
      style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #4F46E5 100%)' }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
        style={{ background: '#fff' }}
      />
      <div
        className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10"
        style={{ background: '#fff' }}
      />

      <p className="text-white/70 text-sm font-medium mb-1">Mes points</p>
      <div className="flex items-end gap-2">
        <span className="text-6xl font-black text-white tabular-nums">
          {displayed}
        </span>
        <div className="mb-2 flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
          <Star size={12} fill="white" className="text-white" />
          <span className="text-white text-xs font-semibold">pts</span>
        </div>
      </div>
      <p className="text-white/60 text-xs mt-1">{name}</p>

      {soonExpiring > 0 && (
        <div className="mt-3 bg-white/20 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <p className="text-white text-xs">
            <strong>{soonExpiring} points</strong> expirent dans moins de 30 jours
          </p>
        </div>
      )}
    </motion.div>
  )
}
