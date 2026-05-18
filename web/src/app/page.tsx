import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/LandingPage'
import type { Product, ProductCategory } from '@/types'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Logged-in users go straight to their destination
  if (user) {
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single()
    if (adminUser) redirect('/admin/dashboard')
    redirect('/store')
  }

  // Public: fetch active products for the landing page
  const { cat } = await searchParams
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (cat && cat !== 'tous') {
    query = query.eq('category', cat as ProductCategory)
  }

  const { data: products } = await query

  return <LandingPage products={products ?? []} activeCat={cat ?? 'tous'} />
}
