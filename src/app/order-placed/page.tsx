"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, ArrowRight } from "lucide-react";

export default function OrderPlaced() {
  const sp = useSearchParams();
  const reference = sp.get("reference") || "";
  const [order, setOrder] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    async function load() {
      if (!reference) return;
      const supabase = getSupabase();
      const { data } = await supabase.from("orders").select("*").eq("tracking_code", reference).limit(1);
      const o = (data && data[0]) || null;
      setOrder(o);
    }
    load();
  }, [reference]);

  useEffect(() => {
    async function sendThankYou() {
      if (emailSent) return;
      if (!order) return;
      const email = String(order.email || "").trim();
      const name = String(order.customer_name || "").trim();
      const tracking = String(order.tracking_code || reference);
      if (!email) return;
      try {
        await fetch("/api/admin/order-thank-you", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, customer_name: name, tracking_code: tracking }) });
        setEmailSent(true);
      } catch {}
    }
    sendThankYou();
  }, [order, emailSent, reference]);

  function copyTrackingCode() {
    const code = String(order?.tracking_code || reference);
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const trackingCode = String(order?.tracking_code || reference);

  return (
    <div className="min-h-screen bg-[#F7F3EC] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-lg text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-serif text-black mb-2">Order Placed Successfully!</h2>
        <p className="text-black/60 mb-6">Thank you for your order. Use the tracking code below to track your delivery.</p>
        <div className="bg-[#F7F3EC] rounded-xl p-4 mb-6">
          <p className="text-sm text-black/60 mb-2">Your Tracking Code</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl font-mono font-bold text-[#D4AF37]">{trackingCode}</span>
            <button onClick={copyTrackingCode} className="p-2 rounded-lg bg-white hover:bg-[#D4AF37] hover:text-white transition-colors">
              {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <Link href={`/track-order?code=${trackingCode}`} className="block">
            <Button className="w-full bg-[#D4AF37] hover:bg-[#C4A030] text-white rounded-full">
              Track Your Order
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/shop" className="block">
            <Button variant="outline" className="w-full rounded-full border-[#D4AF37]/30">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}