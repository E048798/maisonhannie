"use client";
import { useEffect, useState, Suspense } from "react";
export const dynamic = 'force-dynamic';

export default function PaystackCallback() {
  const [status, setStatus] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      setStatus(sp.get("status"));
      setReference(sp.get("reference"));
    } catch {}
  }, []);

  useEffect(() => {
    if (!reference) return;
    window.parent?.postMessage({ type: "paystack-callback", status, reference }, window.origin);
  }, [status, reference]);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F7F3EC]"><div className="bg-white rounded-2xl p-8 text-center"><p className="text-black/70">Processing payment...</p></div></div>}>
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3EC]">
        <div className="bg-white rounded-2xl p-8 text-center">
          <p className="text-black/70">Processing payment...</p>
        </div>
      </div>
    </Suspense>
  );
}