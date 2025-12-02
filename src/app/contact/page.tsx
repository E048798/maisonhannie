'use client';
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send, CheckCircle, Instagram, Facebook, Twitter, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [contact, setContact] = useState<any | null>(null);
  const [hours, setHours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoursLoading, setHoursLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("contact_messages").insert({ name: formData.name, email: formData.email, phone: formData.phone || null, message: `${formData.subject}\n\n${formData.message}` , whatsapp_consent: whatsappConsent});
      if (error) throw error;
      if (formData.email) {
        fetch('/api/contact-autoresponder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            subject: formData.subject,
            message: formData.message,
            whatsappConsent,
          }),
        }).catch(() => {});
      }
      setSubmitted(true);
      setSubmitError(null);
    } catch (err: any) {
      setSubmitError('Could not send message. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  }

  useEffect(() => {
    const supabase = getSupabase();
    supabase
      .from("contact_info")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        setContact((data && data[0]) || null);
        setLoading(false);
      });
    supabase
      .from("business_hours")
      .select("*")
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        setHours(data || []);
        setHoursLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-serif mb-4">
            Get in <span className="text-[#D4AF37]">Touch</span>
          </h1>
          <p className="text-white/80 max-w-xl mx-auto text-lg">We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-black mb-6">Contact Information</h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="font-medium text-black">Address</p>
                    {loading ? (
                      <div className="space-y-2">
                        <div className="h-4 w-48 rounded bg-[#E5DCC5] animate-pulse" />
                        <div className="h-4 w-64 rounded bg-[#E5DCC5] animate-pulse" />
                      </div>
                    ) : (
                      <p className="text-black/70" dangerouslySetInnerHTML={{ __html: (contact?.address || "").replace(/\n/g, "<br />") }} />
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="font-medium text-black">Phone</p>
                    {loading ? (
                      <div className="h-4 w-40 rounded bg-[#E5DCC5] animate-pulse" />
                    ) : (
                      <p className="text-black/70">{contact?.phone || ""}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="font-medium text-black">Email</p>
                    {loading ? (
                      <div className="h-4 w-56 rounded bg-[#E5DCC5] animate-pulse" />
                    ) : (
                      <p className="text-black/70">{contact?.email || ""}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-black mb-6">Follow Us</h3>
              <div className="flex gap-4">
                {contact?.instagram_url && (
                  <a href={contact.instagram_url} className="w-12 h-12 rounded-full bg-[#E5DCC5] flex items-center justify-center text-black hover:bg-[#D4AF37] hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {contact?.facebook_url && (
                  <a href={contact.facebook_url} className="w-12 h-12 rounded-full bg-[#E5DCC5] flex items-center justify-center text-black hover:bg-[#D4AF37] hover:text-white transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {contact?.twitter_url && (
                  <a href={contact.twitter_url} className="w-12 h-12 rounded-full bg-[#E5DCC5] flex items-center justify-center text-black hover:bg-[#D4AF37] hover:text-white transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-black mb-6">Business Hours</h3>
              <div className="space-y-3 text-black/70">
                {hoursLoading ? (
                  <>
                    <div className="flex justify-between"><span className="h-4 w-40 bg-[#E5DCC5] rounded animate-pulse"></span><span className="h-4 w-24 bg-[#E5DCC5] rounded animate-pulse"></span></div>
                    <div className="flex justify-between"><span className="h-4 w-36 bg-[#E5DCC5] rounded animate-pulse"></span><span className="h-4 w-20 bg-[#E5DCC5] rounded animate-pulse"></span></div>
                    <div className="flex justify-between"><span className="h-4 w-32 bg-[#E5DCC5] rounded animate-pulse"></span><span className="h-4 w-16 bg-[#E5DCC5] rounded animate-pulse"></span></div>
                  </>
                ) : (
                  hours.map((h) => (
                    <div key={h.id} className="flex justify-between">
                      <span>{h.day}</span>
                      <span className="font-medium text-black">{h.closed ? "Closed" : `${h.open_time} - ${h.close_time}`}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {submitted ? (
              <div className="bg-white rounded-3xl p-12 shadow-sm text-center h-full flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-serif text-black mb-4">Message Sent!</h3>
                <p className="text-black/70 mb-6 max-w-md">Thank you for reaching out. We&apos;ve received your message and will get back to you within 24 hours.</p>
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
                    setWhatsappConsent(false);
                  }}
                  className="bg-[#D4AF37] hover:bg-[#C4A030] text-white rounded-full"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-12 shadow-sm">
                <h3 className="text-2xl font-serif text-black mb-2">Send a Message</h3>
                <p className="text-black/60 mb-8">We&apos;ll get back to you as soon as possible</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-black">Your Name</label>
                    <Input
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12 rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-black">Email Address</label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12 rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <label className="text-sm font-medium text-black">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="(+234) 801 234 5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12 rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37]"
                  />
                </div>

                <div className="mt-6 flex items-center justify-between p-4 bg-[#F7F3EC] rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-black">Consent to WhatsApp messages</p>
                    <p className="text-xs text-black/60">Allow us to reach you via WhatsApp for updates and support.</p>
                  </div>
                  <Switch checked={whatsappConsent} onCheckedChange={setWhatsappConsent} />
                </div>

                <div className="space-y-2 mt-6">
                  <label className="text-sm font-medium text-black">Subject</label>
                  <Input
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="h-12 rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37]"
                    required
                  />
                </div>

                <div className="space-y-2 mt-6">
                  <label className="text-sm font-medium text-black">Message</label>
                  <Textarea
                    placeholder="Tell us more about your inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="min-h-[180px] rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37]"
                    required
                  />
                </div>

                <Button type="submit" disabled={submitLoading} className="w-full h-14 mt-8 bg-[#D4AF37] hover:bg-[#C4A030] text-white font-medium rounded-full text-base">
                  {submitLoading ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" /> Sending...</>) : (<><Send className="w-5 h-5 mr-2" /> Send Message</>)}
                </Button>
                {submitError && <p className="text-sm text-red-600 mt-3">{submitError}</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}