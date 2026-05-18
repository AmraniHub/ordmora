'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, Star, Gift, Package, Shield } from 'lucide-react'
import type { Product, ProductCategory } from '@/types'

const categories: { key: ProductCategory | 'tous'; label: string }[] = [
  { key: 'tous', label: 'Tous' },
  { key: 'parfums', label: 'Parfums' },
  { key: 'packs', label: 'Packs' },
  { key: 'accessoires', label: 'Accessoires' },
]

export default function LandingPage({
  products,
  activeCat,
}: {
  products: Product[]
  activeCat: string
}) {
  const [cat, setCat] = useState(activeCat)

  const filtered = cat === 'tous' ? products : products.filter(p => p.category === cat)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* ── Navbar ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-5 py-4"
        style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-xl font-black" style={{ color: 'var(--primary-light)' }}>Ordmora</span>
        <div className="flex items-center gap-2">
          <a
            href="/auth/login"
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            Connexion
          </a>
          <a
            href="/auth/register"
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            S'inscrire
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="text-center px-5 pt-14 pb-10 max-w-lg mx-auto">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: 'var(--primary)20', color: 'var(--primary-light)', border: '1px solid var(--primary)40' }}
        >
          <Star size={12} fill="currentColor" /> Gagnez des points à chaque achat
        </div>
        <h1 className="text-4xl font-black leading-tight mb-4">
          La boutique qui{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--primary-light), var(--accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            vous récompense
          </span>
        </h1>
        <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-8">
          Commandez en ligne, payez à la livraison. Chaque achat vous rapporte des points échangeables contre des cadeaux.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a
            href="/auth/register"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            <ShoppingCart size={16} /> Commander maintenant
          </a>
          <a
            href="/auth/login"
            className="px-6 py-3 rounded-2xl font-semibold text-sm"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            Se connecter
          </a>
        </div>
      </section>

      {/* ── Benefits strip ── */}
      <section className="max-w-lg mx-auto px-4 mb-10">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Package, label: 'Livraison\nrapide', color: 'var(--accent)' },
            { icon: Shield, label: 'Paiement\nà la livraison', color: 'var(--success)' },
            { icon: Gift, label: 'Cadeaux\net récompenses', color: 'var(--primary-light)' },
          ].map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 py-4 rounded-2xl text-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p className="text-xs font-semibold leading-tight whitespace-pre-line" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Products ── */}
      <section className="max-w-lg mx-auto px-4 pb-16">
        <h2 className="text-lg font-bold mb-4">Nos produits</h2>

        {/* Category tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {categories.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCat(key)}
              className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: cat === key ? 'var(--primary)' : 'var(--bg-card)',
                color: cat === key ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${cat === key ? 'var(--primary)' : 'var(--border)'}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(product => (
              <PublicProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
            <p className="text-4xl mb-3">🛍️</p>
            <p className="font-medium">Aucun produit dans cette catégorie</p>
          </div>
        )}

        {/* CTA below products */}
        {filtered.length > 0 && (
          <div
            className="mt-8 rounded-2xl p-6 text-center"
            style={{ background: 'var(--primary)15', border: '1px solid var(--primary)40' }}
          >
            <p className="font-bold mb-1">Prêt à commander ?</p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Créez un compte gratuit et payez à la livraison
            </p>
            <a
              href="/auth/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
              style={{ background: 'var(--primary)', color: '#fff' }}
            >
              <ShoppingCart size={15} /> Créer mon compte
            </a>
          </div>
        )}
      </section>
    </div>
  )
}

function PublicProductCard({ product }: { product: Product }) {
  return (
    <a
      href="/auth/register"
      className="block rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}
    >
      {/* Image */}
      <div className="relative aspect-square" style={{ background: 'var(--bg-card-hover)' }}>
        {product.image_url ? (
          <Image src={product.image_url} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🧴</div>
        )}
        <div
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          <Star size={10} fill="currentColor" />
          {product.points_value} pts
        </div>
        {product.stock === 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center text-xs font-bold"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            Rupture de stock
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm leading-tight truncate">{product.name}</h3>
        <p className="font-bold mt-1" style={{ color: 'var(--accent)' }}>{product.price} DH</p>
        <div
          className="w-full mt-2 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
          style={{ background: product.stock === 0 ? 'var(--border)' : 'var(--primary)', color: product.stock === 0 ? 'var(--text-muted)' : '#fff' }}
        >
          {product.stock === 0 ? 'Indisponible' : <><ShoppingCart size={13} /> Commander</>}
        </div>
      </div>
    </a>
  )
}
