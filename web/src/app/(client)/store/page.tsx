import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/client/ProductCard'
import type { Product, ProductCategory } from '@/types'

const categories: { key: ProductCategory | 'tous'; label: string }[] = [
  { key: 'tous', label: 'Tous' },
  { key: 'parfums', label: 'Parfums' },
  { key: 'packs', label: 'Packs' },
  { key: 'accessoires', label: 'Accessoires' },
]

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>
}) {
  const { cat } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (cat && cat !== 'tous') {
    query = query.eq('category', cat)
  }

  const { data: products } = await query

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Nos Produits</h1>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Achetez et gagnez des points</p>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          O
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(({ key, label }) => {
          const active = (cat ?? 'tous') === key
          return (
            <a
              key={key}
              href={key === 'tous' ? '/store' : `/store?cat=${key}`}
              className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: active ? 'var(--primary)' : 'var(--bg-card)',
                color: active ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
              }}
            >
              {label}
            </a>
          )
        })}
      </div>

      {/* Products grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {products.map((p: Product) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-[var(--text-muted)]">
          <p className="text-4xl mb-3">🛍️</p>
          <p className="font-medium">Aucun produit disponible</p>
        </div>
      )}
    </div>
  )
}
