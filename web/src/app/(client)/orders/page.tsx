import { createClient } from '@/lib/supabase/server'
import OrdersRealtime from '@/components/client/OrdersRealtime'
import LoginPrompt from '@/components/client/LoginPrompt'
import type { Order } from '@/types'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <LoginPrompt message="Connectez-vous pour voir vos commandes" />

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, image_url))')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <h1 className="text-2xl font-bold mb-6">Mes Commandes</h1>
      <OrdersRealtime
        initialOrders={(orders ?? []) as Order[]}
        userId={user.id}
      />
    </div>
  )
}
