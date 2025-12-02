export const runtime = 'nodejs';
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || '').trim();
    const name = String(body?.name || '').trim();
    const subjectLine = String(body?.subject || '').trim();
    const messageText = String(body?.message || '').trim();
    const whatsappConsent = Boolean(body?.whatsappConsent);
    if (!email) return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: 'Missing RESEND_API_KEY' }), { status: 500 });
    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || 'onboarding@resend.dev';
    const fromName = process.env.RESEND_FROM_NAME || 'Maison Hannie';
    const from = `${fromName} <${fromEmail}>`;

    // 1) Send autoresponder to user
    const userSubject = 'We received your message';
    const userHtml = `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>Thanks for contacting us${name ? ', ' + name : ''}.</h2>
        <p>We have received your message and will get back to you within 24 hours.</p>
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
        body: JSON.stringify({ from, to: email, subject: userSubject, html: userHtml }),
      });
      // Best-effort: proceed even if autoresponder fails
      await resp.text();
    } catch {}

    // 2) Notify admins
    const adminRecipients = [
      'eudaimontech@gmail.com',
      'sikirullaihanifat@gmail.com',
      'hello@maisonhannie.store',
    ];
    const adminSubject = `New Contact Message from ${name || 'Unknown'}`;
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name || 'N/A'}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${subjectLine ? `<p><strong>Subject:</strong> ${subjectLine}</p>` : ''}
        <p><strong>WhatsApp Consent:</strong> ${whatsappConsent ? 'Yes' : 'No'}</p>
        <p><strong>Message:</strong></p>
        <div style="white-space:pre-line;">${messageText || 'No message provided'}</div>
        <hr style="margin:16px 0;" />
        <p style="color:#555">Sent from Maison Hannie contact form</p>
      </div>
    `;

    try {
      const respAdmin = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ from, to: adminRecipients, subject: adminSubject, html: adminHtml }),
      });
      const dataAdmin = await respAdmin.json();
      if (!respAdmin.ok) return new Response(JSON.stringify({ error: dataAdmin?.error || 'Failed to notify admins' }), { status: 500 });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Email service unavailable' }), { status: 502 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }
}