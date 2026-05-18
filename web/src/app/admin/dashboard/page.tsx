import { createClient } from '@/lib/supabase/server'
import { Package, Users, ClipboardList, Star, TrendingUp } from 'lucide-react'
import DashboardCharts from '@/components/admin/DashboardCharts'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [ordersRes, clientsRes, productsRes, pendingRes] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
    supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'en_cours'),
  ])

  // Revenue last 7 days (delivered orders only)
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_amount, created_at')
    .eq('status', 'livree')
    .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
    .order('created_at')

  // Best selling products (from order_items)
  const { data: topItems } = await supabase
    .from('order_items')
    .select('quantity, products(name, price)')
    .limit(50)

  // Total revenue (all delivered)
  const { data: totalRevData } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('status', 'livree')

  const totalRevenue = (totalRevData ?? []).reduce(
    (sum, row) => sum + (row.total_amount ?? 0),
    0
  )

  const stats = [
    { label: 'Commandes totales', value: ordersRes.count ?? 0, icon: ClipboardList, color: 'var(--primary)' },
    { label: 'Clients', value: clientsRes.count ?? 0, icon: Users, color: 'var(--accent)' },
    { label: 'Produits actifs', value: productsRes.count ?? 0, icon: Package, color: 'var(--success)' },
    { label: 'En livraison', value: pendingRes.count ?? 0, icon: Star, color: 'var(--warning)' },
    {
      label: 'Chiffre d\'affaires',
      value: `${totalRevenue.toLocaleString('fr-MA')} DH`,
      icon: TrendingUp,
      color: 'var(--accent)',
      wide: true,
    },
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

  const safeRevenueData = (revenueData ?? []) as { total_amount: number; created_at: string }[]
  const safeTopItems = (topItems ?? []) as { quantity: number; products: { name: string; price: number } | null }[]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-sm text-[var(--text-muted)]">Vue d'ensemble Ordmora</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {stats.slice(0, 4).map(({ label, value, icon: Icon, color }) => (
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

      {/* Total revenue — full-width card */}
      {(() => {
        const s = stats[4]
        const Icon = s.icon
        return (
          <div
            className="rounded-2xl p-4 animate-fade-in mb-8"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-muted)] font-medium mb-1">{s.label}</p>
                <p className="text-3xl font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}20` }}>
                <Icon size={20} style={{ color: s.color }} />
              </div>
            </div>
          </div>
        )
      })()}

      {/* Revenue charts */}
      <DashboardCharts revenueData={safeRevenueData} topItems={safeTopItems} />

      {/* Recent orders */}
      <div className="rounded-2xl overflow-hidden mt-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
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
