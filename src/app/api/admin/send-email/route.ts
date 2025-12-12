export const runtime = 'nodejs';
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const to = Array.isArray(body?.to) ? body.to : (body?.to ? [String(body.to)] : []);
    const subject = String(body?.subject || '').trim();
    const html = String(body?.html || '').trim();
    const attachments = Array.isArray(body?.attachments) ? body.attachments : [];
    if (!to.length || !subject || !html) return new Response(JSON.stringify({ error: 'Missing to/subject/html' }), { status: 400 });
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'Missing RESEND_API_KEY' }), { status: 500 });
    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || 'onboarding@resend.dev';
    const fromName = process.env.RESEND_FROM_NAME || 'Maison Hannie';
    const from = `${fromName} <${fromEmail}>`;
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from, to, subject, html, attachments })
    });
    if (!resp.ok) return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 500 });
    return new Response(JSON.stringify({ ok: true }));
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}