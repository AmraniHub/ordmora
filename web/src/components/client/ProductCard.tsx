'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, Star, Check } from 'lucide-react'
import type { Product } from '@/types'
import { useCart } from '@/context/CartContext'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function handleAddToCart() {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {/* Image */}
      <div className="relative aspect-square bg-[var(--bg-card-hover)]">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🧴</div>
        )}
        {/* Points badge */}
        <div
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold points-glow"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          <Star size={10} fill="currentColor" />
          {product.points_value} pts
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm leading-tight truncate">{product.name}</h3>
        <p className="text-[var(--accent)] font-bold mt-1">{product.price} DH</p>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full mt-2 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          style={{
            background: product.stock === 0
              ? 'var(--border)'
              : added
              ? 'var(--success)'
              : 'var(--primary)',
            color: product.stock === 0 ? 'var(--text-muted)' : '#fff',
          }}
        >
          {product.stock === 0 ? (
            'Rupture de stock'
          ) : added ? (
            <><Check size={14} /> Ajouté !</>
          ) : (
            <><ShoppingCart size={14} /> Ajouter au panier</>
          )}
        </button>
      </div>
    </div>
  )
}
