import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const deviceId = req.nextUrl.searchParams.get('device_id');
    if (!deviceId) return new Response(JSON.stringify({ items: [] }), { status: 200 });
    const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string;
    const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env as any).SUPABASE_SERVICE_ROLE) as string | undefined;
    if (!url || !serviceRole) return new Response(JSON.stringify({ items: [] }), { status: 200 });
    const admin = createClient(url, serviceRole);
    const { data } = await admin.from('cart_sessions').select('items').eq('device_id', deviceId).limit(1);
    const row = data && data[0];
    return new Response(JSON.stringify({ items: row?.items || [] }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ items: [] }), { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const deviceId = String(body?.device_id || '').trim();
    const items = Array.isArray(body?.items) ? body.items : [];
    if (!deviceId) return new Response(JSON.stringify({ ok: false }), { status: 400 });
    const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string;
    const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env as any).SUPABASE_SERVICE_ROLE) as string | undefined;
    if (!url || !serviceRole) return new Response(JSON.stringify({ ok: false }), { status: 200 });
    const admin = createClient(url, serviceRole);
    await admin.from('cart_sessions').upsert({ device_id: deviceId, items });
    return new Response(JSON.stringify({ ok: true }));
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 200 });
  }
}