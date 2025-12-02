import { NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return new Response(JSON.stringify({ error: 'PAYSTACK_SECRET_KEY not configured' }), { status: 500 });
    }
    const reference = req.nextUrl.searchParams.get('reference');
    if (!reference) {
      return new Response(JSON.stringify({ error: 'Missing reference' }), { status: 400 });
    }
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
    });
  const data = await res.json();
  if (!res.ok) {
    return new Response(JSON.stringify({ error: data }), { status: res.status });
  }
  let insertedOrder: any = null;
  try {
    const payload = data?.data;
    const status = String(payload?.status || '')
    const reference = String(payload?.reference || '')
    const md = payload?.metadata || {}
    if (status === 'success' && reference) {
      const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string;
      const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env as any).SUPABASE_SERVICE_ROLE) as string | undefined;
      const adminSupabase = serviceRole ? createClient(url, serviceRole) : getSupabase();
      const statusHistory = [{ status: 'confirmed', timestamp: new Date().toISOString(), note: 'Payment verified' }];
      const existing = await adminSupabase.from('orders').select('id,status,status_history').eq('tracking_code', reference).limit(1);
      if (existing.data && existing.data[0]) {
        const prevHistory = Array.isArray(existing.data[0].status_history) ? existing.data[0].status_history : [];
        const newHistory = [...prevHistory, ...statusHistory];
        const { data: upd, error: updErr } = await adminSupabase
          .from('orders')
          .update({
            customer_name: String(md?.customer_name || ''),
            phone: String(md?.phone || ''),
            address: String(md?.address || ''),
            landmark: md?.landmark ? String(md.landmark) : null,
            city: String(md?.city || ''),
            state: String(md?.state || ''),
            items: md?.items || [],
            total: Number(md?.total || 0),
            status: 'confirmed',
            status_history: newHistory,
            email: String(md?.email || ''),
          })
          .eq('tracking_code', reference)
          .select('*')
          .limit(1);
        if (updErr) {
          return new Response(JSON.stringify({ ...data, order_error: updErr.message }), { status: 200 });
        }
        insertedOrder = upd && upd[0] ? upd[0] : null;
      } else {
        const { data: inserted, error: insertError } = await adminSupabase.from('orders').insert({
          tracking_code: reference,
          customer_name: String(md?.customer_name || ''),
          phone: String(md?.phone || ''),
          address: String(md?.address || ''),
          landmark: md?.landmark ? String(md.landmark) : null,
          city: String(md?.city || ''),
          state: String(md?.state || ''),
          items: md?.items || [],
          total: Number(md?.total || 0),
          status: 'confirmed',
          status_history: statusHistory,
          email: String(md?.email || ''),
        }).select('*').limit(1);
        if (insertError) {
          return new Response(JSON.stringify({ ...data, order_error: insertError.message }), { status: 200 });
        }
        insertedOrder = inserted && inserted[0] ? inserted[0] : null;
      }
      const name = String(md?.customer_name || '');
      const email = String(md?.email || '');
      if (email) {
        fetch(`${new URL(req.url).origin}/api/admin/order-status-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, status: 'confirmed', tracking_code: reference, customer_name: name })
        }).catch(() => {});
      }
      fetch(`${new URL(req.url).origin}/api/admin/new-order-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking_code: reference, total: Number(md?.total || 0), customer_name: name, created_date: new Date().toISOString() })
      }).catch(() => {});
    }
  } catch {}
  return new Response(JSON.stringify({ ...data, order: insertedOrder }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Unknown error' }), { status: 500 });
  }
}
export const runtime = 'nodejs'