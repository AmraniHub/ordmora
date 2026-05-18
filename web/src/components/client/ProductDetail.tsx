'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, Minus, Plus, ShoppingCart, Check, ArrowLeft } from 'lucide-react'
import type { Product } from '@/types'
import { useCart } from '@/context/CartContext'

export default function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const inStock = product.stock > 0

  function handleAddToCart() {
    if (!inStock) return
    for (let i = 0; i < qty; i++) {
      addItem(product)
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  function decrement() {
    setQty(prev => Math.max(1, prev - 1))
  }

  function increment() {
    setQty(prev => Math.min(product.stock, prev + 1))
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-8">
      {/* Back link */}
      <a
        href="/store"
        className="inline-flex items-center gap-1.5 text-sm mb-4 transition-opacity hover:opacity-70"
        style={{ color: 'var(--text-muted)' }}
      >
        <ArrowLeft size={16} />
        Retour
      </a>

      {/* Product image */}
      <div
        className="relative w-full rounded-2xl overflow-hidden mb-5"
        style={{
          aspectRatio: '1 / 1',
          background: 'var(--bg-card-hover)',
          border: '1px solid var(--border)',
        }}
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl">🧴</div>
        )}
      </div>

      {/* Content card */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {/* Name + category badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-2xl font-black leading-tight" style={{ color: 'var(--text)' }}>
            {product.name}
          </h1>
          <span
            className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold capitalize"
            style={{ background: 'var(--bg-card-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            {product.category}
          </span>
        </div>

        {/* Price + points row */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
            {product.price} DH
          </span>
          <span
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            <Star size={11} fill="currentColor" />
            {product.points_value} pts gagnés
          </span>
        </div>

        {/* Description */}
        {product.description && (
          <p
            className="text-sm leading-relaxed mb-4"
            style={{ color: 'var(--text-muted)' }}
          >
            {product.description}
          </p>
        )}

        {/* Stock indicator */}
        <div className="flex items-center gap-2 mb-5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: inStock ? 'var(--success)' : 'var(--danger)' }}
          />
          <span
            className="text-sm font-medium"
            style={{ color: inStock ? 'var(--success)' : 'var(--danger)' }}
          >
            {inStock ? `En stock (${product.stock})` : 'Rupture de stock'}
          </span>
        </div>

        {/* Quantity selector */}
        {inStock && (
          <>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Quantité
              </span>
              <div
                className="flex items-center rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--border)', background: 'var(--bg-card-hover)' }}
              >
                <button
                  onClick={decrement}
                  disabled={qty <= 1}
                  className="w-9 h-9 flex items-center justify-center transition-opacity"
                  style={{ color: qty <= 1 ? 'var(--border)' : 'var(--text)' }}
                  aria-label="Diminuer la quantité"
                >
                  <Minus size={16} />
                </button>
                <span
                  className="w-10 text-center text-sm font-bold"
                  style={{ color: 'var(--text)' }}
                >
                  {qty}
                </span>
                <button
                  onClick={increment}
                  disabled={qty >= product.stock}
                  className="w-9 h-9 flex items-center justify-center transition-opacity"
                  style={{ color: qty >= product.stock ? 'var(--border)' : 'var(--text)' }}
                  aria-label="Augmenter la quantité"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Subtotal */}
            <div
              className="flex items-center justify-between px-4 py-2.5 rounded-xl mb-4"
              style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border)' }}
            >
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Total</span>
              <span className="font-bold" style={{ color: 'var(--accent)' }}>
                {(qty * product.price).toFixed(2)} DH
              </span>
            </div>
          </>
        )}

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock || added}
          className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm"
          style={{
            background: !inStock
              ? 'var(--border)'
              : added
              ? 'var(--success)'
              : 'var(--primary)',
            color: !inStock ? 'var(--text-muted)' : '#fff',
          }}
        >
          {!inStock ? (
            'Rupture de stock'
          ) : added ? (
            <>
              <Check size={16} />
              Ajouté ✓
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              Ajouter au panier
            </>
          )}
        </button>
      </div>
    </div>
  )
}
