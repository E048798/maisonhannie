export const runtime = 'nodejs';
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim();
    const phone = String(body?.phone || '').trim();
    const eventType = String(body?.eventType || '').trim();
    const guests = String(body?.guests || '').trim();
    const date = String(body?.date || '').trim();
    const message = String(body?.message || '').trim();
    if (!name || !email) return new Response(JSON.stringify({ error: 'Missing name or email' }), { status: 400 });

    try {
      const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string;
      const serviceRole = (process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env as any).SUPABASE_SERVICE_ROLE) as string | undefined;
      if (url && serviceRole) {
        const { createClient } = await import('@supabase/supabase-js');
        const admin = createClient(url, serviceRole);
        await admin.from('catering_inquiries').insert({
          name,
          email,
          phone: phone || null,
          event_type: eventType || null,
          guests: guests ? Number(guests) : null,
          event_date: date || null,
          message: message || null,
        });
      }
    } catch {}

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'Missing RESEND_API_KEY' }), { status: 500 });
    const recipientsEnv = process.env.RESEND_ADMIN_RECIPIENTS || '';
    const adminEmail = process.env.RESEND_ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || '';
    const recipients = recipientsEnv
      ? recipientsEnv.split(',').map((x) => x.trim()).filter(Boolean)
      : (adminEmail ? [adminEmail] : []);
    const fromName = process.env.RESEND_FROM_NAME || 'Maison Hannie';
    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || 'onboarding@resend.dev';
    const from = `${fromName} <${fromEmail}>`;

    const adminSubject = 'New catering inquiry';
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>New Catering Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Event Type:</strong> ${eventType}</p>
        <p><strong>Guests:</strong> ${guests}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Details:</strong> ${message}</p>
      </div>
    `;
    if (recipients.length) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ from, to: recipients, subject: adminSubject, html: adminHtml })
      });
    }

    const userSubject = 'We received your catering inquiry';
    const userHtml = `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>Thank you${name ? ', ' + name : ''}!</h2>
        <p>We have received your catering inquiry and will contact you within 24 hours.</p>
        <p>We look forward to making your ${eventType || 'event'} special.</p>
        <p>Warm regards,<br/>Maison Hannie</p>
      </div>
    `;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from, to: [email], subject: userSubject, html: userHtml })
    });

    return new Response(JSON.stringify({ ok: true }));
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}