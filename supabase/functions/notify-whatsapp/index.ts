import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TWILIO_SID   = Deno.env.get('TWILIO_ACCOUNT_SID')!
const TWILIO_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!
const TWILIO_FROM  = Deno.env.get('TWILIO_WHATSAPP_FROM')!  // whatsapp:+14155238886

const statusMessages: Record<string, string> = {
  en_cours: '🚚 Votre commande *{order_number}* est en cours de livraison. Nous vous contacterons bientôt. — Ordmora',
  livree:   '✅ Votre commande *{order_number}* a été livrée ! Merci pour votre confiance. Vous avez gagné *{points} points* 🎁 — Ordmora',
  annulee:  '❌ Votre commande *{order_number}* a été annulée. Contactez-nous pour plus d\'informations. — Ordmora',
}

async function sendWhatsApp(to: string, message: string) {
  const body = new URLSearchParams({
    From: TWILIO_FROM,
    To: `whatsapp:+${to.replace(/\D/g, '')}`,
    Body: message,
  })

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    }
  )
  return res.ok
}

serve(async (req) => {
  try {
    const { record, old_record } = await req.json()

    // Only fire when status actually changes
    if (!record || record.status === old_record?.status) {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 })
    }

    const template = statusMessages[record.status]
    if (!template) return new Response(JSON.stringify({ skipped: true }), { status: 200 })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get client phone
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone, full_name')
      .eq('id', record.client_id)
      .single()

    if (!profile?.phone) {
      return new Response(JSON.stringify({ error: 'No phone' }), { status: 200 })
    }

    // Get points earned (for livree message)
    let points = 0
    if (record.status === 'livree') {
      const { data: items } = await supabase
        .from('order_items')
        .select('points_earned')
        .eq('order_id', record.id)
      points = items?.reduce((s: number, i: { points_earned: number }) => s + i.points_earned, 0) ?? 0
    }

    const message = template
      .replace('{order_number}', record.order_number)
      .replace('{points}', String(points))

    const sent = await sendWhatsApp(profile.phone, message)

    return new Response(JSON.stringify({ sent, phone: profile.phone }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
