'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, Star, Loader2 } from 'lucide-react'
import type { Product } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ProductCard({ product }: { product: Product }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleOrder() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('delivery_address')
        .eq('id', user.id)
        .single()

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          client_id: user.id,
          total_amount: product.price,
          delivery_address: profile?.delivery_address ?? '',
        })
        .select()
        .single()

      if (error) throw error

      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: product.id,
        quantity: 1,
        unit_price: product.price,
        points_earned: product.points_value,
      })

      router.push(`/orders`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
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
          onClick={handleOrder}
          disabled={loading || product.stock === 0}
          className="w-full mt-2 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          style={{
            background: product.stock === 0 ? 'var(--border)' : 'var(--primary)',
            color: product.stock === 0 ? 'var(--text-muted)' : '#fff',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : product.stock === 0 ? (
            'Rupture de stock'
          ) : (
            <><ShoppingCart size={14} /> Commander</>
          )}
        </button>
      </div>
    </div>
  )
}
