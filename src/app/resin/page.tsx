'use client';
import { useEffect, useState } from "react";
import ResinHero from "@/components/resin/ResinHero";
import ProductCard from "@/components/shared/ProductCard";
import { ProductCardSkeleton, Shimmer } from "@/components/ui/Shimmer";
import ReviewCard from "@/components/shared/ReviewCard";
import Newsletter from "@/components/shared/Newsletter";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/components/cart/CartContext";
import { Sparkles, Star } from "lucide-react";

export default function ResinWorks() {
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const [resinProducts, setResinProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    supabase.from('site_settings').select('show_resin').limit(1).then(({ data }) => {
      const s = (data && data[0]) || null;
      setBlocked(!(s?.show_resin ?? true));
      setSettingsLoaded(true);
    });
    supabase.from("products").select("*").eq("category", "Resin Works").then(({ data }) => {
      const products = data || [];
      setResinProducts(products);
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
            setResinProducts((prev) =>
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

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {resinProducts.filter((p) => p.featured).map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-[#F7F3EC]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-serif text-black mb-8">All Resin Products</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resinProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
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
                <span className="text-black/70">Latest from Resin products</span>
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