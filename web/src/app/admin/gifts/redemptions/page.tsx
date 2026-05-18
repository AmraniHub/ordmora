import { createClient } from '@/lib/supabase/server'
import RedemptionsManager from '@/components/admin/RedemptionsManager'

export default async function AdminRedemptionsPage() {
  const supabase = await createClient()

  const { data: redemptions } = await supabase
    .from('gift_redemptions')
    .select('*, gifts(name, points_required), profiles(full_name, phone)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Rachats de cadeaux</h1>
        <p className="text-sm text-[var(--text-muted)]">{redemptions?.length ?? 0} demandes</p>
      </div>
      <RedemptionsManager initialRedemptions={redemptions ?? []} />
    </div>
  )
}
