import { createClient } from '@/lib/supabase/server'
import AdminUsersManager from '@/components/admin/AdminUsersManager'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: admins } = await supabase.from('admin_users').select('*').order('created_at')
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Paramètres</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">Gérer les comptes administrateurs</p>
      <AdminUsersManager initialAdmins={admins ?? []} />
    </div>
  )
}
