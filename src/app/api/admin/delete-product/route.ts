export const runtime = 'nodejs';
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body?.id;
    const name = String(body?.name || '').trim();
    if (id == null && !name) return new Response(JSON.stringify({ error: 'Missing id or name' }), { status: 400 });

    const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string;
    const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env as any).SUPABASE_SERVICE_ROLE) as string | undefined;
    if (!url || !serviceRole) return new Response(JSON.stringify({ error: 'Supabase admin credentials not configured' }), { status: 500 });

    const { createClient } = await import('@supabase/supabase-js');
    const admin = createClient(url, serviceRole);

    if (id != null) {
      const { error } = await admin.from('products').delete().eq('id', id as any);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      return new Response(JSON.stringify({ ok: true }));
    }
    const { error } = await admin.from('products').delete().eq('name', name);
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ ok: true }));
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 });
  }
}