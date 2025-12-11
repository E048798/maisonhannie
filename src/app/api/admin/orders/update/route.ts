import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const id = String(body?.id || '').trim()
    const updates = body?.updates || {}
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 })
    const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string
    const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env as any).SUPABASE_SERVICE_ROLE) as string | undefined
    if (!url || !serviceRole) return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 })
    const admin = createClient(url, serviceRole)
    const { data, error } = await admin.from('orders').update(updates).eq('id', id).select('*').limit(1)
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    return new Response(JSON.stringify({ order: data && data[0] ? data[0] : null }))
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 })
  }
}