import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import StoreHeader from '@/components/client/StoreHeader'
import StoreContent from '@/components/client/StoreContent'

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

  // Use service-role client to fetch products — bypasses RLS, always works
  const admin = createAdminClient()
  const { data: products } = await admin
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      <StoreHeader
        name={profile?.full_name ?? ''}
        points={profile?.points_total ?? 0}
      />
      <StoreContent
        products={products ?? []}
        initialCat={cat ?? 'tous'}
      />
    </div>
  )
}
