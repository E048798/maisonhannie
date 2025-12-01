"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Send, CheckCircle } from "lucide-react";

export default function BookingForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", eventType: "", guests: "", date: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl p-12 shadow-xl text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-serif text-black mb-4">Inquiry Submitted!</h3>
        <p className="text-black/70 mb-6">Thank you for your interest. We&apos;ll get back to you within 24 hours to discuss your event.</p>
        <Button onClick={() => setSubmitted(false)} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white rounded-full">Submit Another Inquiry</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
      <h3 className="text-2xl font-serif text-black mb-2">Book Your Event</h3>
      <p className="text-black/60 mb-8">Fill out the form and we&apos;ll contact you soon</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-black">Full Name</label>
          <Input placeholder="Your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-12 rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37]" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-black">Email</label>
          <Input type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-12 rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37]" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-black">Phone</label>
          <Input type="tel" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="h-12 rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37]" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-black">Event Type</label>
          <Select value={formData.eventType} onValueChange={(v) => setFormData({ ...formData, eventType: v })}>
            <SelectTrigger className="h-12 rounded-xl border-[#D4AF37]/20">
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="corporate">Corporate Event</SelectItem>
              <SelectItem value="wedding">Wedding</SelectItem>
              <SelectItem value="birthday">Birthday Party</SelectItem>
              <SelectItem value="brunch">Brunch</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-black">Number of Guests</label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <Input type="number" placeholder="Expected guests" value={formData.guests} onChange={(e) => setFormData({ ...formData, guests: e.target.value })} className="h-12 rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37] pl-11" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-black">Event Date</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="h-12 rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37] pl-11" />
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-6">
        <label className="text-sm font-medium text-black">Additional Details</label>
        <Textarea placeholder="Tell us about your event, dietary requirements, or any special requests..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="min-h-[120px] rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37]" />
      </div>

      <Button type="submit" className="w-full h-14 mt-8 bg-[#D4AF37] hover:bg-[#C4A030] text-white font-medium rounded-full text-base">
        <Send className="w-5 h-5 mr-2" />
        Submit Inquiry
      </Button>
    </form>
  );
}