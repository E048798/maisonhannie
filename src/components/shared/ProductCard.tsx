"use client";
import { useState } from "react";
import Link from "next/link";
import { Star, ShoppingBag, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/components/favorites/FavoritesContext";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category?: string;
  rating?: number;
  reviews?: number;
  originalPrice?: number;
  featured?: boolean;
};

export default function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart?: (p: Product) => void }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button onClick={() => toggleFavorite(product)} className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform">
        <Heart className={cn("w-4 h-4 transition-colors", isFavorite(product.id) ? "fill-pink-400 text-pink-400" : "text-black/50")} />
      </button>

      {product.featured && <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-[#D4AF37] text-white text-xs font-medium rounded-full">Featured</div>}

      <Link href={`/product/${product.id}`} className="relative h-64 overflow-hidden bg-[#F7F3EC] block">
        <img src={product.image} alt={product.name} className={cn("w-full h-full object-cover transition-transform duration-700", isHovered && "scale-110")} />
        <div className={cn("absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent transition-all duration-300", isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}> 
          <Button
            variant="secondary"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart?.(product); }}
            className="w-full transition-colors rounded-lg"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </Link>

      <div className="p-5">
        <p className="text-xs text-[#D4AF37] font-medium uppercase tracking-wider mb-1">{product.category}</p>
        <h3 className="font-semibold text-black text-lg mb-2 line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={cn("w-3.5 h-3.5", i < (product.rating ?? 0) ? "fill-[#D4AF37] text-[#D4AF37]" : "text-gray-200")} />
          ))}
          <span className="text-xs text-black/60 ml-1">({product.reviews ?? 0})</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-black">₦{product.price.toLocaleString()}</p>
          {product.originalPrice && <p className="text-sm text-black/40 line-through">₦{product.originalPrice.toLocaleString()}</p>}
        </div>
      </div>
    </div>
  );
}