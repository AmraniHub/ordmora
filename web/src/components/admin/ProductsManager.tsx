'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, X, Loader2, Package, Upload, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import type { Product, ProductCategory } from '@/types'

const categories: { value: ProductCategory; label: string }[] = [
  { value: 'parfums',     label: 'Parfums' },
  { value: 'packs',       label: 'Packs' },
  { value: 'accessoires', label: 'Accessoires' },
]

const empty = {
  name: '', description: '', price: '', points_value: '',
  stock: '', category: 'parfums' as ProductCategory,
  image_url: '', is_active: true,
}

export default function ProductsManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  function openNew() { setForm(empty); setEditing(null); setShowForm(true); setUploadError('') }
  function openEdit(p: Product) {
    setForm({
      name: p.name, description: p.description ?? '',
      price: String(p.price), points_value: String(p.points_value),
      stock: String(p.stock), category: p.category,
      image_url: p.image_url ?? '', is_active: p.is_active,
    })
    setEditing(p); setShowForm(true); setUploadError('')
  }

  async function handleImageUpload(file: File) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setUploadError('Image trop lourde (max 5 MB)'); return }
    if (!file.type.startsWith('image/')) { setUploadError('Fichier non valide'); return }

    setUploading(true); setUploadError('')
    try {
      const ext = file.name.split('.').pop()
      const path = `products/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
      set('image_url', publicUrl)
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Erreur upload')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    const payload = {
      name: form.name, description: form.description,
      price: parseFloat(form.price), points_value: parseInt(form.points_value),
      stock: parseInt(form.stock), category: form.category,
      image_url: form.image_url || null, is_active: form.is_active,
    }
    try {
      if (editing) {
        await supabase.from('products').update(payload).eq('id', editing.id)
      } else {
        await supabase.from('products').insert(payload)
      }
      setShowForm(false); router.refresh()
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce produit ?')) return
    setDeleting(id)
    await supabase.from('products').delete().eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  return (
    <>
      <button onClick={openNew} className="mb-5 flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm" style={{ background: 'var(--primary)', color: '#fff' }}>
        <Plus size={16} /> Ajouter un produit
      </button>

      {/* Products table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-6 gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"
          style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
          <span className="col-span-2">Produit</span><span>Catégorie</span><span>Prix</span><span>Points</span><span>Actions</span>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-16 text-[var(--text-muted)]">
            <Package size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm">Aucun produit</p>
          </div>
        ) : products.map(p => (
          <div key={p.id} className="grid grid-cols-6 gap-4 px-5 py-4 items-center hover:bg-[var(--bg-card-hover)] transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="col-span-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-xl" style={{ background: 'var(--bg-card-hover)' }}>
                {p.image_url
                  ? <Image src={p.image_url} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                  : '🧴'}
              </div>
              <div>
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-xs" style={{ color: p.is_active ? 'var(--success)' : 'var(--danger)' }}>
                  {p.is_active ? 'Actif' : 'Inactif'} · Stock: {p.stock}
                </p>
              </div>
            </div>
            <span className="text-xs capitalize px-2 py-1 rounded-full" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>{p.category}</span>
            <span className="font-bold" style={{ color: 'var(--accent)' }}>{p.price} DH</span>
            <span className="font-bold" style={{ color: 'var(--primary-light)' }}>⭐ {p.points_value}</span>
            <div className="flex gap-2">
              <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors" style={{ color: 'var(--primary-light)' }}><Pencil size={15} /></button>
              <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="p-2 rounded-lg hover:bg-[var(--danger)]/10 transition-colors" style={{ color: 'var(--danger)' }}>
                {deleting === p.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 space-y-4 my-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{editing ? 'Modifier produit' : 'Nouveau produit'}</h2>
              <button onClick={() => setShowForm(false)}><X size={20} style={{ color: 'var(--text-muted)' }} /></button>
            </div>

            {/* Name + Description */}
            {[{ k: 'name', label: 'Nom', type: 'text' }, { k: 'description', label: 'Description', type: 'text' }].map(f => (
              <div key={f.k}>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">{f.label}</label>
                <input type={f.type} value={(form as Record<string, unknown>)[f.k] as string} onChange={e => set(f.k, e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
            ))}

            {/* Image upload section */}
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-2 block">Image produit</label>

              {/* Preview */}
              {form.image_url && (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-2" style={{ background: 'var(--bg-card-hover)' }}>
                  <Image src={form.image_url} alt="Aperçu" fill className="object-contain" />
                  <button
                    onClick={() => set('image_url', '')}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Upload button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all"
                  style={{ background: 'var(--bg)', border: '2px dashed var(--border)', color: 'var(--text-muted)' }}
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {uploading ? 'Upload en cours...' : 'Choisir une photo'}
                </button>
                {/* OR paste URL */}
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt('URL de l\'image :')
                    if (url) set('image_url', url)
                  }}
                  className="px-3 rounded-xl text-xs font-medium"
                  style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                >
                  <ImageIcon size={16} />
                </button>
              </div>
              {uploadError && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{uploadError}</p>}
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Upload direct (max 5 MB) ou coller une URL avec le bouton 🖼️
              </p>
            </div>

            {/* Price / Points / Stock */}
            <div className="grid grid-cols-3 gap-3">
              {[{ k: 'price', label: 'Prix (DH)' }, { k: 'points_value', label: 'Points' }, { k: 'stock', label: 'Stock' }].map(f => (
                <div key={f.k}>
                  <label className="text-xs text-[var(--text-muted)] mb-1 block">{f.label}</label>
                  <input type="number" value={(form as Record<string, unknown>)[f.k] as string} onChange={e => set(f.k, e.target.value)} min="0"
                    className="w-full rounded-xl px-3 py-3 text-sm outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              ))}
            </div>

            {/* Category / Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Catégorie</label>
                <select value={form.category} onChange={e => set('category', e.target.value)}
                  className="w-full rounded-xl px-3 py-3 text-sm outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">Statut</label>
                <select value={form.is_active ? 'true' : 'false'} onChange={e => set('is_active', e.target.value === 'true')}
                  className="w-full rounded-xl px-3 py-3 text-sm outline-none" style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                  <option value="true">Actif</option>
                  <option value="false">Inactif</option>
                </select>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving || !form.name || !form.price}
              className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2"
              style={{ background: 'var(--primary)', color: '#fff', opacity: saving ? 0.7 : 1 }}>
              {saving ? <Loader2 size={18} className="animate-spin" /> : editing ? 'Enregistrer' : 'Créer le produit'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
