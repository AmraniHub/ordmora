'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import ProductCard from '@/components/client/ProductCard'
import type { Product, ProductCategory } from '@/types'

const categories: { key: ProductCategory | 'tous'; label: string }[] = [
  { key: 'tous',        label: 'Tous' },
  { key: 'parfums',     label: 'Parfums' },
  { key: 'packs',       label: 'Packs' },
  { key: 'accessoires', label: 'Accessoires' },
]

interface Props {
  products: Product[]
  initialCat: string
}

export default function StoreContent({ products, initialCat }: Props) {
  const [cat, setCat] = useState(initialCat)
  const [search, setSearch] = useState('')

  const filtered = products.filter(p => {
    const matchCat = cat === 'tous' || p.category === cat
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <>
      {/* Search input */}
      <div
        className="flex items-center gap-2 rounded-2xl px-4 py-2.5 mb-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <Search size={16} color="var(--text-muted)" className="shrink-0" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un produit..."
          className="flex-1 bg-transparent text-sm outline-none text-[var(--text)] placeholder-[var(--text-muted)]"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {categories.map(({ key, label }) => {
          const active = cat === key
          return (
            <button
              key={key}
              onClick={() => setCat(key)}
              className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: active ? 'var(--primary)' : 'var(--bg-card)',
                color: active ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Products grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((p: Product) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <p className="text-4xl mb-3">🛍️</p>
          <p className="font-medium">Aucun produit trouvé</p>
        </div>
      )}
    </>
  )
}
