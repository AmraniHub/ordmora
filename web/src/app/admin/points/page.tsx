import { createClient } from '@/lib/supabase/server'
import PointsAdjuster from '@/components/admin/PointsAdjuster'

export default async function AdminPointsPage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const { client: clientId } = await searchParams
  const supabase = await createClient()

  const [profilesRes, txRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name, username, phone, points_total').order('full_name'),
    supabase.from('wallet_transactions').select('*, profiles(full_name)')
      .order('created_at', { ascending: false }).limit(30),
  ])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestion des Points</h1>
      <PointsAdjuster clients={profilesRes.data ?? []} transactions={txRes.data ?? []} selectedClientId={clientId} />
    </div>
  )
}
