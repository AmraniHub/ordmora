'use client'

import { motion } from 'motion/react'

const COLORS = [
  '#7C3AED', // primary purple
  '#A78BFA', // primary-light
  '#F97316', // accent orange
  '#10B981', // success green
  '#FACC15', // yellow
]

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  color: COLORS[i % COLORS.length],
  x: random(-120, 120),
  y: random(-120, 120),
  rotate: random(-180, 180),
  size: random(6, 12),
}))

export default function Confetti() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
      aria-hidden="true"
    >
      {PARTICLES.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, scale: 1, opacity: 0, rotate: p.rotate }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  )
}
