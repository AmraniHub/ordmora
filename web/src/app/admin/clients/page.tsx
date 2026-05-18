import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'

export default async function AdminClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,city.ilike.%${q}%`)

  const { data: clients } = await query

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-sm text-[var(--text-muted)]">{clients?.length ?? 0} clients inscrits</p>
        </div>
        <form method="GET">
          <input name="q" defaultValue={q} placeholder="Rechercher..." className="rounded-xl px-4 py-2.5 text-sm outline-none w-64"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        </form>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-5 gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"
          style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
          <span className="col-span-2">Client</span><span>Téléphone</span><span>Ville</span><span>Points</span>
        </div>

        {clients?.map((c: Profile) => (
          <div key={c.id} className="grid grid-cols-5 gap-4 px-5 py-4 items-center hover:bg-[var(--bg-card-hover)] transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="col-span-2 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: 'var(--primary)', color: '#fff' }}>
                {c.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold">{c.full_name}</p>
                <p className="text-xs text-[var(--text-muted)]">@{c.username}</p>
              </div>
            </div>
            <span className="text-sm text-[var(--text-muted)]">{c.phone}</span>
            <span className="text-sm">{c.city}</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm" style={{ color: 'var(--primary-light)' }}>⭐ {c.points_total}</span>
              <a href={`/admin/points?client=${c.id}`} className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--primary)20', color: 'var(--primary-light)' }}>
                Ajuster
              </a>
            </div>
          </div>
        ))}

        {(!clients || clients.length === 0) && (
          <div className="text-center py-16 text-[var(--text-muted)]">
            <p className="text-3xl mb-2">👤</p>
            <p className="text-sm">Aucun client trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}
