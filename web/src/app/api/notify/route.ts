import { NextRequest, NextResponse } from 'next/server'

const statusMessages: Record<string, string> = {
  en_attente: '✅ Votre commande *{{num}}* a bien été reçue ! Nous la préparons pour vous.',
  en_cours:   '🚚 Votre commande *{{num}}* est en route ! Notre livreur arrive bientôt.',
  livree:     '🎉 Votre commande *{{num}}* a été livrée. Merci pour votre confiance ! Vous avez gagné des points ⭐',
  annulee:    '❌ Votre commande *{{num}}* a été annulée. Contactez-nous pour plus d\'informations.',
}

export async function POST(request: NextRequest) {
  try {
    const { phone, name, orderNumber, status } = await request.json()

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken  = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM // e.g. whatsapp:+14155238886

    // If Twilio not configured, log and return OK (graceful degradation)
    if (!accountSid || !authToken || !fromNumber) {
      console.log('[notify] Twilio not configured — skipping WhatsApp for', phone)
      return NextResponse.json({ ok: true, skipped: true })
    }

    const template = statusMessages[status] ?? statusMessages['en_attente']
    const body = `Bonjour ${name} 👋\n\n${template.replace('{{num}}', orderNumber)}\n\n— Ordmora`

    // Format phone: strip spaces, ensure starts with +
    const to = 'whatsapp:' + phone.replace(/\s/g, '').replace(/^0/, '+212')

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ From: fromNumber, To: to, Body: body }).toString(),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('[notify] Twilio error:', err)
      return NextResponse.json({ ok: false, error: err }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[notify] Error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
