import { createClient } from '@/lib/supabase/server'
import { adminFetch } from '@/lib/supabase/admin'
import StoreHeader from '@/components/client/StoreHeader'
import StoreContent from '@/components/client/StoreContent'
import type { Product } from '@/types'

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>
}) {
  const { cat } = await searchParams
  const supabase = await createClient()

  // Fetch user profile for the avatar (optional — null for guests)
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('full_name, points_total').eq('id', user.id).single()
    : { data: null }

  // Direct REST fetch with service role key — bypasses RLS, always works
  const products = await adminFetch('products', {
    'is_active': 'eq.true',
    'order': 'created_at.desc',
    'select': '*',
  }) as Product[]

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      <StoreHeader
        name={profile?.full_name ?? ''}
        points={profile?.points_total ?? 0}
      />
      <StoreContent
        products={products}
        initialCat={cat ?? 'tous'}
      />
    </div>
  )
}
