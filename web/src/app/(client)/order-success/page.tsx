import Link from 'next/link'

interface OrderSuccessPageProps {
  searchParams: Promise<{ num?: string }>
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const params = await searchParams
  const orderNum = params.num ?? '—'

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* Checkmark */}
      <div
        className="flex items-center justify-center rounded-full mb-6"
        style={{
          width: 96,
          height: 96,
          background: 'rgba(16,185,129,0.15)',
          border: '2px solid rgba(16,185,129,0.4)',
        }}
      >
        <span style={{ fontSize: 48, lineHeight: 1 }}>✅</span>
      </div>

      {/* Heading */}
      <h1
        className="text-3xl font-bold text-center mb-3"
        style={{ color: 'var(--text)' }}
      >
        Commande confirmée !
      </h1>

      {/* Order number */}
      <div
        className="rounded-2xl px-6 py-4 mb-6 text-center"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
          Numéro de commande
        </p>
        <p className="text-2xl font-bold" style={{ color: 'var(--primary-light)' }}>
          #{orderNum}
        </p>
      </div>

      {/* Message */}
      <p
        className="text-center text-base leading-relaxed mb-10 max-w-xs"
        style={{ color: 'var(--text-muted)' }}
      >
        Votre commande est en cours de traitement. Vous serez contacté pour la livraison.
      </p>

      {/* CTA buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/orders"
          className="rounded-2xl py-4 text-center font-semibold text-base"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          Voir mes commandes
        </Link>
        <Link
          href="/store"
          className="rounded-2xl py-4 text-center font-semibold text-base"
          style={{
            background: 'transparent',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          }}
        >
          Continuer mes achats
        </Link>
      </div>
    </div>
  )
}
