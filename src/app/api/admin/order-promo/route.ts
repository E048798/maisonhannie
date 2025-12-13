export const runtime = 'nodejs';
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || '').trim();
    const name = String(body?.customer_name || '').trim();
    const tracking = String(body?.tracking_code || '').trim();
    if (!email) return new Response(JSON.stringify({ error: 'Missing email' }), { status: 400 });

    let admin: any = null;
    try {
      const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string;
      const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env as any).SUPABASE_SERVICE_ROLE) as string | undefined;
      if (url && serviceRole) {
        const { createClient } = await import('@supabase/supabase-js');
        admin = createClient(url, serviceRole);
      }
    } catch {}

    if (admin && tracking) {
      try {
        const { data: orderRow } = await admin
          .from('orders')
          .select('id, promo_sent')
          .eq('tracking_code', tracking)
          .limit(1)
          .single();
        if (orderRow && orderRow.promo_sent) {
          return new Response(JSON.stringify({ ok: true, deduped: true }));
        }
      } catch {}
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'Missing RESEND_API_KEY' }), { status: 500 });
    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || 'onboarding@resend.dev';
    const fromName = process.env.RESEND_FROM_NAME || 'Maison Hannie';
    const from = `${fromName} <${fromEmail}>`;

    const subject = 'Thank you for your order — discover more';
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>Thanks again${name ? ', ' + name : ''}!</h2>
        <p>We hope you loved your purchase${tracking ? ' (' + tracking + ')' : ''}. Explore other handcrafted pieces we think you might enjoy.</p>
        <p><a href="https://maisonhannie.store/shop">Browse our collections</a></p>
        <p>Warm regards,<br/>Maison Hannie</p>
      </div>
    `;
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from, to: [email], subject, html })
    });
    if (!resp.ok) return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
    try {
      if (admin && tracking) {
        const { data: orderRow } = await admin
          .from('orders')
          .select('id')
          .eq('tracking_code', tracking)
          .limit(1)
          .single();
        const id = orderRow?.id;
        if (id) {
          await admin
            .from('orders')
            .update({ promo_sent: true })
            .eq('id', id);
        }
      }
    } catch {}
    return new Response(JSON.stringify({ ok: true, deduped: false }));
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}