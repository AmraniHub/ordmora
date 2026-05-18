'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, ClipboardList, Star, Gift, UserCircle } from 'lucide-react'

const tabs = [
  { href: '/store', icon: ShoppingBag, label: 'Boutique' },
  { href: '/orders', icon: ClipboardList, label: 'Commandes' },
  { href: '/wallet', icon: Star, label: 'Points' },
  { href: '/gifts', icon: Gift, label: 'Cadeaux' },
  { href: '/profile', icon: UserCircle, label: 'Profil' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-3"
      style={{
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
      }}
    >
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-all"
            style={{ color: active ? 'var(--primary-light)' : 'var(--text-muted)' }}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
            {active && (
              <span className="absolute bottom-2 w-1 h-1 rounded-full" style={{ background: 'var(--primary)' }} />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
