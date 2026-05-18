import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/client/BottomNav'
import { CartProvider } from '@/context/CartContext'
import PageTransition from '@/components/client/PageTransition'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  await supabase.auth.getUser() // refresh session cookie only

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col" style={{ paddingBottom: '72px' }}>
        <main className="flex-1"><PageTransition>{children}</PageTransition></main>
        <BottomNav />
      </div>
    </CartProvider>
  )
}
