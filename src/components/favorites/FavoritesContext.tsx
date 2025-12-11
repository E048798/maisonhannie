"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type Product = { id: number; name: string; price: number; image: string; category?: string };

type FavoritesContextValue = {
  favorites: Product[];
  isFavorite: (id: number) => boolean;
  addFavorite: (product: Product) => void;
  removeFavorite: (id: number) => void;
  toggleFavorite: (product: Product) => void;
  clearFavorites: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
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
      const saved = localStorage.getItem("maisonhannie_favorites");
      if (saved) setFavorites(JSON.parse(saved));
    } catch {}
    (async () => {
      try {
        const resp = await fetch(`/api/state/favorites?device_id=${encodeURIComponent(deviceIdRef.current)}`);
        const json = await resp.json();
        if (Array.isArray(json?.items) && json.items.length) setFavorites(json.items as any);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("maisonhannie_favorites", JSON.stringify(favorites));
    } catch {}
    try {
      if (savingRef.current) clearTimeout(savingRef.current);
      savingRef.current = setTimeout(() => {
        fetch('/api/state/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ device_id: deviceIdRef.current, items: favorites }) }).catch(() => {});
      }, 400);
    } catch {}
  }, [favorites]);

  function isFavorite(id: number) {
    return favorites.some((p) => p.id === id);
  }

  function addFavorite(product: Product) {
    setFavorites((prev) => (prev.some((p) => p.id === product.id) ? prev : [...prev, product]));
  }

  function removeFavorite(id: number) {
    setFavorites((prev) => prev.filter((p) => p.id !== id));
  }

  function toggleFavorite(product: Product) {
    setFavorites((prev) => (prev.some((p) => p.id === product.id) ? prev.filter((p) => p.id !== product.id) : [...prev, product]));
  }

  function clearFavorites() {
    setFavorites([]);
  }

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite, clearFavorites, isOpen, setIsOpen }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}