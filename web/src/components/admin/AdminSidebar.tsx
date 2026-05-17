'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, ClipboardList, Users,
  Star, Gift, LogOut, Settings
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', roles: ['admin', 'manager', 'delivery'] },
  { href: '/admin/orders',    icon: ClipboardList,    label: 'Commandes',        roles: ['admin', 'manager', 'delivery'] },
  { href: '/admin/clients',   icon: Users,            label: 'Clients',          roles: ['admin', 'manager'] },
  { href: '/admin/products',  icon: Package,          label: 'Produits',         roles: ['admin', 'manager'] },
  { href: '/admin/points',    icon: Star,             label: 'Points',           roles: ['admin', 'manager'] },
  { href: '/admin/gifts',     icon: Gift,             label: 'Cadeaux',          roles: ['admin', 'manager'] },
  { href: '/admin/settings',  icon: Settings,         label: 'Paramètres',       roles: ['admin'] },
]

export default function AdminSidebar({ role, name }: { role: string; name: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const visibleItems = navItems.filter(item => item.roles.includes(role))

  return (
    <aside
      className="fixed top-0 left-0 h-full w-60 flex flex-col z-40"
      style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)' }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1 className="text-xl font-black gradient-text">Ordmora</h1>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5 uppercase tracking-wider">Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? 'var(--primary)20' : 'transparent',
                color: active ? 'var(--primary-light)' : 'var(--text-muted)',
                borderLeft: active ? '2px solid var(--primary)' : '2px solid transparent',
              }}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl" style={{ background: 'var(--bg)' }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">{name}</p>
            <p className="text-[10px] text-[var(--text-muted)] capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all hover:bg-[var(--danger)]/10"
          style={{ color: 'var(--danger)' }}
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
