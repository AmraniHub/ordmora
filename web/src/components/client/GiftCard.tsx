'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Gift, Lock, Loader2, Star } from 'lucide-react'
import type { Gift as GiftType } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function GiftCard({ gift, userPoints }: { gift: GiftType; userPoints: number }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()
  const supabase = createClient()
  const canRedeem = userPoints >= gift.points_required
  const missing = gift.points_required - userPoints

  async function handleRedeem() {
    setLoading(true)
    setErrorMsg('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase.rpc('redeem_gift', {
        p_client_id: user.id,
        p_gift_id: gift.id,
      })

      if (!data.success) {
        setErrorMsg(data.error ?? 'Erreur lors de l\'échange')
      } else {
        setSuccess(true)
        router.refresh()
      }
    } catch {
      setErrorMsg('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div
        className="rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center animate-fade-in"
        style={{ background: 'var(--success)20', border: '1px solid var(--success)' }}
      >
        <span className="text-3xl">🎉</span>
        <p className="text-sm font-semibold text-[var(--success)]">Cadeau échangé!</p>
        <p className="text-xs text-[var(--text-muted)]">L'admin vous contactera bientôt</p>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${canRedeem ? 'var(--primary)' : 'var(--border)'}`,
        opacity: canRedeem ? 1 : 0.8,
      }}
    >
      {/* Image */}
      <div className="relative aspect-square bg-[var(--bg-card-hover)]">
        {gift.image_url ? (
          <Image src={gift.image_url} alt={gift.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎁</div>
        )}
        {!canRedeem && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Lock size={24} className="text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm leading-tight truncate">{gift.name}</h3>

        <div className="flex items-center gap-1 mt-1">
          <Star size={11} style={{ color: 'var(--primary-light)' }} fill="var(--primary-light)" />
          <span className="text-xs font-bold" style={{ color: 'var(--primary-light)' }}>
            {gift.points_required} pts
          </span>
        </div>

        {!canRedeem ? (
          <div
            className="mt-2 rounded-lg px-2 py-1.5 text-center"
            style={{ background: 'var(--danger)15' }}
          >
            <p className="text-[10px] font-semibold leading-tight" style={{ color: 'var(--danger)' }}>
              Il te manque {missing} points
            </p>
          </div>
        ) : (
          <button
            onClick={handleRedeem}
            disabled={loading}
            className="w-full mt-2 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all animate-pulse-glow"
            style={{ background: 'var(--primary)', color: '#fff', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <><Gift size={13} /> Échanger</>}
          </button>
        )}

        {errorMsg && (
          <p className="text-[10px] text-[var(--danger)] mt-1 text-center">{errorMsg}</p>
        )}
      </div>
    </div>
  )
}
