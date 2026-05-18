// Server-side only — service role key, bypasses RLS
// Uses direct REST fetch to avoid client-library issues in Next.js server components

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function adminFetch(
  table: string,
  params: Record<string, string> = {}
): Promise<unknown[]> {
  const query = new URLSearchParams(params).toString()
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? '?' + query : ''}`

  const res = await fetch(url, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`adminFetch error [${table}]:`, res.status, text)
    return []
  }

  return res.json()
}
