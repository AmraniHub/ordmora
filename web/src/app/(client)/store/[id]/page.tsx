import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductDetail from '@/components/client/ProductDetail'
import type { Product } from '@/types'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product || !(product as Product).is_active) {
    redirect('/store')
  }

  return <ProductDetail product={product as Product} />
}
