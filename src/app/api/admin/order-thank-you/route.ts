export const runtime = 'nodejs';
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || '').trim();
    const name = String(body?.customer_name || '').trim();
    const tracking = String(body?.tracking_code || '').trim();
    if (!email) return new Response(JSON.stringify({ error: 'Missing email' }), { status: 400 });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'Missing RESEND_API_KEY' }), { status: 500 });
    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || 'onboarding@resend.dev';
    const fromName = process.env.RESEND_FROM_NAME || 'Maison Hannie';
    const from = `${fromName} <${fromEmail}>`;

    const subject = 'Thank you for your order';
    const origin = process.env.NEXT_PUBLIC_SITE_URL || '';
    const trackUrl = tracking ? `${origin || ''}/track-order?code=${tracking}` : `${origin || ''}/track-order`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>Thank you${name ? ', ' + name : ''}!</h2>
        <p>Your order${tracking ? ' (' + tracking + ')' : ''} has been confirmed. We are preparing it for delivery.</p>
        <p>You can track your order status here: <a href="${trackUrl}">${trackUrl}</a></p>
        <p>Warm regards,<br/>Maison Hannie</p>
      </div>
    `;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from, to: [email], subject, html })
    });
    if (!resp.ok) return new Response(JSON.stringify({ error: 'Failed to send thank you email' }), { status: 500 });
    return new Response(JSON.stringify({ ok: true }));
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}