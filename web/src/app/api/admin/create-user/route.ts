import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // 1. Verify the caller is an authenticated admin
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: caller } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!caller || caller.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé — rôle admin requis' }, { status: 403 })
  }

  // 2. Parse body
  const { email, full_name, role, password } = await request.json()
  if (!email || !full_name || !role || !password) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  // 3. Use service-role client to create the auth user
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: newUser, error: authError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError || !newUser.user) {
    return NextResponse.json({ error: authError?.message ?? 'Erreur création auth' }, { status: 400 })
  }

  // 4. Insert into admin_users
  const { error: dbError } = await adminSupabase.from('admin_users').insert({
    id: newUser.user.id,
    email,
    full_name,
    role,
    is_active: true,
  })

  if (dbError) {
    // Roll back: delete the auth user we just created
    await adminSupabase.auth.admin.deleteUser(newUser.user.id)
    return NextResponse.json({ error: dbError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
