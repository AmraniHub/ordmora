import { redirect } from 'next/navigation'
import { adminFetch } from '@/lib/supabase/admin'
import ProductDetail from '@/components/client/ProductDetail'
import type { Product } from '@/types'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const rows = await adminFetch('products', { 'id': `eq.${id}`, 'select': '*' }) as Product[]
  const product = rows[0] ?? null

  if (!product || !(product as Product).is_active) {
    redirect('/store')
  }

  return <ProductDetail product={product as Product} />
}
