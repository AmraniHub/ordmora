import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Profile } from '@/types'
import ProfileForm from '@/components/client/ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* Header */}
      <div
        className="px-4 pt-12 pb-6"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Mon Profil
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          {user.email}
        </p>
      </div>

      {/* Points badge */}
      {profile && (
        <div className="px-4 py-4">
          <div
            className="flex items-center justify-between rounded-2xl px-5 py-4"
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, #5B21B6 100%)',
            }}
          >
            <div>
              <p className="text-xs font-medium opacity-80">Points fidélité</p>
              <p className="text-3xl font-bold mt-1">{profile.points_total ?? 0}</p>
            </div>
            <span className="text-4xl">⭐</span>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="px-4 pb-8">
        <ProfileForm profile={profile as Profile} />
      </div>
    </div>
  )
}
