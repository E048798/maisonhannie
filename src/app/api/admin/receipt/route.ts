export const runtime = 'nodejs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const order = body?.order || {};
    const email = String(order?.email || body?.email || '').trim();
    const name = String(order?.customer_name || body?.customer_name || '').trim();
    const tracking = String(order?.tracking_code || body?.tracking_code || '').trim();
    const items: Array<{ name: string; quantity: number; price: number }> = Array.isArray(order?.items) ? order.items : (body?.items || []);
    const subtotal = items.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 1), 0);
    const shipping = Number(order?.shipping_fee ?? body?.shipping_fee ?? 0);
    const tax = Number(order?.tax ?? body?.tax ?? 0);
    const discount = Number(order?.discount_total ?? body?.discount_total ?? 0);
    const total = Number(order?.total ?? subtotal + shipping + tax - discount);
    const paymentMethod = String(order?.payment_method || body?.payment_method || '').trim();
    const phone = String(order?.phone || body?.phone || '').trim();
    const address = String(order?.address || body?.address || '').trim();
    const city = String(order?.city || body?.city || '').trim();
    const state = String(order?.state || body?.state || '').trim();
    const orderDate = String(order?.order_date || body?.order_date || new Date().toLocaleString('en-NG'));

    if (!email) return new Response(JSON.stringify({ error: 'Missing email' }), { status: 400 });

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const titleSize = 22;
    const textSize = 12;

    // Load contact info from database for header
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string;
    const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env as any).SUPABASE_SERVICE_ROLE) as string | undefined;
    if (!supabaseUrl || !supabaseServiceKey) return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
    const adminPrefetch = createClient(supabaseUrl, supabaseServiceKey);
    const { data: ci } = await adminPrefetch.from('contact_info').select('*').order('updated_at', { ascending: false }).limit(1);
    const contact = (ci && ci[0]) || {};

    // Header
    page.drawRectangle({ x: 0, y: 780, width: 595, height: 62, color: rgb(0.831, 0.686, 0.215) });
    page.drawText('Maison Hannie', { x: 50, y: 815, size: titleSize, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('Receipt', { x: 480, y: 815, size: 16, font: fontBold, color: rgb(1, 1, 1) });

    // Contact info
    let y = 765;
    const siteUrl = String(contact.site_url || 'maisonhannie.store');
    const contactEmail = String(contact.email || 'hello@maisonhannie.com');
    const contactPhone = String(contact.phone || '+234');
    const contactAddress = String(contact.address || '');
    page.drawText(siteUrl, { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
    page.drawText(contactEmail, { x: 200, y, size: 10, font, color: rgb(0, 0, 0) });
    page.drawText(contactPhone, { x: 380, y, size: 10, font, color: rgb(0, 0, 0) });
    if (contactAddress) {
      y -= 14;
      page.drawText(contactAddress, { x: 50, y, size: 10, font, color: rgb(0.15, 0.15, 0.15) });
    }

    y -= 28;
    page.drawText('Customer', { x: 50, y, size: 11, font: fontBold });
    page.drawText(String(name || 'N/A'), { x: 120, y, size: 11, font });
    page.drawText('Tracking No', { x: 350, y, size: 11, font: fontBold });
    page.drawText(String(tracking || '-'), { x: 430, y, size: 11, font });
    y -= 16;
    page.drawText('Email', { x: 50, y, size: 11, font: fontBold });
    page.drawText(String(email), { x: 120, y, size: 11, font });
    page.drawText('Order Date', { x: 350, y, size: 11, font: fontBold });
    page.drawText(orderDate, { x: 430, y, size: 11, font });
    y -= 16;
    page.drawText('Phone', { x: 50, y, size: 11, font: fontBold });
    page.drawText(String(phone || '-'), { x: 120, y, size: 11, font });
    page.drawText('Payment', { x: 350, y, size: 11, font: fontBold });
    page.drawText(String(paymentMethod || '-'), { x: 430, y, size: 11, font });
    y -= 20;
    page.drawText('Bill To', { x: 50, y, size: 11, font: fontBold });
    y -= 14;
    page.drawText(String(address || '-'), { x: 50, y, size: 11, font });
    y -= 14;
    page.drawText([city, state].filter(Boolean).join(', ') || '-', { x: 50, y, size: 11, font });

    // Items table header
    y -= 28;
    page.drawRectangle({ x: 50, y: y - 6, width: 495, height: 22, color: rgb(0.96, 0.93, 0.83) });
    page.drawText('Item', { x: 60, y, size: textSize, font: fontBold });
    page.drawText('Qty', { x: 350, y, size: textSize, font: fontBold });
    page.drawText('Unit (NGN)', { x: 400, y, size: textSize, font: fontBold });
    page.drawText('Total (NGN)', { x: 480, y, size: textSize, font: fontBold });
    y -= 20;
    page.drawLine({ start: { x: 50, y }, end: { x: 545, y } });
    y -= 10;

    // Items rows
    for (const it of items) {
      const unit = Number(it.price || 0);
      const qty = Number(it.quantity || 1);
      const lineTotal = unit * qty;
      page.drawText(String(it.name || ''), { x: 60, y, size: textSize, font });
      page.drawText(String(qty), { x: 350, y, size: textSize, font });
      page.drawText(String(unit.toLocaleString()), { x: 400, y, size: textSize, font });
      page.drawText(String(lineTotal.toLocaleString()), { x: 480, y, size: textSize, font });
      y -= 18;
      page.drawLine({ start: { x: 50, y }, end: { x: 545, y } });
      y -= 10;
    }

    y -= 6;
    page.drawText('Subtotal:', { x: 400, y, size: textSize, font: fontBold });
    page.drawText(`NGN ${subtotal.toLocaleString()}`, { x: 480, y, size: textSize, font });
    y -= 16;
    page.drawText('Discounts:', { x: 400, y, size: textSize, font: fontBold });
    page.drawText(`NGN ${discount.toLocaleString()}`, { x: 480, y, size: textSize, font });
    y -= 16;
    page.drawText('Tax:', { x: 400, y, size: textSize, font: fontBold });
    page.drawText(`NGN ${tax.toLocaleString()}`, { x: 480, y, size: textSize, font });
    y -= 16;
    page.drawText('Shipping:', { x: 400, y, size: textSize, font: fontBold });
    page.drawText(`NGN ${shipping.toLocaleString()}`, { x: 480, y, size: textSize, font });
    y -= 20;
    page.drawText('Grand Total:', { x: 400, y, size: textSize + 2, font: fontBold });
    page.drawText(`NGN ${Number(total || 0).toLocaleString()}`, { x: 480, y, size: textSize + 2, font: fontBold });

    // Footer
    y -= 36;
    page.drawText('Thank you for shopping with Maison Hannie.', { x: 50, y, size: textSize, font });
    y -= 16;
    page.drawText('Please print or save this receipt for your records.', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });

    const bytes = await pdf.save();

    const admin = adminPrefetch;
    const rawBucket = String(process.env.SUPABASE_RECEIPTS_BUCKET || 'Images');
    const candidates = [rawBucket, rawBucket.toLowerCase()];
    const fileName = `receipt_${tracking || Date.now()}.pdf`;
    const path = `receipts/${Date.now()}_${Math.random().toString(36).slice(2)}_${fileName}`;
    const fileBuffer = Buffer.from(bytes);

    let usedBucket: string | null = null;
    let publicUrl: string | null = null;
    for (const b of candidates) {
      await admin.storage.updateBucket(b, { public: true, fileSizeLimit: '200MB' });
      const { error: upErrTry } = await admin.storage.from(b).upload(path, fileBuffer, { contentType: 'application/pdf', upsert: true });
      if (!upErrTry) {
        const { data: pubTry } = admin.storage.from(b).getPublicUrl(path);
        publicUrl = pubTry?.publicUrl || null;
        usedBucket = b;
        break;
      }
    }
    if (!usedBucket) {
      const b = rawBucket.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      await admin.storage.createBucket(b, { public: true, fileSizeLimit: '200MB' });
      const { error: upErr2 } = await admin.storage.from(b).upload(path, fileBuffer, { contentType: 'application/pdf', upsert: true });
      if (upErr2) return new Response(JSON.stringify({ error: 'Upload failed', details: upErr2.message }), { status: 500 });
      const { data: pub2 } = admin.storage.from(b).getPublicUrl(path);
      publicUrl = pub2?.publicUrl || null;
      usedBucket = b;
    }
    if (!publicUrl) return new Response(JSON.stringify({ error: 'Public URL generation failed' }), { status: 500 });
    if (!publicUrl) return new Response(JSON.stringify({ error: 'Public URL generation failed' }), { status: 500 });

    const subject = `Your Receipt${tracking ? ' - ' + tracking : ''}`;
    const html = `<div style="font-family:Arial, sans-serif;line-height:1.6"><p>Dear ${name || ''},</p><p>Your receipt is available <a href="${publicUrl}" target="_blank" rel="noreferrer">here</a>.</p><p>Warm regards,<br/>Maison Hannie</p></div>`;

    const origin = new URL(req.url).origin;
    const apiResp = await fetch(`${origin}/api/admin/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: [email], subject, html })
    });
    if (!apiResp.ok) {
      const data = await apiResp.text();
      return new Response(JSON.stringify({ error: 'Failed to send email', details: data }), { status: 500 });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Server error' }), { status: 500 });
  }
}