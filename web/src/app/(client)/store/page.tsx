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
  const { data: products, error: productsError } = await admin
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // DEBUG — remove after fix
  const debugUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'MISSING'
  const debugKey = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      {/* DEBUG BANNER — remove after fix */}
      <div style={{ background: '#1a1a2e', border: '1px solid #7C3AED', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 11, color: '#A78BFA', wordBreak: 'break-all' }}>
        <b>DEBUG:</b> URL={debugUrl.slice(0, 40)} | KEY={debugKey} | products={products?.length ?? 'null'} | error={productsError?.message ?? 'none'}
      </div>
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
