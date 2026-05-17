import { createClient } from '@/lib/supabase/server'
import { Package, Users, ClipboardList, Star } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [ordersRes, clientsRes, productsRes, pendingRes] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
    supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'en_cours'),
  ])

  const stats = [
    { label: 'Commandes totales', value: ordersRes.count ?? 0, icon: ClipboardList, color: 'var(--primary)' },
    { label: 'Clients', value: clientsRes.count ?? 0, icon: Users, color: 'var(--accent)' },
    { label: 'Produits actifs', value: productsRes.count ?? 0, icon: Package, color: 'var(--success)' },
    { label: 'En livraison', value: pendingRes.count ?? 0, icon: Star, color: 'var(--warning)' },
  ]

  // Recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(8)

  const statusLabel: Record<string, { label: string; color: string }> = {
    en_attente: { label: 'En attente', color: 'var(--warning)' },
    en_cours:   { label: 'En cours',   color: 'var(--accent)' },
    livree:     { label: 'Livrée',     color: 'var(--success)' },
    annulee:    { label: 'Annulée',    color: 'var(--danger)' },
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-sm text-[var(--text-muted)]">Vue d'ensemble Ordmora</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl p-4 animate-fade-in"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[var(--text-muted)] font-medium">{label}</p>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <p className="text-3xl font-black tabular-nums" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-sm">Commandes récentes</h2>
          <a href="/admin/orders" className="text-xs text-[var(--primary-light)] hover:underline">Voir tout →</a>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {recentOrders?.map(order => {
            const s = statusLabel[order.status]
            return (
              <div key={order.id} className="flex items-center gap-4 px-5 py-3 hover:bg-[var(--bg-card-hover)] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{order.order_number}</p>
                  <p className="text-xs text-[var(--text-muted)]">{order.profiles?.full_name ?? '—'}</p>
                </div>
                <p className="text-sm font-bold text-[var(--accent)] tabular-nums">{order.total_amount} DH</p>
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ background: `${s?.color}20`, color: s?.color }}
                >
                  {s?.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
