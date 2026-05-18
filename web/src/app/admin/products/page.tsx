import { createClient } from '@/lib/supabase/server'
import ProductsManager from '@/components/admin/ProductsManager'

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Produits</h1>
          <p className="text-sm text-[var(--text-muted)]">{products?.length ?? 0} produits</p>
        </div>
      </div>
      <ProductsManager initialProducts={products ?? []} />
    </div>
  )
}
