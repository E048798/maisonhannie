'use client';
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send, CheckCircle, Instagram, Facebook, Twitter } from "lucide-react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

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
                    <p className="text-black/70">
                      123 Artisan Lane
                      <br />
                      Creative District, CD 12345
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="font-medium text-black">Phone</p>
                    <p className="text-black/70">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="font-medium text-black">Email</p>
                    <p className="text-black/70">hello@maisonhannie.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-black mb-6">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 rounded-full bg-[#E5DCC5] flex items-center justify-center text-black hover:bg-[#D4AF37] hover:text-white transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-[#E5DCC5] flex items-center justify-center text-black hover:bg-[#D4AF37] hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-[#E5DCC5] flex items-center justify-center text-black hover:bg-[#D4AF37] hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-black mb-6">Business Hours</h3>
              <div className="space-y-3 text-black/70">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="font-medium text-black">9am - 6pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium text-black">10am - 4pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium text-black">Closed</span>
                </div>
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
                    setFormData({ name: "", email: "", subject: "", message: "" });
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

                <Button type="submit" className="w-full h-14 mt-8 bg-[#D4AF37] hover:bg-[#C4A030] text-white font-medium rounded-full text-base">
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}