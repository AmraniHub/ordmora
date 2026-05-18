import { createClient } from '@/lib/supabase/server'
import OrderStatusUpdater from '@/components/admin/OrderStatusUpdater'
import type { Order } from '@/types'

const statusLabel: Record<string, { label: string; color: string }> = {
  en_attente: { label: 'En attente', color: 'var(--warning)' },
  en_cours:   { label: 'En cours',   color: 'var(--accent)' },
  livree:     { label: 'Livrée',     color: 'var(--success)' },
  annulee:    { label: 'Annulée',    color: 'var(--danger)' },
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select('*, profiles(full_name, phone), order_items(*, products(name))')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data: orders } = await query

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Commandes</h1>
        <span className="text-sm text-[var(--text-muted)]">{orders?.length ?? 0} résultats</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[{ key: '', label: 'Toutes' }, ...Object.entries(statusLabel).map(([k, v]) => ({ key: k, label: v.label }))].map(f => (
          <a
            key={f.key}
            href={f.key ? `/admin/orders?status=${f.key}` : '/admin/orders'}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: status === f.key || (!status && !f.key) ? 'var(--primary)' : 'var(--bg-card)',
              color: status === f.key || (!status && !f.key) ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
          >
            {f.label}
          </a>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-3">
        {orders?.map((order: Order) => (
          <div
            key={order.id}
            className="rounded-2xl p-5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              {/* Left: order info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-bold text-sm">{order.order_number}</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Products */}
                <p className="text-sm text-[var(--text-muted)] mb-3">
                  {order.order_items?.map(i => `${i.products?.name ?? '?'} ×${i.quantity}`).join(', ')}
                </p>

                {/* Client + address — what the delivery person needs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="rounded-xl px-3 py-2" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Client</p>
                    <p className="text-sm font-semibold">{order.profiles?.full_name ?? '—'}</p>
                  </div>
                  <div className="rounded-xl px-3 py-2" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Téléphone</p>
                    <a
                      href={`tel:${order.profiles?.phone}`}
                      className="text-sm font-semibold"
                      style={{ color: 'var(--primary-light)' }}
                    >
                      {order.profiles?.phone ?? '—'}
                    </a>
                  </div>
                  <div className="rounded-xl px-3 py-2" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Adresse de livraison</p>
                    <p className="text-sm font-semibold">{order.delivery_address || '—'}</p>
                  </div>
                </div>

                {order.notes && (
                  <div className="mt-2 rounded-xl px-3 py-2" style={{ background: 'var(--warning)10', border: '1px solid var(--warning)30' }}>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">Note client</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                )}
              </div>

              {/* Right: amount + status */}
              <div className="flex flex-col items-end gap-3 shrink-0">
                <p className="text-xl font-black" style={{ color: 'var(--accent)' }}>
                  {order.total_amount} DH
                </p>
                <OrderStatusUpdater
                  orderId={order.id}
                  currentStatus={order.status}
                  clientPhone={order.profiles?.phone ?? ''}
                  clientName={order.profiles?.full_name ?? ''}
                  orderNumber={order.order_number}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!orders || orders.length === 0) && (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm">Aucune commande</p>
        </div>
      )}
    </div>
  )
}
