import { createClient } from '@/lib/supabase/server'
import { Star, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react'
import LoginPrompt from '@/components/client/LoginPrompt'
import type { WalletTransaction } from '@/types'
import WalletCard from '@/components/client/WalletCard'

const typeConfig = {
  earned:   { icon: TrendingUp,   color: 'var(--success)', label: 'Gagné',   sign: '+' },
  spent:    { icon: TrendingDown,  color: 'var(--danger)',  label: 'Dépensé', sign: '-' },
  adjusted: { icon: Star,          color: 'var(--warning)', label: 'Ajusté',  sign: '' },
  expired:  { icon: RotateCcw,     color: 'var(--text-muted)', label: 'Expiré', sign: '-' },
}

export default async function WalletPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <LoginPrompt message="Connectez-vous pour voir vos points" />

  const [profileRes, txRes] = await Promise.all([
    supabase.from('profiles').select('full_name, points_total').eq('id', user.id).single(),
    supabase.from('wallet_transactions').select('*').eq('client_id', user.id)
      .order('created_at', { ascending: false }).limit(20),
  ])

  const profile = profileRes.data
  const transactions: WalletTransaction[] = txRes.data ?? []

  // Points expiring in <30 days
  const soonExpiring = transactions
    .filter(t => t.type === 'earned' && t.expires_at)
    .filter(t => {
      const days = (new Date(t.expires_at!).getTime() - Date.now()) / 86400000
      return days > 0 && days < 30
    })
    .reduce((sum, t) => sum + t.points, 0)

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6">Mon Wallet</h1>

      {/* Points card */}
      <WalletCard
        points={profile?.points_total ?? 0}
        name={profile?.full_name ?? ''}
        soonExpiring={soonExpiring}
      />

      {/* History */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-sm">Historique</h2>
        <span className="text-xs text-[var(--text-muted)]">{transactions.length} opérations</span>
      </div>

      <div className="space-y-2">
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <Star size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucune transaction pour le moment</p>
            <p className="text-xs mt-1">Commandez un produit pour gagner des points</p>
          </div>
        ) : (
          transactions.map(tx => {
            const cfg = typeConfig[tx.type]
            const Icon = cfg.icon
            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${cfg.color}20` }}
                >
                  <Icon size={16} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tx.description}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {new Date(tx.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="font-bold text-sm tabular-nums" style={{ color: cfg.color }}>
                  {cfg.sign}{Math.abs(tx.points)} pts
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
