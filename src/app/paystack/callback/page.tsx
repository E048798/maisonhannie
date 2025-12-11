'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/components/cart/CartContext';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

function CallbackContent() {
  const params = useSearchParams();
  const reference = params.get('reference') || '';
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => {
    async function verify() {
      if (!reference) { setError('Missing payment reference'); setLoading(false); return; }
      try {
        const res = await fetch(`/api/paystack/verify?reference=${reference}`);
        const data = await res.json();
        if (!res.ok || data?.error) {
          setError('Payment verification failed');
        } else {
          setOrder(data?.order || null);
          clearCart();
        }
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [reference, clearCart]);

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <section className="relative h-[30vh] min-h-[200px] flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-serif mb-2">Payment Confirmation</h1>
          <p className="text-white/80">Your payment has been processed</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          {loading && (
            <div className="flex items-center gap-3 text-black">
              <Package className="w-5 h-5 text-[#D4AF37]" />
              <span>Verifying payment...</span>
            </div>
          )}
          {!loading && error && (
            <div className="text-red-600">{error}</div>
          )}
          {!loading && !error && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm text-black/60">Tracking Code</p>
                  <p className="text-lg font-semibold text-black">{reference}</p>
                </div>
              </div>
              <p className="text-black/70 mb-6">Thank you. Your order has been confirmed.</p>
              <div className="grid md:grid-cols-2 gap-3">
                <Link href={`/track-order?code=${encodeURIComponent(reference)}`} className="inline-flex">
                  <Button className="w-full rounded-full bg-[#D4AF37] text-white">Track Order</Button>
                </Link>
                <Link href="/" className="inline-flex">
                  <Button className="w-full rounded-full bg-black hover:bg-black/90 text-white">
                    Continue Shopping
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              {order && (
                <div className="mt-8 border-t pt-6 text-sm text-black">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>₦{Number(order.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaystackCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F3EC] flex items-center justify-center"><div className="text-black">Loading...</div></div>}>
      <CallbackContent />
    </Suspense>
  );
}