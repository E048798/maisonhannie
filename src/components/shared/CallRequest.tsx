"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";

export default function CallRequest() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("Tailor Works");
  const [preferredTime, setPreferredTime] = useState("");
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [status, setStatus] = useState<null | "success" | "error">(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const { error } = await supabase.from("call_requests").insert([
        { name, phone, service, preferred_time: preferredTime, whatsapp_consent: whatsappConsent },
      ]);
      if (error) throw error;
      setStatus("success");
      setName("");
      setPhone("");
      setService("Tailor Works");
      setPreferredTime("");
      setWhatsappConsent(false);
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-serif text-black mb-6">Request a Call</h2>
        <p className="text-black/70 mb-8">Tell us what you need and if we can reach you on WhatsApp.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />

            <Select value={service} onValueChange={setService}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tailor Works">Tailor Works</SelectItem>
                <SelectItem value="Resin Works">Resin Works</SelectItem>
                <SelectItem value="Bead Works">Bead Works</SelectItem>
                <SelectItem value="Catering">Catering</SelectItem>
              </SelectContent>
            </Select>

            <Input placeholder="Preferred time (e.g., Today 4pm)" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} />

            <label className="flex items-center gap-3 text-black/80">
              <input type="checkbox" checked={whatsappConsent} onChange={(e) => setWhatsappConsent(e.target.checked)} className="w-5 h-5" />
              <span>I consent to being contacted via WhatsApp</span>
            </label>

            <Button onClick={submit} disabled={loading} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white rounded-full">
              {loading ? "Submitting..." : "Request Call"}
            </Button>

            {status === "success" && <p className="text-green-600">Request sent. We will contact you soon.</p>}
            {status === "error" && <p className="text-red-600">Something went wrong. Please try again.</p>}
          </div>

          <div className="rounded-2xl bg-[#F7F3EC] p-6 text-black/70">
            <p>We’ll call you to understand your needs and schedule next steps. Select the service you’re interested in so we can connect you with the right specialist.</p>
          </div>
        </div>
      </div>
    </section>
  );
}