'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, X, Loader2, Gift } from 'lucide-react'
import type { Gift as GiftType } from '@/types'

const empty = { name: '', description: '', image_url: '', points_required: '', stock: '', is_active: true }

export default function GiftsManager({ initialGifts }: { initialGifts: GiftType[] }) {
  const [gifts, setGifts] = useState(initialGifts)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<GiftType | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  function openNew() { setForm(empty); setEditing(null); setShowForm(true) }
  function openEdit(g: GiftType) {
    setForm({ name: g.name, description: g.description ?? '', image_url: g.image_url ?? '', points_required: String(g.points_required), stock: String(g.stock), is_active: g.is_active })
    setEditing(g); setShowForm(true)
  }

  async function handleSave() {
    setSaving(true)
    const payload = { name: form.name, description: form.description, image_url: form.image_url, points_required: parseInt(form.points_required), stock: parseInt(form.stock), is_active: form.is_active }
    try {
      if (editing) {
        await supabase.from('gifts').update(payload).eq('id', editing.id)
      } else {
        await supabase.from('gifts').insert(payload)
      }
      setShowForm(false); router.refresh()
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce cadeau ?')) return
    setDeleting(id)
    await supabase.from('gifts').delete().eq('id', id)
    setGifts(prev => prev.filter(g => g.id !== id))
    setDeleting(null)
  }

  return (
    <>
      <button onClick={openNew} className="mb-5 flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm" style={{ background: 'var(--primary)', color: '#fff' }}>
        <Plus size={16} /> Ajouter un cadeau
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gifts.length === 0 && (
          <div className="col-span-3 text-center py-16 text-[var(--text-muted)]"><Gift size={32} className="mx-auto mb-2 opacity-30" /><p>Aucun cadeau</p></div>
        )}
        {gifts.map(g => (
          <div key={g.id} className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: `1px solid ${g.is_active ? 'var(--primary)' : 'var(--border)'}` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'var(--bg)' }}>🎁</div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg" style={{ color: 'var(--primary-light)' }}><Pencil size={14} /></button>
                <button onClick={() => handleDelete(g.id)} disabled={deleting === g.id} className="p-1.5 rounded-lg" style={{ color: 'var(--danger)' }}>
                  {deleting === g.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
            <p className="font-semibold text-sm">{g.name}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{g.description}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="font-bold text-sm" style={{ color: 'var(--primary-light)' }}>⭐ {g.points_required} pts</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: g.stock > 0 ? 'var(--success)20' : 'var(--danger)20', color: g.stock > 0 ? 'var(--success)' : 'var(--danger)' }}>
                Stock: {g.stock}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing ? 'Modifier cadeau' : 'Nouveau cadeau'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} style={{ color: 'var(--text-muted)' }} /></button>
            </div>
            {[{ k: 'name', label: 'Nom' }, { k: 'description', label: 'Description' }, { k: 'image_url', label: 'URL Image' }].map(f => (
              <div key={f.k}>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{f.label}</label>
                <input value={(form as Record<string, unknown>)[f.k] as string} onChange={e => set(f.k, e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
            ))}
            <div className="grid grid-cols-3 gap-3">
              {[{ k: 'points_required', label: 'Points requis' }, { k: 'stock', label: 'Stock' }].map(f => (
                <div key={f.k} className="col-span-1">
                  <label className="text-xs text-[var(--text-muted)] mb-1 block">{f.label}</label>
                  <input type="number" min="0" value={(form as Record<string, unknown>)[f.k] as string} onChange={e => set(f.k, e.target.value)}
                    className="w-full rounded-xl px-3 py-3 text-sm outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              ))}
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Statut</label>
                <select value={form.is_active ? 'true' : 'false'} onChange={e => set('is_active', e.target.value === 'true')}
                  className="w-full rounded-xl px-3 py-3 text-sm outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  <option value="true">Actif</option><option value="false">Inactif</option>
                </select>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving || !form.name || !form.points_required}
              className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2"
              style={{ background: 'var(--primary)', color: '#fff', opacity: saving ? 0.7 : 1 }}>
              {saving ? <Loader2 size={18} className="animate-spin" /> : editing ? 'Enregistrer' : 'Créer le cadeau'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
