import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import GiftCard from '@/components/client/GiftCard'
import type { Gift } from '@/types'

export default async function GiftsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileRes, giftsRes] = await Promise.all([
    supabase.from('profiles').select('points_total').eq('id', user.id).single(),
    supabase.from('gifts').select('*').eq('is_active', true).order('points_required'),
  ])

  const userPoints: number = profileRes.data?.points_total ?? 0
  const gifts: Gift[] = giftsRes.data ?? []

  const available = gifts.filter(g => g.stock > 0 && userPoints >= g.points_required)
  const locked = gifts.filter(g => g.stock > 0 && userPoints < g.points_required)

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Mes Cadeaux</h1>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold points-glow"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          ⭐ {userPoints} pts
        </div>
      </div>
      <p className="text-xs text-[var(--text-muted)] mb-6">Échangez vos points contre des cadeaux</p>

      {available.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-[var(--success)] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
            Disponibles pour vous
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {available.map(g => (
              <GiftCard key={g.id} gift={g} userPoints={userPoints} />
            ))}
          </div>
        </>
      )}

      {locked.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-[var(--text-muted)] mb-3">
            À débloquer
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {locked.map(g => (
              <GiftCard key={g.id} gift={g} userPoints={userPoints} />
            ))}
          </div>
        </>
      )}

      {gifts.length === 0 && (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <p className="text-4xl mb-3">🎁</p>
          <p className="font-medium">Aucun cadeau disponible</p>
        </div>
      )}
    </div>
  )
}
