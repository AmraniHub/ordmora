import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/client/BottomNav'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen flex flex-col" style={{ paddingBottom: '72px' }}>
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  )
}
