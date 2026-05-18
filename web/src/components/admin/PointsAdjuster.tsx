'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react'

interface Client { id: string; full_name: string; username: string; phone: string; points_total: number }
interface Transaction { id: string; client_id: string; points: number; type: string; description: string; created_at: string; profiles?: { full_name: string } }

export default function PointsAdjuster({ clients, transactions, selectedClientId }: { clients: Client[]; transactions: Transaction[]; selectedClientId?: string }) {
  const [clientId, setClientId] = useState(selectedClientId ?? '')
  const [points, setPoints] = useState('')
  const [type, setType] = useState<'add' | 'remove'>('add')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  const selected = clients.find(c => c.id === clientId)

  async function handleAdjust() {
    if (!clientId || !points || parseInt(points) <= 0) return
    setSaving(true)
    const pts = parseInt(points)
    const finalPoints = type === 'add' ? pts : -pts
    try {
      await supabase.from('wallet_transactions').insert({
        client_id: clientId,
        points: finalPoints,
        type: 'adjusted',
        description: reason || `Ajustement admin: ${type === 'add' ? '+' : '-'}${pts} points`,
      })
      await supabase.from('profiles').update({
        points_total: Math.max(0, (selected?.points_total ?? 0) + finalPoints)
      }).eq('id', clientId)
      setPoints('')
      setReason('')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const typeConfig: Record<string, { color: string; sign: string }> = {
    earned: { color: 'var(--success)', sign: '+' },
    spent: { color: 'var(--danger)', sign: '-' },
    adjusted: { color: 'var(--warning)', sign: '±' },
    expired: { color: 'var(--text-muted)', sign: '-' },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Adjust panel */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h2 className="font-semibold text-sm">Ajuster les points d'un client</h2>

        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">Client</label>
          <select value={clientId} onChange={e => setClientId(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            <option value="">Choisir un client...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.points_total} pts</option>)}
          </select>
        </div>

        {selected && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--primary)15', border: '1px solid var(--primary)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: 'var(--primary)', color: '#fff' }}>
              {selected.full_name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold">{selected.full_name}</p>
              <p className="text-xs" style={{ color: 'var(--primary-light)' }}>⭐ {selected.points_total} points actuels</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setType('add')} className="py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: type === 'add' ? 'var(--success)' : 'var(--bg)', color: type === 'add' ? '#fff' : 'var(--text-muted)', border: '1px solid var(--border)' }}>
            + Ajouter
          </button>
          <button onClick={() => setType('remove')} className="py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: type === 'remove' ? 'var(--danger)' : 'var(--bg)', color: type === 'remove' ? '#fff' : 'var(--text-muted)', border: '1px solid var(--border)' }}>
            - Retirer
          </button>
        </div>

        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">Nombre de points</label>
          <input type="number" min="1" value={points} onChange={e => setPoints(e.target.value)} placeholder="Ex: 50"
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        </div>

        <div>
          <label className="text-xs text-[var(--text-muted)] mb-1 block">Raison (optionnel)</label>
          <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Ex: Compensation, bonus..."
            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        </div>

        <button onClick={handleAdjust} disabled={saving || !clientId || !points}
          className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2"
          style={{ background: type === 'add' ? 'var(--success)' : 'var(--danger)', color: '#fff', opacity: (saving || !clientId || !points) ? 0.5 : 1 }}>
          {saving ? <Loader2 size={18} className="animate-spin" /> : type === 'add' ? <><TrendingUp size={16} /> Ajouter les points</> : <><TrendingDown size={16} /> Retirer les points</>}
        </button>
      </div>

      {/* Recent transactions */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"
          style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
          Historique récent
        </div>
        <div className="divide-y overflow-y-auto max-h-96" style={{ borderColor: 'var(--border)' }}>
          {transactions.map(tx => {
            const cfg = typeConfig[tx.type] ?? { color: 'var(--text-muted)', sign: '' }
            return (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-card-hover)] transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.profiles?.full_name ?? '—'}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{tx.description}</p>
                  <p className="text-xs text-[var(--text-muted)]">{new Date(tx.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <span className="font-bold text-sm tabular-nums shrink-0" style={{ color: cfg.color }}>
                  {cfg.sign}{Math.abs(tx.points)} pts
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
