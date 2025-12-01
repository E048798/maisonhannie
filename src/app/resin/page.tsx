'use client';
import { useState } from "react";
import ResinHero from "@/components/resin/ResinHero";
import ProductCard from "@/components/shared/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Shimmer";
import ReviewCard from "@/components/shared/ReviewCard";
import Newsletter from "@/components/shared/Newsletter";
import { resinProducts, reviews } from "@/components/data/dummyData";
import { useCart } from "@/components/cart/CartContext";
import { Sparkles, Star } from "lucide-react";

export default function ResinWorks() {
  const [isLoading] = useState(false);
  const { addToCart } = useCart();

  const featuredResin = resinProducts.filter((p) => p.featured);

  

  return (
    <div>
      <ResinHero />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E5DCC5] rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm text-black font-medium">Best Sellers</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-black mb-4">Featured Resin Pieces</h2>
            <p className="text-black/70 max-w-xl mx-auto">Our most loved creations, crafted with precision and passion</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredResin.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F7F3EC]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-serif text-black mb-8">All Resin Products</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resinProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif text-black mb-2">Customer Reviews</h2>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>
                <span className="text-black/70">4.9 out of 5</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {reviews.slice(0, 4).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}