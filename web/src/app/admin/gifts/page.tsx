import { createClient } from '@/lib/supabase/server'
import GiftsManager from '@/components/admin/GiftsManager'

export default async function AdminGiftsPage() {
  const supabase = await createClient()
  const { data: gifts } = await supabase.from('gifts').select('*').order('points_required')
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cadeaux</h1>
      <GiftsManager initialGifts={gifts ?? []} />
    </div>
  )
}
