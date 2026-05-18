import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Admins go to dashboard
  if (user) {
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .single()
    if (adminUser) redirect('/admin/dashboard')
  }

  // Everyone else (logged in or not) goes straight to the store
  redirect('/store')
}
