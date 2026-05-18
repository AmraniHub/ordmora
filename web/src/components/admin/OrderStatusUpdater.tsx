'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import type { OrderStatus } from '@/types'

const statuses: { value: OrderStatus; label: string }[] = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'en_cours',   label: 'En cours' },
  { value: 'livree',     label: 'Livrée' },
  { value: 'annulee',    label: 'Annulée' },
]

const colors: Record<OrderStatus, string> = {
  en_attente: 'var(--warning)',
  en_cours:   'var(--accent)',
  livree:     'var(--success)',
  annulee:    'var(--danger)',
}

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
  clientPhone = '',
  clientName = '',
  orderNumber = '',
}: {
  orderId: string
  currentStatus: OrderStatus
  clientPhone?: string
  clientName?: string
  orderNumber?: string
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const [supabase] = useState(() => createClient())

  async function handleChange(newStatus: OrderStatus) {
    if (newStatus === status) return
    setSaving(true)
    try {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
      setStatus(newStatus)

      // Fire WhatsApp notification (best-effort, don't block on failure)
      if (clientPhone) {
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: clientPhone, name: clientName, orderNumber, status: newStatus }),
        }).catch(() => {})
      }

      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={e => handleChange(e.target.value as OrderStatus)}
        disabled={saving}
        className="text-xs rounded-lg px-2 py-1.5 outline-none cursor-pointer"
        style={{
          background: `${colors[status]}20`,
          color: colors[status],
          border: `1px solid ${colors[status]}`,
        }}
      >
        {statuses.map(s => (
          <option key={s.value} value={s.value} style={{ background: 'var(--bg-card)', color: 'var(--text)' }}>
            {s.label}
          </option>
        ))}
      </select>
      {saving && <Loader2 size={14} className="animate-spin text-[var(--text-muted)]" />}
    </div>
  )
}
