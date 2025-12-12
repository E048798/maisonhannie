"use client";
import { useFavorites } from "@/components/favorites/FavoritesContext";
import { useCart } from "@/components/cart/CartContext";
import { Button } from "@/components/ui/button";
import { X, ShoppingBag, Trash2 } from "lucide-react";

export default function FavoritesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { favorites, removeFavorite, clearFavorites } = useFavorites();
  const { addToCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-black">Favorites</h3>
            <div className="flex items-center gap-2">
              {favorites.length > 0 && (
                <button onClick={clearFavorites} className="px-3 py-2 text-sm rounded-full border border-[#D4AF37]/30 text-black hover:bg-[#E5DCC5]">
                  Clear All
                </button>
              )}
              <button onClick={onClose} className="p-2 rounded-full hover:bg-[#E5DCC5]">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-[60vh] overflow-auto">
            {favorites.length === 0 ? (
              <p className="text-black/60 text-center py-8">No favorites yet</p>
            ) : (
              favorites.map((p) => (
                <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 bg-[#F7F3EC] rounded-xl">
                  <img src={p.image} alt={p.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1 w-full">
                    <p className="font-medium text-black">{p.name}</p>
                    <p className="text-sm text-[#D4AF37]">₦{p.price?.toLocaleString?.() ?? p.price}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full sm:w-auto">
                    <Button onClick={() => addToCart(p)} className="w-full sm:w-auto rounded-full bg-[#D4AF37] hover:bg-[#C4A030] text-white">
                      <ShoppingBag className="w-4 h-4 mr-2" /> Add
                    </Button>
                    <Button onClick={() => removeFavorite(p.id)} className="w-full sm:w-auto rounded-full bg-black hover:bg-black/90 text-white">
                      <Trash2 className="w-4 h-4 mr-2" /> Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}