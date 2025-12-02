import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, amount, reference, metadata } = body || {};
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return new Response(JSON.stringify({ error: 'PAYSTACK_SECRET_KEY not configured' }), { status: 500 });
    }
    if (!email || !amount || !reference) {
      return new Response(JSON.stringify({ error: 'Missing email, amount or reference' }), { status: 400 });
    }
    const origin = req.nextUrl.origin;
    const callback_url = `${origin}/paystack/callback`;

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, amount, reference, callback_url, metadata }),
    });
    const data = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), { status: res.status });
    }
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || 'Unknown error' }), { status: 500 });
  }
}
export const runtime = 'nodejs'