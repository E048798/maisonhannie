"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import Newsletter from "@/components/shared/Newsletter";
import ProductCard from "@/components/shared/ProductCard";
import { Star } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import ReviewCard from "@/components/shared/ReviewCard";
import { Shimmer } from "@/components/ui/Shimmer";

type Product = { id: number; name: string; category: string; subcategory?: string; price: number; image: string; description?: string; rating?: number; reviews?: number; featured?: boolean };

export default function Tailor() {
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const { addToCart } = useCart();
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    supabase.from('site_settings').select('show_tailor').limit(1).then(({ data }) => {
      const s = (data && data[0]) || null;
      setBlocked(!(s?.show_tailor ?? true));
      setSettingsLoaded(true);
    });
    supabase
      .from("products")
      .select("*")
      .eq("category", "Fashion Design")
      .then(({ data }) => {
        const products = (data as any) || [];
        setProducts(products);
        setIsLoading(false);
        const ids = products.map((p: any) => p.id);
        if (ids.length) {
          supabase
            .from("reviews")
            .select("id, name, rating, comment, created_at, product_id")
            .in("product_id", ids)
            .order("created_at", { ascending: false })
            .then(({ data: rdata }) => {
              const r = rdata || [];
              setReviews(r);
              const stats: Record<number, { count: number; sum: number }> = {};
              r.forEach((rev: any) => {
                const pid = rev.product_id as number;
                if (!stats[pid]) stats[pid] = { count: 0, sum: 0 };
                stats[pid].count += 1;
                stats[pid].sum += Number(rev.rating) || 0;
              });
              setProducts((prev) =>
                prev.map((p) => {
                  const s = stats[p.id];
                  const avg = s ? Math.round((s.sum / s.count) * 10) / 10 : 0;
                  return { ...p, reviews: s?.count ?? 0, rating: avg };
                })
              );
              setReviewsLoading(false);
            });
        } else {
          setReviews([]);
          setReviewsLoading(false);
        }
      });
  }, []);

  const filters = ["all", "Dresses", "Tops", "Sets", "Accessories"];

  const filteredProducts = products
    .filter((p) => (activeFilter === "all" ? true : p.subcategory === activeFilter))
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });

  if (settingsLoaded && blocked) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-[#F7F3EC] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-black mb-4">404 — Page Not Found</h1>
          <p className="text-black/60 mb-6">This page is currently unavailable.</p>
          <a href="/" className="inline-block px-6 py-3 rounded-full bg-[#D4AF37] text-white">Go Home</a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://iagnlzvwcrqsscaloauy.supabase.co/storage/v1/object/public/Images/13025.jpg')" }} />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative max-w-7xl mx-auto px-4 py-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <Star className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-white/90 text-sm font-medium">Women’s Handmade Gowns</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">Tailor Works</h1>
          <p className="text-white/80 max-w-xl">Custom-tailored gowns and garments for women. Explore dresses, tops, sets, and accessories crafted with care.</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E5DCC5] rounded-full mb-4">
              <span className="text-sm text-black font-medium">Best Sellers</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-black mb-4">Featured Tailor Pieces</h2>
            <p className="text-black/70 max-w-xl mx-auto">Our most loved gowns and sets, tailored with precision</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[400px] rounded-2xl bg-[#F7F3EC] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.filter((p) => p.featured).map((product) => (
                <ProductCard key={product.id} product={product as any} onAddToCart={addToCart} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "rounded-full",
                    activeFilter === filter ? "bg-[#D4AF37] hover:bg-[#C4A030] text-white" : "border-[#D4AF37]/30 text-black hover:bg-[#D4AF37]/10"
                  )}
                >
                  {filter === "all" ? "All" : filter}
                </Button>
              ))}
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40 h-12 rounded-xl border-[#D4AF37]/20">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[400px] rounded-2xl bg-[#F7F3EC] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product as any} onAddToCart={addToCart} />
              ))}
            </div>
          )}
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
                <span className="text-black/70">Latest from Tailor products</span>
              </div>
            </div>
          </div>

          {reviewsLoading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
                  <div className="flex items-center gap-4">
                    <Shimmer className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Shimmer className="h-4 w-32 rounded" />
                      <Shimmer className="h-3 w-24 rounded" />
                    </div>
                  </div>
                  <Shimmer className="h-3 w-full rounded" />
                  <Shimmer className="h-3 w-5/6 rounded" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-center text-black/60">No reviews yet</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.slice(0, 4).map((r) => (
                <ReviewCard key={r.id} review={{ id: r.id, name: r.name, rating: r.rating, comment: r.comment, date: new Date(r.created_at).toLocaleDateString(), verified: true }} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Newsletter />
    </div>
  );
}