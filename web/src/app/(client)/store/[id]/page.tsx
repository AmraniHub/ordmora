import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import ProductDetail from '@/components/client/ProductDetail'
import type { Product } from '@/types'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: product } = await admin
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product || !(product as Product).is_active) {
    redirect('/store')
  }

  return <ProductDetail product={product as Product} />
}
