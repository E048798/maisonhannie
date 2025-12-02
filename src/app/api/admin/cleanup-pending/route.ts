import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(_req: NextRequest) {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string
  const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env as any).SUPABASE_SERVICE_ROLE) as string | undefined
  if (!url || !serviceRole) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 })
  }
  const admin = createClient(url, serviceRole)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { error } = await admin
    .from('orders')
    .delete()
    .lte('created_date', sevenDaysAgo)
    .eq('status', 'pending')
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
export const runtime = 'nodejs'