import { LogIn, UserPlus } from 'lucide-react'

export default function LoginPrompt({ message }: { message: string }) {
  return (
    <div className="max-w-lg mx-auto px-4 pt-24 pb-8 flex flex-col items-center text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: 'var(--primary)20', border: '2px solid var(--primary)40' }}
      >
        <LogIn size={32} style={{ color: 'var(--primary-light)' }} />
      </div>

      <h2 className="text-xl font-bold mb-2">Compte requis</h2>
      <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>{message}</p>

      <a
        href="/auth/login"
        className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 mb-3 transition-opacity hover:opacity-90"
        style={{ background: 'var(--primary)', color: '#fff' }}
      >
        <LogIn size={16} /> Se connecter
      </a>

      <a
        href="/auth/register"
        className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
        style={{ background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)' }}
      >
        <UserPlus size={16} /> Créer un compte
      </a>

      <a href="/store" className="mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
        ← Retour à la boutique
      </a>
    </div>
  )
}
