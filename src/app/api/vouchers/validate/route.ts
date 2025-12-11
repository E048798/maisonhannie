import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = String(body?.code || '').trim();
    const email = String(body?.email || '').trim();
    if (!code) return new Response(JSON.stringify({ error: 'Missing voucher code' }), { status: 400 });
    if (!email) return new Response(JSON.stringify({ error: 'Missing email' }), { status: 400 });

    const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string;
    const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env as any).SUPABASE_SERVICE_ROLE) as string | undefined;
    if (!url || !serviceRole) return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
    const admin = createClient(url, serviceRole);

    const { data: vRows, error: vErr } = await admin.from('vouchers').select('id,first_time_only,single_use_per_customer,active').eq('code', code).limit(1);
    if (vErr) return new Response(JSON.stringify({ error: 'Voucher lookup failed' }), { status: 500 });
    const v = vRows && vRows[0];
    if (!v) return new Response(JSON.stringify({ error: 'Invalid voucher code' }), { status: 404 });
    if (v.active === false) return new Response(JSON.stringify({ error: 'Voucher inactive' }), { status: 400 });

    let firstTimeOk = true;
    let singleUseOk = true;
    if (v.first_time_only) {
      const { data: ordersAny } = await admin.from('orders').select('id').eq('email', email).limit(1);
      firstTimeOk = !(ordersAny && ordersAny[0]);
    }
    if (v.single_use_per_customer) {
      const { data: ordersWithVoucher } = await admin.from('orders').select('id').eq('email', email).eq('voucher_code', code).limit(1);
      singleUseOk = !(ordersWithVoucher && ordersWithVoucher[0]);
    }

    if (!firstTimeOk) return new Response(JSON.stringify({ ok: false, reason: 'first_time_only_violation' }), { status: 200 });
    if (!singleUseOk) return new Response(JSON.stringify({ ok: false, reason: 'single_use_violation' }), { status: 200 });
    return new Response(JSON.stringify({ ok: true }));
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 });
  }
}