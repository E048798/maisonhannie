import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code')
    if (!code) return new Response(JSON.stringify({ error: 'Missing code' }), { status: 400 })
    const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string
    const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env as any).SUPABASE_SERVICE_ROLE) as string | undefined
    if (!url || !serviceRole) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 })
    }
    const admin = createClient(url, serviceRole)
    const { data, error } = await admin.from('orders').select('*').ilike('tracking_code', code).limit(1)
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    const order = data && data[0] ? data[0] : null
    return new Response(JSON.stringify({ order }), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || 'Server error') }), { status: 500 })
  }
}
export const runtime = 'nodejs'