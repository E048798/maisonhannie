export const runtime = 'nodejs';
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tracking = String(body?.tracking_code || '').trim();
    const total = Number(body?.total || 0);
    const customer = String(body?.customer_name || '').trim();
    const created = String(body?.created_date || '').trim();
    const recipientsEnv = process.env.RESEND_ADMIN_RECIPIENTS || '';
    const adminEmail = process.env.RESEND_ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || '';
    const recipients = recipientsEnv
      ? recipientsEnv.split(',').map((x) => x.trim()).filter(Boolean)
      : (adminEmail ? [adminEmail] : []);
    if (!recipients.length) return new Response(JSON.stringify({ error: 'Missing RESEND_ADMIN_RECIPIENTS/RESEND_ADMIN_EMAIL' }), { status: 500 });
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'Missing RESEND_API_KEY' }), { status: 500 });
    const fromName = process.env.RESEND_FROM_NAME || 'Maison Hannie';
    const from = `${fromName} <${adminEmail || (recipients[0] || 'onboarding@resend.dev')}>`;

    const subject = `New order ${tracking || ''}`.trim();
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>New order received</h2>
        <p><strong>Customer:</strong> ${customer}</p>
        <p><strong>Total:</strong> ₦${total.toLocaleString()}</p>
        <p><strong>Tracking:</strong> ${tracking}</p>
        <p><strong>Created:</strong> ${created}</p>
      </div>
    `;
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from, to: recipients, subject, html })
    });
    if (!resp.ok) return new Response(JSON.stringify({ error: 'Failed to send alert' }), { status: 500 });
    return new Response(JSON.stringify({ ok: true }));
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}