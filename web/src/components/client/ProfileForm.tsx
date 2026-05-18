'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'

interface ProfileFormProps {
  profile: Profile
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    city: profile?.city ?? '',
    delivery_address: profile?.delivery_address ?? '',
  })

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSuccess(false)
    setError('')
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    setError('')

    const { error: err } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        phone: form.phone,
        city: form.city,
        delivery_address: form.delivery_address,
      })
      .eq('id', profile.id)

    setSaving(false)

    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: 'var(--text)',
    fontSize: '15px',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  return (
    <div className="flex flex-col gap-5 mt-4">
      {/* Full name */}
      <div>
        <label style={labelStyle}>Nom complet</label>
        <input
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          placeholder="Votre nom"
          style={fieldStyle}
        />
      </div>

      {/* Phone */}
      <div>
        <label style={labelStyle}>Téléphone</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="06XXXXXXXX"
          type="tel"
          style={fieldStyle}
        />
      </div>

      {/* City */}
      <div>
        <label style={labelStyle}>Ville</label>
        <input
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="Casablanca"
          style={fieldStyle}
        />
      </div>

      {/* Delivery address */}
      <div>
        <label style={labelStyle}>Adresse de livraison</label>
        <textarea
          name="delivery_address"
          value={form.delivery_address}
          onChange={handleChange}
          placeholder="Rue, quartier, ville..."
          rows={3}
          style={{ ...fieldStyle, resize: 'none', lineHeight: '1.5' }}
        />
      </div>

      {/* Success / error feedback */}
      {success && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.3)' }}
        >
          Profil mis à jour ✓
        </div>
      )}
      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          {error}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-2xl py-4 font-semibold text-base transition-opacity"
        style={{
          background: 'var(--primary)',
          color: '#fff',
          opacity: saving ? 0.6 : 1,
          cursor: saving ? 'not-allowed' : 'pointer',
        }}
      >
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </button>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="w-full rounded-2xl py-4 font-semibold text-base transition-opacity"
        style={{
          background: 'transparent',
          color: 'var(--danger)',
          border: '1px solid rgba(239,68,68,0.4)',
          cursor: 'pointer',
        }}
      >
        Déconnexion
      </button>
    </div>
  )
}
