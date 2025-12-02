"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/shared/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Shimmer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartContext";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function FeaturedProducts() {
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("products")
      .select("*")
      .then(({ data }) => {
        const prods = (data || []).filter((p: any) => p.featured).slice(0, 8);
        setProducts(prods);
        const ids = prods.map((p: any) => p.id);
        if (ids.length) {
          supabase
            .from("reviews")
            .select("id, name, rating, comment, created_at, product_id")
            .in("product_id", ids)
            .order("created_at", { ascending: false })
            .then(({ data: rdata }) => {
              const reviews = rdata || [];
              const stats: Record<number, { count: number; sum: number }> = {};
              reviews.forEach((r: any) => {
                const pid = r.product_id as number;
                if (!stats[pid]) stats[pid] = { count: 0, sum: 0 };
                stats[pid].count += 1;
                stats[pid].sum += Number(r.rating) || 0;
              });
              setProducts((prev) =>
                prev.map((p) => {
                  const s = stats[p.id];
                  const avg = s ? Math.round((s.sum / s.count) * 10) / 10 : 0;
                  return { ...p, reviews: s?.count ?? 0, rating: avg };
                })
              );
              setIsLoading(false);
            });
        } else {
          setIsLoading(false);
        }
      });
  }, []);

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
          {isLoading ? (
            [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)
          ) : (
            products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))
          )}
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