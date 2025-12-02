export const runtime = 'nodejs';
import { supabase } from '@/lib/supabaseClient';
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || '').trim();
    const name = String(body?.name || '').trim();
    if (!email) return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 });

    const { data: existing, error: selectError } = await supabase
      .from('newsletter_subscriptions')
      .select('id')
      .eq('email', email)
      .limit(1);
    if (selectError) return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
    if (!existing || existing.length === 0) {
      const { error: insertError } = await supabase
        .from('newsletter_subscriptions')
        .insert({ email, name });
      if (insertError) return new Response(JSON.stringify({ error: 'Failed to save subscription' }), { status: 500 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'Missing RESEND_API_KEY' }), { status: 500 });
    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || 'onboarding@resend.dev';
    const fromName = process.env.RESEND_FROM_NAME || 'Maison Hannie';
    const from = `${fromName} <${fromEmail}>`;

    const subject = 'Welcome to Maison Hannie';
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>Thank you for subscribing${name ? ', ' + name : ''}!</h2>
        <p>You are now part of our community. Expect exclusive offers, new collection alerts, and artisan stories.</p>
        <p>Warm regards,<br/>Maison Hannie</p>
      </div>
    `;
    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ from, to: email, subject, html }),
      });
      const data = await resp.json();
      if (!resp.ok) return new Response(JSON.stringify({ error: data?.error || 'Failed to send email' }), { status: 500 });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Email service unavailable' }), { status: 502 });
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }
}