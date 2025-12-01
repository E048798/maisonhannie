import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return new Response(JSON.stringify({ error: 'PAYSTACK_SECRET_KEY not configured' }), { status: 500 });
    }
    const reference = req.nextUrl.searchParams.get('reference');
    if (!reference) {
      return new Response(JSON.stringify({ error: 'Missing reference' }), { status: 400 });
    }
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
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