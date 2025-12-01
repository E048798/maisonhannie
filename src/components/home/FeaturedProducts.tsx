"use client";
import { useState } from "react";
import Link from "next/link";
import { allProducts } from "@/components/data/dummyData";
import ProductCard from "@/components/shared/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Shimmer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartContext";
import { ArrowRight, Sparkles } from "lucide-react";

export default function FeaturedProducts() {
  const [isLoading] = useState(false);
  const { addToCart } = useCart();

  const featuredProducts = allProducts.filter((p) => p.featured).slice(0, 8);

  

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E5DCC5] rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-sm text-black font-medium">Curated Selection</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif text-black mb-4">Featured Products</h2>
          <p className="text-black/70 max-w-xl mx-auto">Discover our most loved handcrafted pieces, from stunning resin art to elegant jewelry</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/shop">
            <Button className="h-14 px-8 bg-black hover:bg-black/80 text-white font-medium rounded-full">
              View All Products
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}