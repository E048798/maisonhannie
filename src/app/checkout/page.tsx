"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingBag, MapPin, User, Phone, Copy, CheckCircle, ArrowRight, CreditCard, Loader2 } from "lucide-react";
import { generateTrackingCode } from "@/lib/entities/order";
const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara"
];

 

export default function Checkout() {
  const { cart, cartTotal } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({ name: "", phone: "", address: "", landmark: "", city: "", state: "" });
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherError, setVoucherError] = useState("");
  const [voucherApplied, setVoucherApplied] = useState<{ code: string; type: 'percent' | 'fixed'; value: number; max?: number } | null>(null);
  const discountAmount = voucherApplied ? Math.min(voucherApplied.type === 'percent' ? (cartTotal * (voucherApplied.value / 100)) : voucherApplied.value, cartTotal, voucherApplied.max ?? Number.POSITIVE_INFINITY) : 0;
  const payableTotal = Math.max(cartTotal - discountAmount, 0);

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const reference = generateTrackingCode();
    const metadata = { customer_name: formData.name, phone: formData.phone, address: formData.address, landmark: formData.landmark, city: formData.city, state: formData.state, items: cart, total: payableTotal, email, voucher_code: voucherApplied?.code || null, discount_amount: discountAmount };
    const res = await fetch('/api/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, amount: Math.round(payableTotal * 100), reference, metadata }),
    });
    const data = await res.json();
    if (!res.ok) { setIsSubmitting(false); alert('Payment initialization failed'); return; }
    const url = data?.data?.authorization_url as string | undefined;
    if (!url) { setIsSubmitting(false); alert('Payment session unavailable'); return; }
    window.location.href = url;
  }

  async function applyVoucher() {
    setVoucherError("");
    const code = voucherCode.trim();
    if (!code) return;
    const { data } = await supabase.from('vouchers').select('*').eq('code', code).limit(1);
    const v = data && data[0];
    if (!v) { setVoucherError('Invalid voucher code'); return; }
    if (v.active === false) { setVoucherError('Voucher is inactive'); return; }
    const now = new Date();
    if (v.start_date && new Date(v.start_date) > now) { setVoucherError('Voucher not yet valid'); return; }
    if (v.end_date && new Date(v.end_date) < now) { setVoucherError('Voucher has expired'); return; }
    if (v.usage_limit != null && Number(v.usage_count || 0) >= Number(v.usage_limit)) { setVoucherError('Voucher usage limit reached'); return; }
    if (v.min_order_amount && cartTotal < Number(v.min_order_amount)) { setVoucherError(`Requires minimum order ₦${Number(v.min_order_amount).toLocaleString()}`); return; }
    if (Array.isArray(v.applicable_categories) && v.applicable_categories.length) {
      const allOk = cart.every((i: any) => v.applicable_categories.includes(String(i.category || '')));
      if (!allOk) { setVoucherError('Voucher not applicable to selected items'); return; }
    }
    if (email) {
      try {
        const resp = await fetch('/api/vouchers/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, email }) });
        const json = await resp.json();
        if (!json?.ok) {
          if (json?.reason === 'first_time_only_violation') setVoucherError('Voucher valid for first-time customers only');
          else if (json?.reason === 'single_use_violation') setVoucherError('Voucher already used by this email');
          else setVoucherError('Voucher not valid for this customer');
          return;
        }
      } catch {}
    }
    const type = String(v.discount_type) === 'fixed' ? 'fixed' : 'percent';
    const value = Number(v.discount_value || 0);
    if (!value) { setVoucherError('Voucher has no discount'); return; }
    const max = v.max_discount != null ? Number(v.max_discount) : undefined;
    setVoucherApplied({ code, type, value, max });
  }

  function copyTrackingCode() {
    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (cart.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-[#F7F3EC] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-[#E5DCC5] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-[#D4AF37]/50" />
          </div>
          <h2 className="text-2xl font-serif text-black mb-2">Your cart is empty</h2>
          <p className="text-black/60 mb-6">Add some items to proceed to checkout</p>
          <Link href="/shop">
            <Button className="bg-[#D4AF37] hover:bg-[#C4A030] text-white rounded-full">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete) {
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
              <Button className="w-full rounded-full bg-black hover:bg-black/90 text-white">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-[#F7F3EC]">
      <section className="relative h-[30vh] min-h-[200px] flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-serif mb-2">Checkout</h1>
          <p className="text-white/80">Complete your purchase securely</p>
        </div>
      </section>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-black mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#D4AF37]" />
              Delivery Information
            </h2>
            <form onSubmit={handlePayment} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-black flex items-center gap-2">
                  <User className="w-4 h-4 text-[#D4AF37]" />
                  Full Name
                </label>
                <Input placeholder="Enter your full name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-12 rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37]" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-black flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                  Email Address
                </label>
                <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37]" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-black flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#D4AF37]" />
                  Phone Number
                </label>
                <Input type="tel" placeholder="e.g. 08012345678" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="h-12 rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37]" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">Delivery Address</label>
                <Textarea placeholder="Enter your full delivery address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="min-h-[100px] rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37]" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">Closest Landmark</label>
                <Input placeholder="e.g. Near First Bank, Opposite GTB" value={formData.landmark} onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} className="h-12 rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black block">City</label>
                  <Input placeholder="Enter city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="h-12 rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37]" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black block">State</label>
                  <Select value={formData.state} onValueChange={(value) => setFormData({ ...formData, state: value })}>
                    <SelectTrigger className="h-12 rounded-xl border-[#D4AF37]/20">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIGERIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-sm text-black/60 mb-4">Country: <span className="font-medium text-black">Nigeria</span></p>
                <Button type="submit" disabled={isSubmitting || !formData.state || !email} className="w-full h-14 bg-[#D4AF37] hover:bg-[#C4A030] text-white font-medium rounded-full text-base disabled:opacity-50">
                  {isSubmitting ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>) : (<><CreditCard className="w-5 h-5 mr-2" /> Pay ₦{payableTotal.toLocaleString()}</>)}
                </Button>
                <p className="text-xs text-center text-black/50 mt-3 flex items-center justify-center gap-1">
                  <span className="inline-block w-4 h-4 bg-green-500 rounded-full" />
                  Secured by Paystack
                </p>
              </div>
            </form>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-sm h-fit">
            <h2 className="text-xl font-semibold text-black mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              Order Summary
            </h2>
            <div className="mb-4 p-4 bg-[#F7F3EC] rounded-xl">
              <div className="flex items-center gap-3">
                <Input placeholder="Enter voucher code" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} className="h-11 rounded-xl border-[#D4AF37]/20" />
                <Button type="button" onClick={applyVoucher} className="h-11 bg-black hover:bg-black/90 text-white rounded-xl">Apply</Button>
              </div>
              {voucherError && <p className="text-xs text-red-600 mt-2">{voucherError}</p>}
              {voucherApplied && <p className="text-xs text-green-700 mt-2">Voucher applied: {voucherApplied.code}</p>}
            </div>
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h4 className="font-medium text-black text-sm">{item.name}</h4>
                    <p className="text-xs text-black/60">Qty: {item.quantity}</p>
                    {(() => {
                      const ready = (item as any).ready_made;
                      const val = (item as any).lead_time_value;
                      const unit = String((item as any).lead_time_unit || 'days');
                      if (ready === false && val) {
                        return <p className="text-xs text-black/60">Crafting: {Number(val)} {unit}</p>;
                      }
                      return null;
                    })()}
                    <p className="text-sm font-semibold text-[#D4AF37]">₦{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          <div className="border-t border-[#D4AF37]/10 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-black/70">Subtotal</span>
                <span className="text-black">₦{cartTotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-black/70">Voucher Discount</span>
                  <span className="text-green-700">-₦{Math.round(discountAmount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-black/70">Shipping</span>
                <span className="text-black">Calculated after order</span>
              </div>
              {(() => {
                const times = cart
                  .map((i: any) => ({ ready: i.ready_made, val: i.lead_time_value, unit: i.lead_time_unit }))
                  .filter((t) => t && t.ready === false && t.val);
                if (!times.length) return null;
                const daysTotal = times.map((t) => (String(t.unit) === 'hours' ? Number(t.val) / 24 : Number(t.val))).reduce((a, b) => Math.max(a, b), 0);
                return (
                  <div className="flex justify-between text-sm">
                    <span className="text-black/70">Estimated crafting time</span>
                    <span className="text-black">{daysTotal >= 1 ? `${Math.ceil(daysTotal)} day(s)` : `${Math.ceil(daysTotal * 24)} hour(s)`}</span>
                  </div>
                );
              })()}
              <div className="flex justify-between text-lg font-bold pt-3 border-t border-[#D4AF37]/10">
                <span className="text-black">Total</span>
              <span className="text-[#D4AF37]">₦{payableTotal.toLocaleString()}</span>
            </div>
            <div className="mt-5 p-4 rounded-xl bg-[#F7F3EC] text-sm text-black/70">
              <p className="mb-2">Some orders will be crafted and designed. It may take days to complete; Hannie will reach out to you to discuss details.</p>
              {(() => {
                const times = cart
                  .map((i: any) => ({ ready: i.ready_made, val: i.lead_time_value, unit: i.lead_time_unit }))
                  .filter((t) => t && t.ready === false && t.val);
                if (!times.length) return null;
                const daysTotal = times.map((t) => (String(t.unit) === 'hours' ? Number(t.val) / 24 : Number(t.val))).reduce((a, b) => Math.max(a, b), 0);
                return <p className="mt-1">Estimated crafting time: {daysTotal >= 1 ? `${Math.ceil(daysTotal)} day(s)` : `${Math.ceil(daysTotal * 24)} hour(s)`}</p>;
              })()}
              <p>Shipping will be decided between the rider and the customer.</p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
    
    </>
  );
}