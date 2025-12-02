import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      reference,
      customer_name,
      phone,
      address,
      landmark,
      city,
      state,
      items,
      total,
      email,
    } = body || {}
    if (!reference || !customer_name || !total) {
      return new Response(JSON.stringify({ error: 'Missing reference, customer_name or total' }), { status: 400 })
    }
    const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string
    const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env as any).SUPABASE_SERVICE_ROLE) as string | undefined
    if (!url || !serviceRole) {
      return new Response(JSON.stringify({ error: 'Server configuration error', details: { url: !!url, key: !!serviceRole } }), { status: 500 })
    }
    const admin = createClient(url, serviceRole)
    const statusHistory = [{ status: 'pending', timestamp: new Date().toISOString(), note: 'Order created, awaiting payment' }]
    const { data, error } = await admin
      .from('orders')
      .insert({
        tracking_code: String(reference),
        customer_name: String(customer_name),
        phone: phone ? String(phone) : null,
        address: address ? String(address) : null,
        landmark: landmark ? String(landmark) : null,
        city: city ? String(city) : null,
        state: state ? String(state) : null,
        items: Array.isArray(items) ? items : [],
        total: Number(total) || 0,
        status: 'pending',
        status_history: statusHistory,
        email: email ? String(email) : null,
      })
      .select('*')
      .limit(1)
    if (error) {
      const existing = await admin.from('orders').select('*').eq('tracking_code', String(reference)).limit(1)
      if (existing.data && existing.data[0]) {
        return new Response(JSON.stringify({ order: existing.data[0], warning: 'Order already existed' }), { status: 200 })
      }
      return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }
    return new Response(JSON.stringify({ order: data && data[0] ? data[0] : null }), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || 'Server error') }), { status: 500 })
  }
}
export const runtime = 'nodejs'