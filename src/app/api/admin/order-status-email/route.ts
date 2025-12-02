export const runtime = 'nodejs';
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || '').trim();
    const status = String(body?.status || '').trim();
    const tracking = String(body?.tracking_code || '').trim();
    const name = String(body?.customer_name || '').trim();
    if (!email || !status) return new Response(JSON.stringify({ error: 'Missing email or status' }), { status: 400 });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'Missing RESEND_API_KEY' }), { status: 500 });
    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || 'onboarding@resend.dev';
    const fromName = process.env.RESEND_FROM_NAME || 'Maison Hannie';
    const from = `${fromName} <${fromEmail}>`;

    const subject = `Your order status: ${status}`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>Order Update${name ? ', ' + name : ''}</h2>
        <p>Your order${tracking ? ' (' + tracking + ')' : ''} status is now: <strong>${status}</strong>.</p>
        <p>Thank you for shopping with Maison Hannie.</p>
      </div>
    `;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from, to: [email], subject, html })
    });
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
    }
    return new Response(JSON.stringify({ ok: true }));
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}