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
    <div className="p-6 max-w-5xl mx-auto">
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

      {/* Orders table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div
          className="grid grid-cols-5 gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"
          style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
        >
          <span>Commande</span>
          <span>Client</span>
          <span>Produits</span>
          <span>Montant</span>
          <span>Statut</span>
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {orders?.map((order: Order) => (
            <div key={order.id} className="grid grid-cols-5 gap-4 px-5 py-4 items-center hover:bg-[var(--bg-card-hover)] transition-colors">
              <div>
                <p className="text-sm font-semibold">{order.order_number}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {new Date(order.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-sm">{order.profiles?.full_name ?? '—'}</p>
                <p className="text-xs text-[var(--text-muted)]">{order.profiles?.phone}</p>
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                {order.order_items?.map(i => i.products?.name).join(', ')}
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{order.total_amount} DH</p>
              <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
            </div>
          ))}
        </div>
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
