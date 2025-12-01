"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function PaystackCallback() {
  const params = useSearchParams();
  const status = params.get("status");
  const reference = params.get("reference");

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.parent?.postMessage({ type: "paystack-callback", status, reference }, window.origin);
    }
  }, [status, reference]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F3EC]">
      <div className="bg-white rounded-2xl p-8 text-center">
        <p className="text-black/70">Processing payment...</p>
      </div>
    </div>
  );
}