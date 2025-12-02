"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, Loader2 } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, name: firstName }) });
      if (res.ok) {
        setSubmitted(true);
        setEmail("");
        setFirstName("");
        setError(null);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || 'Could not subscribe. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-[#E5DCC5] via-[#F7F3EC] to-[#E5DCC5]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full mb-6">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-sm text-black font-medium">Join Our Community</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-serif text-black mb-4">
          Stay Connected with<br />
          <span className="text-[#D4AF37]">Handcrafted Beauty</span>
        </h2>

        <p className="text-black/70 mb-8 max-w-xl mx-auto">
          Subscribe for exclusive offers, new collection alerts, and artisan stories delivered straight to your inbox.
        </p>

        {submitted ? (
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-green-50 text-green-700 rounded-full">
            <Check className="w-5 h-5" />
            <span className="font-medium">Thank you for subscribing!</span>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="flex-1 h-12 bg-white border-[#D4AF37]/20 focus:border-[#D4AF37] rounded-full px-5" />
              <Input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 h-12 bg-white border-[#D4AF37]/20 focus:border-[#D4AF37] rounded-full px-5" required />
              <Button type="submit" disabled={loading} className="h-12 px-8 bg-[#D4AF37] hover:bg-[#C4A030] text-white rounded-full font-medium">
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> <span className="ml-2">Submitting...</span></>) : 'Subscribe'}
              </Button>
            </form>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </>
        )}
      </div>
    </section>
  );
}