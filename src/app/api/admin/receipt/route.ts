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
    const total = Number(order?.total ?? items.reduce((s, it) => s + Number(it.price || 0) * Number(it.quantity || 1), 0));

    if (!email) return new Response(JSON.stringify({ error: 'Missing email' }), { status: 400 });

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const titleSize = 22;
    const textSize = 12;

    // Header
    page.drawRectangle({ x: 0, y: 780, width: 595, height: 62, color: rgb(0.831, 0.686, 0.215) });
    page.drawText('Maison Hannie', { x: 50, y: 815, size: titleSize, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('Receipt', { x: 480, y: 815, size: 16, font: fontBold, color: rgb(1, 1, 1) });

    // Contact info
    let y = 765;
    page.drawText('www.maisonhannie.com', { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
    page.drawText('hello@maisonhannie.com', { x: 200, y, size: 10, font, color: rgb(0, 0, 0) });
    page.drawText('+234', { x: 380, y, size: 10, font, color: rgb(0, 0, 0) });

    // Order details
    y -= 28;
    page.drawText('Customer', { x: 50, y, size: 11, font: fontBold });
    page.drawText(String(name || 'N/A'), { x: 120, y, size: 11, font });
    y -= 16;
    page.drawText('Email', { x: 50, y, size: 11, font: fontBold });
    page.drawText(String(email), { x: 120, y, size: 11, font });
    y -= 16;
    page.drawText('Tracking', { x: 50, y, size: 11, font: fontBold });
    page.drawText(String(tracking || '-'), { x: 120, y, size: 11, font });

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

    // Totals
    y -= 6;
    page.drawText('Grand Total:', { x: 400, y, size: textSize + 2, font: fontBold });
    page.drawText(`NGN ${Number(total || 0).toLocaleString()}`, { x: 480, y, size: textSize + 2, font: fontBold });

    // Footer
    y -= 36;
    page.drawText('Thank you for shopping with Maison Hannie.', { x: 50, y, size: textSize, font });
    y -= 16;
    page.drawText('Please print or save this receipt for your records.', { x: 50, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });

    const bytes = await pdf.save();

    const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string;
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env as any).SUPABASE_SERVICE_ROLE) as string | undefined;
    if (!url || !serviceKey) return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500 });
    const admin = createClient(url, serviceKey);
    const bucket = String(process.env.SUPABASE_RECEIPTS_BUCKET || 'receipts').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    {
      const { error: createErr } = await admin.storage.createBucket(bucket, { public: true, fileSizeLimit: '200MB' });
      if (createErr) {
        await admin.storage.updateBucket(bucket, { public: true, fileSizeLimit: '200MB' });
      }
    }
    const fileName = `receipt_${tracking || Date.now()}.pdf`;
    const path = `receipts/${Date.now()}_${Math.random().toString(36).slice(2)}_${fileName}`;
    const fileBuffer = Buffer.from(bytes);
    const { error: upErr } = await admin.storage.from(bucket).upload(path, fileBuffer, { contentType: 'application/pdf', upsert: true });
    if (upErr) return new Response(JSON.stringify({ error: 'Upload failed', details: upErr.message }), { status: 500 });
    const { data: pub } = admin.storage.from(bucket).getPublicUrl(path);
    const publicUrl = pub?.publicUrl;
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