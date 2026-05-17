'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Phone, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: `${phone}@ordmora.app`,
        password,
      })
      if (signInError) throw signInError

      // Check if admin
      const { data: { user } } = await supabase.auth.getUser()
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', user!.id)
        .single()

      router.push(adminUser ? '/admin/dashboard' : '/store')
      router.refresh()
    } catch {
      setError('Téléphone ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text">Ordmora</h1>
          <p className="text-[var(--text-muted)] mt-2 text-sm">Connexion à votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <Phone size={16} className="text-[var(--text-muted)] shrink-0" />
            <input
              type="tel"
              placeholder="Téléphone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
              style={{ color: 'var(--text)' }}
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <Lock size={16} className="text-[var(--text-muted)] shrink-0" />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
              style={{ color: 'var(--text)' }}
            />
          </div>

          {error && (
            <p className="text-[var(--danger)] text-sm text-center bg-[var(--danger)]/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ background: 'var(--primary)', color: '#fff', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <>Se connecter <ArrowRight size={16} /></>}
          </button>

          <p className="text-center text-sm text-[var(--text-muted)]">
            Pas encore de compte ?{' '}
            <Link href="/auth/register" className="text-[var(--primary-light)] hover:underline">
              S'inscrire
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
