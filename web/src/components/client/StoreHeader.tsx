import { Star } from 'lucide-react'

export default function StoreHeader({ name, points }: { name: string; points: number }) {
  const initial = name ? name.charAt(0).toUpperCase() : 'O'

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Nos Produits</h1>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Achetez et gagnez des points</p>
      </div>
      <a href="/wallet" className="flex items-center gap-2">
        <div className="text-right">
          <p className="text-xs text-[var(--text-muted)]">Mes points</p>
          <p className="text-sm font-bold flex items-center gap-1 justify-end" style={{ color: 'var(--primary-light)' }}>
            <Star size={12} fill="currentColor" /> {points}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          {initial}
        </div>
      </a>
    </div>
  )
}
