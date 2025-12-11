import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  try {
    const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string
    const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env as any).SUPABASE_SERVICE_ROLE) as string | undefined
    if (!url || !serviceRole) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 })
    }
    const admin = createClient(url, serviceRole)
    const page = Number(req.nextUrl.searchParams.get('page') || 1)
    const limit = Number(req.nextUrl.searchParams.get('limit') || 20)
    const from = (page - 1) * limit
    const to = from + limit - 1
    const { data, error, count } = await admin
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_date', { ascending: false })
      .range(from, to)
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    return new Response(JSON.stringify({ orders: data || [], total: count || 0, page, limit }), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || 'Server error') }), { status: 500 })
  }
}
export const runtime = 'nodejs'