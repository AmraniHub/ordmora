'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2, Shield } from 'lucide-react'

interface AdminUser { id: string; email: string; full_name: string; role: string; is_active: boolean; created_at: string }

const roles = [
  { value: 'admin', label: 'Admin', desc: 'Accès complet' },
  { value: 'manager', label: 'Manager', desc: 'Produits, commandes, clients, points, cadeaux' },
  { value: 'delivery', label: 'Livraison', desc: 'Voir et mettre à jour les commandes uniquement' },
]

const roleColors: Record<string, string> = { admin: 'var(--primary)', manager: 'var(--accent)', delivery: 'var(--success)' }

export default function AdminUsersManager({ initialAdmins }: { initialAdmins: AdminUser[] }) {
  const [admins] = useState(initialAdmins)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email: '', full_name: '', role: 'manager', password: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleCreate() {
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setShowForm(false)
      setForm({ email: '', full_name: '', role: 'manager', password: '' })
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally { setSaving(false) }
  }

  return (
    <>
      <button onClick={() => setShowForm(true)} className="mb-6 flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm" style={{ background: 'var(--primary)', color: '#fff' }}>
        <Plus size={16} /> Ajouter un admin
      </button>

      <div className="space-y-3">
        {admins.map(a => (
          <div key={a.id} className="flex items-center gap-4 px-5 py-4 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: roleColors[a.role] ?? 'var(--primary)', color: '#fff' }}>
              {a.full_name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{a.full_name}</p>
              <p className="text-xs text-[var(--text-muted)]">{a.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1 rounded-full capitalize flex items-center gap-1" style={{ background: `${roleColors[a.role]}20`, color: roleColors[a.role] }}>
                <Shield size={11} />{a.role}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: a.is_active ? 'var(--success)20' : 'var(--danger)20', color: a.is_active ? 'var(--success)' : 'var(--danger)' }}>
                {a.is_active ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        ))}
        {admins.length === 0 && <p className="text-center py-10 text-[var(--text-muted)] text-sm">Aucun administrateur</p>}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Nouvel administrateur</h2>
              <button onClick={() => setShowForm(false)}><X size={20} style={{ color: 'var(--text-muted)' }} /></button>
            </div>
            {[{ k: 'full_name', label: 'Nom complet', type: 'text' }, { k: 'email', label: 'Email', type: 'email' }, { k: 'password', label: 'Mot de passe', type: 'password' }].map(f => (
              <div key={f.k}>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{f.label}</label>
                <input type={f.type} value={(form as Record<string, string>)[f.k]} onChange={e => set(f.k, e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
            ))}
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-2 block">Rôle</label>
              <div className="space-y-2">
                {roles.map(r => (
                  <button key={r.value} onClick={() => set('role', r.value)} className="w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all"
                    style={{ background: form.role === r.value ? `${roleColors[r.value]}20` : 'var(--bg)', border: `1px solid ${form.role === r.value ? roleColors[r.value] : 'var(--border)'}` }}>
                    <Shield size={16} style={{ color: roleColors[r.value], marginTop: 2 }} />
                    <div><p className="text-sm font-semibold">{r.label}</p><p className="text-xs text-[var(--text-muted)]">{r.desc}</p></div>
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-center p-2 rounded-lg" style={{ color: 'var(--danger)', background: 'var(--danger)15' }}>{error}</p>}
            <button onClick={handleCreate} disabled={saving || !form.email || !form.full_name || !form.password}
              className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2"
              style={{ background: 'var(--primary)', color: '#fff', opacity: saving ? 0.7 : 1 }}>
              {saving ? <Loader2 size={18} className="animate-spin" /> : 'Créer l\'administrateur'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
