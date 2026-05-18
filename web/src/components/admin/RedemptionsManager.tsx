'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Package, Truck, CheckCircle2 } from 'lucide-react'
import type { GiftRedemption } from '@/types'

const statusConfig = {
  pending:   { label: 'En attente',  color: 'var(--warning)', icon: Package },
  shipped:   { label: 'Expédié',     color: 'var(--accent)',  icon: Truck },
  delivered: { label: 'Livré',       color: 'var(--success)', icon: CheckCircle2 },
}

export default function RedemptionsManager({ initialRedemptions }: { initialRedemptions: GiftRedemption[] }) {
  const [redemptions, setRedemptions] = useState(initialRedemptions)
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  async function updateStatus(id: string, status: 'pending' | 'shipped' | 'delivered') {
    setUpdating(id)
    await supabase.from('gift_redemptions').update({ status }).eq('id', id)
    setRedemptions(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    setUpdating(null)
    router.refresh()
  }

  const grouped = {
    pending:   redemptions.filter(r => r.status === 'pending'),
    shipped:   redemptions.filter(r => r.status === 'shipped'),
    delivered: redemptions.filter(r => r.status === 'delivered'),
  }

  function RedemptionCard({ r }: { r: GiftRedemption }) {
    const cfg = statusConfig[r.status as keyof typeof statusConfig]
    return (
      <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="font-semibold text-sm">{r.gifts?.name ?? '—'}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">⭐ {r.points_spent} pts</p>
          </div>
          <span
            className="text-xs font-semibold px-2 py-1 rounded-full shrink-0"
            style={{ background: `${cfg.color}20`, color: cfg.color }}
          >
            {cfg.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-xl px-3 py-2" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] text-[var(--text-muted)] mb-0.5">Client</p>
            <p className="text-xs font-semibold">{r.profiles?.full_name ?? '—'}</p>
          </div>
          <div className="rounded-xl px-3 py-2" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] text-[var(--text-muted)] mb-0.5">Téléphone</p>
            <a href={`tel:${r.profiles?.phone}`} className="text-xs font-semibold" style={{ color: 'var(--primary-light)' }}>
              {r.profiles?.phone ?? '—'}
            </a>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] mb-3">
          {new Date(r.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          {r.status === 'pending' && (
            <button
              onClick={() => updateStatus(r.id, 'shipped')}
              disabled={updating === r.id}
              className="flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              {updating === r.id ? <Loader2 size={13} className="animate-spin" /> : <><Truck size={13} /> Marquer expédié</>}
            </button>
          )}
          {r.status === 'shipped' && (
            <button
              onClick={() => updateStatus(r.id, 'delivered')}
              disabled={updating === r.id}
              className="flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              style={{ background: 'var(--success)', color: '#fff' }}
            >
              {updating === r.id ? <Loader2 size={13} className="animate-spin" /> : <><CheckCircle2 size={13} /> Marquer livré</>}
            </button>
          )}
          {r.status === 'delivered' && (
            <div className="flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              style={{ background: 'var(--success)15', color: 'var(--success)' }}>
              <CheckCircle2 size={13} /> Livré ✓
            </div>
          )}
        </div>
      </div>
    )
  }

  if (redemptions.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--text-muted)]">
        <p className="text-4xl mb-3">🎁</p>
        <p className="font-medium">Aucun rachat de cadeau</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {(Object.entries(grouped) as [keyof typeof grouped, GiftRedemption[]][]).map(([key, items]) => {
        if (items.length === 0) return null
        const cfg = statusConfig[key]
        const Icon = cfg.icon
        return (
          <div key={key}>
            <div className="flex items-center gap-2 mb-3">
              <Icon size={16} style={{ color: cfg.color }} />
              <h2 className="font-semibold text-sm" style={{ color: cfg.color }}>{cfg.label}</h2>
              <span className="text-xs text-[var(--text-muted)]">({items.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map(r => <RedemptionCard key={r.id} r={r} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
