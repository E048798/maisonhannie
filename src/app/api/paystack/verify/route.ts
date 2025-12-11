import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
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
      if (!url || !serviceRole) {
        return new Response(JSON.stringify({ error: 'Server configuration error: missing SUPABASE_SERVICE_ROLE_KEY or URL' }), { status: 500 });
      }
      const adminSupabase = createClient(url, serviceRole);
      const statusHistoryEntry = { status: 'confirmed', timestamp: new Date().toISOString(), note: 'Payment verified' };
      const existing = await adminSupabase.from('orders').select('id,status,status_history').eq('tracking_code', reference).limit(1);
      let justConfirmed = false;
      let allowVoucher = true;
      let voucherCode: string | null = md?.voucher_code ? String(md.voucher_code) : null;
      let discountAmt: number = Number(md?.discount_amount || 0);
      if (voucherCode) {
        try {
          const { data: vRows } = await adminSupabase.from('vouchers').select('*').eq('code', voucherCode).limit(1);
          const v = vRows && vRows[0];
          if (!v || v.active === false) allowVoucher = false;
          const email = String(md?.email || '');
          if (email) {
            if (v?.first_time_only) {
              const { data: anyOrder } = await adminSupabase.from('orders').select('id').eq('email', email).limit(1);
              if (anyOrder && anyOrder[0]) allowVoucher = false;
            }
            if (v?.single_use_per_customer) {
              const { data: used } = await adminSupabase.from('orders').select('id').eq('email', email).eq('voucher_code', voucherCode).limit(1);
              if (used && used[0]) allowVoucher = false;
            }
          }
          if (allowVoucher) {
            const type = String(v.discount_type) === 'fixed' ? 'fixed' : 'percent';
            const val = Number(v.discount_value || 0);
            const max = v.max_discount != null ? Number(v.max_discount) : Number.POSITIVE_INFINITY;
            discountAmt = Math.min(type === 'percent' ? Number(md?.total || 0) * (val / 100) : val, Number(md?.total || 0), max);
          } else {
            voucherCode = null;
            discountAmt = 0;
          }
        } catch {
          allowVoucher = false;
          voucherCode = null;
          discountAmt = 0;
        }
      }
      if (existing.data && existing.data[0]) {
        const prevStatus = String(existing.data[0].status || '');
        const prevHistory = Array.isArray(existing.data[0].status_history) ? existing.data[0].status_history : [];
        const last = prevHistory[prevHistory.length - 1];
        const historyAlreadyConfirmed = last && String(last.status) === 'confirmed';
        const newHistory = historyAlreadyConfirmed ? prevHistory : [...prevHistory, statusHistoryEntry];
        justConfirmed = prevStatus !== 'confirmed';
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
            voucher_code: voucherCode,
            discount_amount: discountAmt,
          })
          .eq('tracking_code', reference)
          .select('*')
          .limit(1);
        if (updErr) {
          return new Response(JSON.stringify({ error: `Order update failed: ${updErr.message}` }), { status: 500 });
        }
        insertedOrder = upd && upd[0] ? upd[0] : null;
      } else {
        justConfirmed = true;
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
          status_history: [statusHistoryEntry],
          email: String(md?.email || ''),
          voucher_code: voucherCode,
          discount_amount: discountAmt,
        }).select('*').limit(1);
        if (insertError) {
          return new Response(JSON.stringify({ error: `Order insert failed: ${insertError.message}` }), { status: 500 });
        }
        insertedOrder = inserted && inserted[0] ? inserted[0] : null;
      }
      const name = String(md?.customer_name || '');
      const email = String(md?.email || '');
      if (email && justConfirmed) {
        fetch(`${new URL(req.url).origin}/api/admin/order-status-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, status: 'confirmed', tracking_code: reference, customer_name: name })
        }).catch(() => {});
      }
      if (justConfirmed) {
        fetch(`${new URL(req.url).origin}/api/admin/new-order-alert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tracking_code: reference, total: Number(md?.total || 0), customer_name: name, created_date: new Date().toISOString() })
        }).catch(() => {});
      }
      if (md?.voucher_code) {
        try {
          const vcode = String(md.voucher_code);
          const { data: vRows } = await adminSupabase.from('vouchers').select('id,usage_count,usage_limit').eq('code', vcode).limit(1);
          const v = vRows && vRows[0];
          if (v) {
            const current = Number(v.usage_count || 0);
            const limit = v.usage_limit == null ? null : Number(v.usage_limit);
            if (limit == null || current < limit) {
              await adminSupabase.from('vouchers').update({ usage_count: current + 1 }).eq('id', v.id);
            }
          }
        } catch {}
      }
    }
  } catch {}
  return new Response(JSON.stringify({ ...data, order: insertedOrder }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Unknown error' }), { status: 500 });
  }
}
export const runtime = 'nodejs'