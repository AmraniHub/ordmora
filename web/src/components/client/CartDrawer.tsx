'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import Image from 'next/image'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter()
  const { items, removeItem, updateQty, totalPrice, totalItems } = useCart()

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  function handleCheckout() {
    onClose()
    router.push('/checkout')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-transform duration-300 ease-out"
        style={{
          width: 'min(100vw, 400px)',
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} style={{ color: 'var(--primary-light)' }} />
            <h2 className="font-bold text-lg">Mon Panier</h2>
            {totalItems > 0 && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ background: 'var(--bg-card-hover)', color: 'var(--text-muted)' }}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="text-5xl">🛒</div>
              <p className="font-semibold text-lg">Votre panier est vide</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Ajoutez des produits depuis la boutique
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                Voir les produits
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-3 rounded-2xl p-3"
                style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border)' }}
              >
                {/* Product image */}
                <div
                  className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden"
                  style={{ background: 'var(--bg-card)' }}
                >
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🧴</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate">{product.name}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--accent)' }}>
                    {product.price} DH
                  </p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(product.id, quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                      aria-label="Diminuer"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold w-5 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQty(product.id, quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                      style={{ background: 'var(--primary)', color: '#fff' }}
                      aria-label="Augmenter"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Line total + remove */}
                <div className="flex flex-col items-end justify-between shrink-0">
                  <button
                    onClick={() => removeItem(product.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                    style={{ color: 'var(--danger)', background: '#EF444415' }}
                    aria-label="Supprimer"
                  >
                    <Trash2 size={13} />
                  </button>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                    {(product.price * quantity).toFixed(2)} DH
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="px-5 py-4 space-y-3 shrink-0"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-muted)' }} className="text-sm">Sous-total</span>
              <span className="font-bold text-lg" style={{ color: 'var(--accent)' }}>
                {totalPrice.toFixed(2)} DH
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full h-12 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98]"
              style={{ background: 'var(--primary)', color: '#fff' }}
            >
              Commander →
            </button>
          </div>
        )}
      </div>
    </>
  )
}
