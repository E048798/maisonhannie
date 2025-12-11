'use client';
import { useEffect, useState } from "react";
import CateringHero from "@/components/catering/CateringHero";
import BookingForm from "@/components/catering/BookingForm";
import ProductCard from "@/components/shared/ProductCard";
import { ProductCardSkeleton, Shimmer } from "@/components/ui/Shimmer";
import Newsletter from "@/components/shared/Newsletter";
import { useCart } from "@/components/cart/CartContext";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import ReviewCard from "@/components/shared/ReviewCard";

export default function Catering() {
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const { addToCart } = useCart();
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  const categories = ["all", "Breakfast", "Lunch", "Pastries", "Events"] as const;

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.subcategory === activeCategory);

  useEffect(() => {
    supabase.from('site_settings').select('show_catering').limit(1).then(({ data }) => {
      const s = (data && data[0]) || null;
      setBlocked(!(s?.show_catering ?? true));
      setSettingsLoaded(true);
    });
    supabase
      .from("products")
      .select("*")
      .eq("category", "Catering")
      .then(({ data }) => {
        const prods = data || [];
        setProducts(prods);
        const ids = prods.map((p: any) => p.id);
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
              setIsLoading(false);
            });
        } else {
          setReviews([]);
          setReviewsLoading(false);
          setIsLoading(false);
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
      <CateringHero />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F8E8E8] rounded-full mb-4">
              <UtensilsCrossed className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-sm text-black font-medium">Our Menu</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-black mb-4">Delicious Offerings</h2>
            <p className="text-black/70 max-w-xl mx-auto">From breakfast to events, we have something for every occasion</p>
          </div>

          <div className="flex justify-center gap-2 mb-12 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "rounded-full px-6",
                  activeCategory === category
                    ? "bg-[#D4AF37] hover:bg-[#C4A030] text-white"
                    : "border-[#D4AF37]/30 text-black hover:bg-[#D4AF37]/10"
                )}
              >
                {category === "all" ? "All" : category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [...Array(9)].map((_, i) => <ProductCardSkeleton key={i} />)
            ) : (
              filteredProducts.map((item) => (
                <ProductCard key={item.id} product={item} onAddToCart={addToCart} />
              ))
            )}
          </div>
        </div>
      </section>

      <section id="booking-form" className="py-20 bg-[#F7F3EC]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-black mb-6">
                Let Us Cater Your<br />
                <span className="text-[#D4AF37]">Next Event</span>
              </h2>
              <p className="text-black/70 mb-8 leading-relaxed">
                Whether it&apos;s an intimate brunch or a grand celebration, our team will work with you to create a memorable culinary experience.
              </p>

              <div className="space-y-4">
                {["Customized menus for any dietary needs", "Fresh, locally sourced ingredients", "Professional setup and service", "Flexible packages for any budget"].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                      </div>
                      <span className="text-black/80">{item}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <BookingForm />
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
                <span className="text-black/70">Latest from Catering orders</span>
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