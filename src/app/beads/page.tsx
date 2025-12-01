'use client';
import { useState } from "react";
import BeadsHero from "@/components/beads/BeadsHero";
import ProductCard from "@/components/shared/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Shimmer";
import ReviewCard from "@/components/shared/ReviewCard";
import Newsletter from "@/components/shared/Newsletter";
import { beadProducts, reviews } from "@/components/data/dummyData";
import { useCart } from "@/components/cart/CartContext";
import { Button } from "@/components/ui/button";
import { Gem, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BeadWorks() {
  const [isLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const { addToCart } = useCart();

  const filters = ["all", "Bracelets", "Necklaces", "Sets"] as const;

  const filteredProducts =
    activeFilter === "all"
      ? beadProducts
      : beadProducts.filter((p) => p.subcategory === activeFilter);

  

  return (
    <div>
      <BeadsHero />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E5DCC5] rounded-full mb-4">
              <Gem className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm text-black font-medium">Featured Collection</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-black mb-4">Best Selling Jewelry</h2>
            <p className="text-black/70 max-w-xl mx-auto">Our customers' favorites, perfect for any occasion</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {beadProducts
              .filter((p) => p.featured)
              .map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F7F3EC]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h2 className="text-3xl font-serif text-black">All Jewelry</h2>

            <div className="flex gap-2 flex-wrap">
              {filters.map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "rounded-full",
                    activeFilter === filter
                      ? "bg-[#D4AF37] hover:bg-[#C4A030] text-white"
                      : "border-[#D4AF37]/30 text-black hover:bg-[#D4AF37]/10"
                  )}
                >
                  {filter === "all" ? "All" : filter}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif text-black mb-2">Customer Love</h2>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>
                <span className="text-black/70">4.8 out of 5</span>
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