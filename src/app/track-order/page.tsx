"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Package, CheckCircle, Truck, MapPin, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pending: { label: "Order Placed", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
  confirmed: { label: "Order Confirmed", icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-100" },
  processing: { label: "Processing", icon: Package, color: "text-purple-600", bg: "bg-purple-100" },
  shipped: { label: "Shipped", icon: Truck, color: "text-indigo-600", bg: "bg-indigo-100" },
  out_for_delivery: { label: "Out for Delivery", icon: MapPin, color: "text-orange-600", bg: "bg-orange-100" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" },
} as const;

const STATUS_ORDER = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"] as const;

type OrderItem = { id: number; name: string; image: string; price: number; quantity: number };
type StatusKey = keyof typeof STATUS_CONFIG;
type Order = {
  tracking_code: string;
  customer_name: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  status: StatusKey | string;
  status_history?: { status: string; timestamp: string; note?: string }[];
  items: OrderItem[];
  total: number;
};

export default function TrackOrder() {
  const [trackingCode, setTrackingCode] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      setTrackingCode(code);
      handleSearch(code);
    }
  }, []);

  async function handleSearch(codeParam?: string) {
    const code = (codeParam ?? trackingCode).trim();
    if (!code) return;
    setIsLoading(true);
    setError("");
    setSearched(true);
    const { data } = await supabase.from('orders').select('*').eq('tracking_code', code.toUpperCase()).limit(1);
    const found = (data && data[0]) || null;
    if (found) setOrder(found as any);
    else { setOrder(null); setError("No order found with this tracking code"); }
    setIsLoading(false);
  }

  const currentStatusIndex = order ? STATUS_ORDER.indexOf(order.status as StatusKey) : -1;
  const progressWidth = currentStatusIndex >= 0 ? (currentStatusIndex / (STATUS_ORDER.length - 1)) * 90 : 0;

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Track Your Order</h1>
          <p className="text-white/80 max-w-xl mx-auto">Enter your tracking code to see your delivery status</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
              <Input placeholder="Enter tracking code (e.g. MH...)" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value.toUpperCase())} className="h-14 pl-12 text-lg rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37] font-mono" />
            </div>
            <Button type="submit" disabled={isLoading} className="h-14 px-8 bg-[#D4AF37] hover:bg-[#C4A030] text-white rounded-full">{isLoading ? "Searching..." : "Track"}</Button>
          </form>
        </div>

        {error && searched && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 font-medium">{error}</p>
            <p className="text-red-500 text-sm mt-1">Please check your tracking code and try again</p>
          </div>
        )}

        {order && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-black/60">Tracking Code</p>
                  <p className="text-xl font-mono font-bold text-[#D4AF37]">{order.tracking_code}</p>
                </div>
                <div className={cn("px-4 py-2 rounded-full", STATUS_CONFIG[order.status as StatusKey]?.bg || "bg-[#E5DCC5]")}> 
                  <span className={cn("font-medium", STATUS_CONFIG[order.status as StatusKey]?.color || "text-black/60")}>{STATUS_CONFIG[order.status as StatusKey]?.label || order.status}</span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute top-5 left-5 right-5 h-1 bg-[#E5DCC5] rounded-full" />
                <div className="absolute top-5 left-5 h-1 bg-[#D4AF37] rounded-full transition-all duration-500" style={{ width: `${progressWidth}%` }} />
                <div className="relative flex justify-between">
                  {STATUS_ORDER.map((status, index) => {
                    const config = STATUS_CONFIG[status];
                    const Icon = config.icon;
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    return (
                      <div key={status} className="flex flex-col items-center">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-all", isCompleted ? "bg-[#D4AF37] text-white" : "bg-[#E5DCC5] text-black/40", isCurrent && "ring-4 ring-[#D4AF37]/20")}> 
                          <Icon className="w-5 h-5" />
                        </div>
                        <p className={cn("text-xs mt-2 text-center max-w-[60px]", isCompleted ? "text-black font-medium" : "text-black/40")}>{config.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-black mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-[#D4AF37]" />Delivery Information</h3>
                <div className="space-y-3 text-sm">
                  <div><p className="text-black/60">Customer</p><p className="text-black font-medium">{order.customer_name}</p></div>
                  <div><p className="text-black/60">Phone</p><p className="text-black font-medium">{order.phone}</p></div>
                  <div><p className="text-black/60">Address</p><p className="text-black font-medium">{order.address}{order.landmark && `, ${order.landmark}`}</p></div>
                  <div><p className="text-black/60">Location</p><p className="text-black font-medium">{order.city}, {order.state}, Nigeria</p></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-black mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-[#D4AF37]" />Order Items</h3>
                <div className="space-y-3">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-black">{item.name}</p>
                        <p className="text-xs text-black/60">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#D4AF37]">₦{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#D4AF37]/10 mt-4 pt-4">
                  <div className="flex justify-between font-bold"><span>Total</span><span className="text-[#D4AF37]">₦{order.total?.toLocaleString()}</span></div>
                </div>
              </div>
            </div>

            {order.status_history && order.status_history.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-black mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-[#D4AF37]" />Order History</h3>
                <div className="space-y-4">
                  {order.status_history.slice().reverse().map((entry, index) => (
                    <div key={index} className="flex gap-4">
                      <div className={cn("w-3 h-3 rounded-full mt-1.5", index === 0 ? "bg-[#D4AF37]" : "bg-[#E5DCC5]")} />
                      <div>
                        <p className="font-medium text-black">{STATUS_CONFIG[entry.status as StatusKey]?.label || entry.status}</p>
                        {entry.note && <p className="text-sm text-black/60">{entry.note}</p>}
                        <p className="text-xs text-black/40 mt-1">{new Date(entry.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}