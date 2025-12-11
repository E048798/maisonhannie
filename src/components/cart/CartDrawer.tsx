"use client";
import Link from "next/link";
import { useCart } from "./CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, X } from "lucide-react";

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-lg bg-[#F7F3EC] border-l border-[#D4AF37]/20 p-6">
        <SheetHeader className="flex items-center justify-between border-b border-[#D4AF37]/10 px-6 py-4">
          <SheetTitle className="flex items-center gap-2 text-black">
            <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
            Your Cart
          </SheetTitle>
          <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-full text-black hover:bg-[#E5DCC5]">
            <X className="w-4 h-4" />
          </button>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="w-20 h-20 rounded-full bg-[#E5DCC5] flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-[#D4AF37]/50" />
            </div>
            <h3 className="text-lg font-medium text-black mb-2">Your cart is empty</h3>
            <p className="text-black/60 text-sm mb-6">Discover our handcrafted collections</p>
            <Button onClick={() => setIsCartOpen(false)} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 bg-white rounded-xl shadow-sm">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-black text-sm line-clamp-1">{item.name}</h4>
                    {item.category && <p className="text-xs text-[#D4AF37] mt-0.5">{item.category}</p>}
                    <p className="font-semibold text-black mt-1">₦{item.price.toLocaleString()}</p>
                    {(() => {
                      const ready = (item as any).ready_made;
                      const val = (item as any).lead_time_value;
                      const unit = String((item as any).lead_time_unit || 'days');
                      if (ready === false && val) {
                        return <p className="text-xs text-black/60 mt-0.5">Crafting: {Number(val)} {unit}</p>;
                      }
                      return null;
                    })()}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-full bg-[#E5DCC5] flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium text-black w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-[#E5DCC5] flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#D4AF37]/10 pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-black/70">Subtotal</span>
                <span className="text-xl font-bold text-black">₦{cartTotal.toLocaleString()}</span>
              </div>
              {(() => {
                const times = cart
                  .map((i: any) => ({ ready: i.ready_made, val: i.lead_time_value, unit: i.lead_time_unit }))
                  .filter((t) => t && t.ready === false && t.val);
                if (!times.length) return null;
                const daysTotal = times.map((t) => (String(t.unit) === 'hours' ? Number(t.val) / 24 : Number(t.val))).reduce((a, b) => Math.max(a, b), 0);
                return (
                  <div className="flex justify-between items-center">
                    <span className="text-black/70">Estimated crafting time</span>
                    <span className="text-black font-medium">{daysTotal >= 1 ? `${Math.ceil(daysTotal)} day(s)` : `${Math.ceil(daysTotal * 24)} hour(s)`}</span>
                  </div>
                );
              })()}
              <p className="text-xs text-black/50 text-center">Shipping calculated at checkout</p>
              <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="block">
                <Button className="w-full h-12 bg-[#D4AF37] hover:bg-[#C4A030] text-white font-medium rounded-full">Proceed to Checkout</Button>
              </Link>
              <button onClick={() => setIsCartOpen(false)} className="w-full text-center text-sm text-black/70 hover:text-[#D4AF37] transition-colors">
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}