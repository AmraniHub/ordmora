import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/client/BottomNav'
import { CartProvider } from '@/context/CartContext'
import PageTransition from '@/components/client/PageTransition'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col" style={{ paddingBottom: '72px' }}>
        <main className="flex-1"><PageTransition>{children}</PageTransition></main>
        <BottomNav />
      </div>
    </CartProvider>
  )
}
