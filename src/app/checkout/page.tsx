"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";
// base44 integration is temporarily disabled for client-side only demo
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingBag, MapPin, User, Phone, Copy, CheckCircle, ArrowRight, CreditCard, Loader2 } from "lucide-react";
import { generateTrackingCode } from "@/lib/entities/order";

// Using server-side initialization via API route

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara"
];

 

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [transaction, setTransaction] = useState<any | null>(null);
  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({ name: "", phone: "", address: "", landmark: "", city: "", state: "" });

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!e.data || e.data.type !== "paystack-callback") return;
      setShowPaymentModal(false);
      const { status, reference } = e.data;
      if (!reference) { setIsSubmitting(false); return; }
      fetch(`/api/paystack/verify?reference=${reference}`)
        .then((r) => r.json())
        .then((data) => {
          setTransaction(data?.data || null);
          setTrackingCode(reference);
          setOrderComplete(true);
          clearCart();
          setIsSubmitting(false);
        })
        .catch(() => setIsSubmitting(false));
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [clearCart]);

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const reference = generateTrackingCode();
    const metadata = { customer_name: formData.name, phone: formData.phone, items: cart };
    const res = await fetch('/api/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, amount: Math.round(cartTotal * 100), reference, metadata }),
    });
    const data = await res.json();
    if (!res.ok) { setIsSubmitting(false); alert('Payment initialization failed'); return; }
    setPaymentUrl(data?.data?.authorization_url || null);
    setShowPaymentModal(true);
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
              <Button variant="outline" className="w-full rounded-full border-[#D4AF37]/30">Continue Shopping</Button>
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
                  {isSubmitting ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>) : (<><CreditCard className="w-5 h-5 mr-2" /> Pay ₦{cartTotal.toLocaleString()}</>)}
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
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h4 className="font-medium text-black text-sm">{item.name}</h4>
                    <p className="text-xs text-black/60">Qty: {item.quantity}</p>
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
              <div className="flex justify-between text-sm">
                <span className="text-black/70">Shipping</span>
                <span className="text-black">Calculated after order</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t border-[#D4AF37]/10">
                <span className="text-black">Total</span>
                <span className="text-[#D4AF37]">₦{cartTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {showPaymentModal && paymentUrl && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-black">Complete Payment</h3>
            <button onClick={() => setShowPaymentModal(false)} className="text-black/60 hover:text-black">Close</button>
          </div>
          <div className="p-0">
            <iframe src={paymentUrl} className="w-full h-[75vh]" />
          </div>
        </div>
      </div>
    )}
    </>
  );
}