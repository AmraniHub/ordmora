'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Star, MapPin, Phone, FileText, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/context/CartContext'
import Image from 'next/image'

interface ProfileProps {
  id: string
  full_name: string
  phone: string
  city: string
  delivery_address: string
}

export default function CheckoutForm({ profile }: { profile: ProfileProps }) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const { items, totalPrice, totalPoints, clearCart } = useCart()

  const [address, setAddress] = useState(profile.delivery_address ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) {
      setError('Votre panier est vide.')
      return
    }
    if (!address.trim()) {
      setError("L'adresse de livraison est requise.")
      return
    }
    setLoading(true)
    setError(null)

    try {
      // 1. Create the order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          client_id: profile.id,
          total_amount: totalPrice,
          delivery_address: address.trim(),
          notes: notes.trim() || null,
        })
        .select()
        .single()

      if (orderErr || !order) throw orderErr ?? new Error('Erreur lors de la création de la commande')

      // 2. Insert order items
      const orderItems = items.map(({ product, quantity }) => ({
        order_id: order.id,
        product_id: product.id,
        quantity,
        unit_price: product.price,
        points_earned: product.points_value * quantity,
      }))

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
      if (itemsErr) throw itemsErr

      // 3. Decrement stock for each product
      await Promise.all(
        items.map(({ product, quantity }) =>
          supabase
            .from('products')
            .update({ stock: product.stock - quantity })
            .eq('id', product.id)
        )
      )

      // 4. Clear cart
      clearCart()

      // 5. Redirect to success page
      router.push('/order-success?num=' + encodeURIComponent(order.order_number))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue. Veuillez réessayer.'
      setError(message)
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
        <p className="text-4xl mb-3">🛒</p>
        <p className="font-semibold text-lg mb-2">Votre panier est vide</p>
        <a
          href="/store"
          className="text-sm font-medium"
          style={{ color: 'var(--primary-light)' }}
        >
          Retour à la boutique →
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Order summary */}
      <section
        className="rounded-2xl p-4 space-y-3"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h2 className="font-semibold flex items-center gap-2">
          <Package size={16} style={{ color: 'var(--primary-light)' }} />
          Récapitulatif
        </h2>

        <div className="space-y-2">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex items-center gap-3">
              <div
                className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0"
                style={{ background: 'var(--bg-card-hover)' }}
              >
                {product.image_url ? (
                  <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg">🧴</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {quantity} × {product.price} DH
                </p>
              </div>
              <p className="text-sm font-bold shrink-0" style={{ color: 'var(--accent)' }}>
                {(product.price * quantity).toFixed(2)} DH
              </p>
            </div>
          ))}
        </div>

        <div
          className="pt-3 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span style={{ color: 'var(--text-muted)' }} className="text-sm">Total</span>
          <span className="font-bold text-xl" style={{ color: 'var(--accent)' }}>
            {totalPrice.toFixed(2)} DH
          </span>
        </div>

        {/* Points to earn */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: '#7C3AED15' }}
        >
          <Star size={14} fill="currentColor" style={{ color: 'var(--primary-light)' }} />
          <p className="text-xs font-medium" style={{ color: 'var(--primary-light)' }}>
            Vous gagnerez <strong>{totalPoints} points</strong> avec cette commande
          </p>
        </div>
      </section>

      {/* Delivery details */}
      <section
        className="rounded-2xl p-4 space-y-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <h2 className="font-semibold flex items-center gap-2">
          <MapPin size={16} style={{ color: 'var(--primary-light)' }} />
          Livraison
        </h2>

        {/* Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Adresse de livraison *
          </label>
          <textarea
            value={address}
            onChange={e => setAddress(e.target.value)}
            rows={3}
            required
            placeholder="Votre adresse complète..."
            className="w-full rounded-xl px-3 py-2.5 text-sm resize-none outline-none transition-colors"
            style={{
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Phone size={12} />
            Téléphone *
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            placeholder="06 XX XX XX XX"
            className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
            style={{
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <FileText size={12} />
            Notes (optionnel)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Instructions spéciales, code d'accès..."
            className="w-full rounded-xl px-3 py-2.5 text-sm resize-none outline-none transition-colors"
            style={{
              background: 'var(--bg-card-hover)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>
      </section>

      {/* Error message */}
      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{ background: '#EF444415', color: 'var(--danger)', border: '1px solid #EF444430' }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-13 rounded-2xl font-semibold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        style={{
          background: 'var(--primary)',
          color: '#fff',
          opacity: loading ? 0.7 : 1,
          height: '52px',
        }}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Traitement en cours…
          </>
        ) : (
          <>
            Confirmer la commande · {totalPrice.toFixed(2)} DH
          </>
        )}
      </button>
    </form>
  )
}
