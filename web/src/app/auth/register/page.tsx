'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { User, Phone, MapPin, Home, AtSign, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '', username: '', phone: '',
    city: '', delivery_address: '', password: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: `${form.phone}@ordmora.app`,
        password: form.password,
      })
      if (signUpError) throw signUpError

      // Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user!.id,
        full_name: form.full_name,
        username: form.username,
        phone: form.phone,
        city: form.city,
        delivery_address: form.delivery_address,
      })
      if (profileError) throw profileError

      router.push('/store')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text">Ordmora</h1>
          <p className="text-[var(--text-muted)] mt-2 text-sm">Créer un compte</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          <Field icon={<User size={16} />} placeholder="Nom complet" value={form.full_name} onChange={v => set('full_name', v)} required />
          <Field icon={<AtSign size={16} />} placeholder="Identifiant" value={form.username} onChange={v => set('username', v)} required />
          <Field icon={<Phone size={16} />} placeholder="Téléphone" type="tel" value={form.phone} onChange={v => set('phone', v)} required />
          <Field icon={<MapPin size={16} />} placeholder="Ville" value={form.city} onChange={v => set('city', v)} required />
          <Field icon={<Home size={16} />} placeholder="Adresse de livraison" value={form.delivery_address} onChange={v => set('delivery_address', v)} required />
          <Field icon={<Lock size={16} />} placeholder="Mot de passe" type="password" value={form.password} onChange={v => set('password', v)} required />

          {error && (
            <p className="text-[var(--danger)] text-sm text-center bg-[var(--danger)]/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ background: 'var(--primary)', color: '#fff', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <>S'inscrire <ArrowRight size={16} /></>}
          </button>

          <p className="text-center text-sm text-[var(--text-muted)]">
            Déjà un compte ?{' '}
            <Link href="/auth/login" className="text-[var(--primary-light)] hover:underline">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

function Field({ icon, placeholder, value, onChange, type = 'text', required }: {
  icon: React.ReactNode
  placeholder: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <span className="text-[var(--text-muted)] shrink-0">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
        style={{ color: 'var(--text)' }}
      />
    </div>
  )
}
