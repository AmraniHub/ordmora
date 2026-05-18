'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Truck, Clock, XCircle, Loader2 } from 'lucide-react'
import type { Order } from '@/types'

const statusConfig = {
  en_attente: { icon: Clock,         color: 'var(--warning)', label: 'Commande reçue',     bg: '#F59E0B20' },
  en_cours:   { icon: Truck,         color: 'var(--accent)',  label: 'Livraison en cours',  bg: '#F9731620' },
  livree:     { icon: CheckCircle2,  color: 'var(--success)', label: 'Marchandise livrée',  bg: '#10B98120' },
  annulee:    { icon: XCircle,       color: 'var(--danger)',  label: 'Annulée',             bg: '#EF444420' },
}

interface Props {
  initialOrders: Order[]
  userId: string
}

export default function OrdersRealtime({ initialOrders, userId }: Props) {
  const [supabase] = useState(() => createClient())
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel('orders-' + userId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: 'client_id=eq.' + userId,
        },
        (payload) => {
          setOrders(prev =>
            prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o)
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  async function cancelOrder(orderId: string) {
    setCancelling(orderId)
    // Optimistic update
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: 'annulee' as const } : o)
    )
    await supabase.from('orders').update({ status: 'annulee' }).eq('id', orderId)
    setCancelling(null)
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--text-muted)]">
        <p className="text-4xl mb-3">📦</p>
        <p className="font-medium">Aucune commande</p>
        <a href="/store" className="text-xs text-[var(--primary-light)] mt-2 block hover:underline">
          Voir les produits →
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {orders.map(order => {
        const cfg = statusConfig[order.status]
        const Icon = cfg.icon
        const isCancelling = cancelling === order.id

        return (
          <div
            key={order.id}
            className="rounded-2xl p-4 transition-colors"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {/* Order header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-bold text-sm">{order.order_number}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {new Date(order.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Status badge */}
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: cfg.bg, color: cfg.color }}
                >
                  <Icon size={12} />
                  {cfg.label}
                </div>

                {/* Cancel button — only for en_attente */}
                {order.status === 'en_attente' && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    disabled={isCancelling}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-opacity disabled:opacity-60"
                    style={{
                      background: '#EF444420',
                      color: 'var(--danger)',
                      border: '1px solid #EF444440',
                    }}
                  >
                    {isCancelling ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <XCircle size={11} />
                    )}
                    Annuler
                  </button>
                )}
              </div>
            </div>

            {/* Items */}
            {order.order_items?.map(item => (
              <div key={item.id} className="flex items-center justify-between text-sm py-1">
                <span className="text-[var(--text-muted)]">{item.products?.name ?? 'Produit'}</span>
                <span className="font-semibold">{item.unit_price} DH</span>
              </div>
            ))}

            <div
              className="mt-3 pt-3 flex items-center justify-between"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <span className="text-xs text-[var(--text-muted)]">Total</span>
              <span className="font-bold text-[var(--accent)]">{order.total_amount} DH</span>
            </div>

            {order.status === 'livree' && (
              <div
                className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: '#10B98115' }}
              >
                <span className="text-base">⭐</span>
                <p className="text-xs text-[var(--success)] font-medium">
                  Points ajoutés à votre wallet
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
