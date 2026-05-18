'use client'

import { useState } from 'react'
import { Star, ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import CartDrawer from '@/components/client/CartDrawer'

export default function StoreHeader({ name, points }: { name: string; points: number }) {
  const initial = name ? name.charAt(0).toUpperCase() : 'O'
  const { totalItems } = useCart()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Nos Produits</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Achetez et gagnez des points</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Cart button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative w-10 h-10 flex items-center justify-center rounded-full transition-colors"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            aria-label="Ouvrir le panier"
          >
            <ShoppingCart size={18} />
            {totalItems > 0 && (
              <span
                className="absolute -top-1 -right-1 flex items-center justify-center text-[10px] font-bold rounded-full"
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  width: 18,
                  height: 18,
                  minWidth: 18,
                }}
              >
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {/* Avatar / points link */}
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
      </div>

      <CartDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
