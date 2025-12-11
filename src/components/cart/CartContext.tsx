"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type Product = { id: number; name: string; price: number; image: string; category?: string };
type CartItem = Product & { quantity: number };

type CartContextValue = {
  cart: CartItem[];
  items: CartItem[];
  cartTotal: number;
  cartCount: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const deviceIdRef = useRef<string>('');
  const savingRef = useRef<any>(null);

  useEffect(() => {
    try {
      const existing = localStorage.getItem("maisonhannie_device_id");
      const id = existing || (typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : String(Date.now()));
      if (!existing) localStorage.setItem("maisonhannie_device_id", id);
      deviceIdRef.current = id;
    } catch {}
    try {
      const saved = localStorage.getItem("maisonhannie_cart");
      if (saved) setCart(JSON.parse(saved));
    } catch {}
    (async () => {
      try {
        const resp = await fetch(`/api/state/cart?device_id=${encodeURIComponent(deviceIdRef.current)}`);
        const json = await resp.json();
        if (Array.isArray(json?.items) && json.items.length) setCart(json.items as any);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("maisonhannie_cart", JSON.stringify(cart));
    } catch {}
    try {
      if (savingRef.current) clearTimeout(savingRef.current);
      savingRef.current = setTimeout(() => {
        fetch('/api/state/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ device_id: deviceIdRef.current, items: cart }) }).catch(() => {});
      }, 400);
    } catch {}
  }, [cart]);

  function addToCart(product: Product, quantity = 1) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { ...product, quantity }];
    });
    setIsCartOpen(true);
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((i) => i.id !== productId));
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) return removeFromCart(productId);
    setCart((prev) => prev.map((i) => (i.id === productId ? { ...i, quantity } : i)));
  }

  function clearCart() {
    setCart([]);
  }

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart,
        cartTotal,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}