import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (!adminUser) redirect('/store')

  return (
    <div className="flex min-h-screen">
      <AdminSidebar role={adminUser.role} name={adminUser.full_name} />
      <main className="flex-1 overflow-auto" style={{ marginLeft: '240px' }}>
        {children}
      </main>
    </div>
  )
}
