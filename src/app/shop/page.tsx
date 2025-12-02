'use client';
import { useState, useEffect } from "react";
import ProductCard from "@/components/shared/ProductCard";
import { ProductCardSkeleton, Shimmer } from "@/components/ui/Shimmer";
import ReviewCard from "@/components/shared/ReviewCard";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/components/cart/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Shop() {
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    supabase.from('site_settings').select('show_shop').limit(1).then(({ data }) => {
      const s = (data && data[0]) || null;
      setBlocked(!(s?.show_shop ?? true));
      setSettingsLoaded(true);
    });
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    if (category) {
      if (category.includes("Resin")) setActiveTab("resin");
      else if (category.includes("Bead")) setActiveTab("beads");
      else if (category.includes("Tailor") || category.includes("Fashion")) setActiveTab("tailor");
      else if (category.includes("Catering")) setActiveTab("catering");
    }
    supabase
      .from("products")
      .select("*")
      .then(({ data }) => {
        const prods = data || [];
        setProducts(prods);
        setIsLoading(false);
        const ids = prods.map((p: any) => p.id);
        if (ids.length) {
          supabase
            .from("reviews")
            .select("id, name, rating, comment, created_at, product_id")
            .in("product_id", ids)
            .order("created_at", { ascending: false })
            .then(({ data: rdata }) => {
              const reviews = rdata || [];
              setAllReviews(reviews);
              // Aggregate rating and review count per product
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
              setReviewsLoading(false);
            });
        } else {
          setAllReviews([]);
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

  

  let filteredProducts = [...products];

  if (activeTab === "resin") {
    filteredProducts = filteredProducts.filter((p) => p.category === "Resin Works");
  } else if (activeTab === "beads") {
    filteredProducts = filteredProducts.filter((p) => p.category === "Bead Works");
  } else if (activeTab === "tailor") {
    filteredProducts = filteredProducts.filter((p) => p.category === "Fashion Design");
  } else if (activeTab === "catering") {
    filteredProducts = filteredProducts.filter((p) => p.category === "Catering");
  }

  if (searchQuery) {
    filteredProducts = filteredProducts.filter(
      (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (priceRange !== "all") {
    const [min, max] = priceRange.split("-").map(Number);
    filteredProducts = filteredProducts.filter((p) => {
      if (max) return p.price >= min && p.price <= max;
      return p.price >= min;
    });
  }

  if (sortBy === "price-low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating") {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-serif mb-4">Shop All</h1>
          <p className="text-white/80 max-w-xl mx-auto text-lg">Discover our complete collection of handcrafted beauty</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/80 backdrop-blur-sm p-1 rounded-full">
              <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white px-6">All</TabsTrigger>
              <TabsTrigger value="resin" className="rounded-full data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white px-6">Resin</TabsTrigger>
              <TabsTrigger value="beads" className="rounded-full data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white px-6">Beads</TabsTrigger>
              <TabsTrigger value="tailor" className="rounded-full data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white px-6">Tailor</TabsTrigger>
              <TabsTrigger value="catering" className="rounded-full data-[state=active]:bg-[#D4AF37] data-[state=active]:text-white px-6">Catering</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white rounded-2xl p-4 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
            <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 h-12 rounded-xl border-[#D4AF37]/20 focus:border-[#D4AF37]" />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-black/40 hover:text-black" />
              </button>
            )}
          </div>

          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:hidden h-12 rounded-full border-[#D4AF37]/30">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>

          <div className={cn("flex gap-4", showFilters ? "flex flex-col md:flex-row" : "hidden md:flex")}> 
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-full md:w-40 h-12 rounded-xl border-[#D4AF37]/20">
                <SelectValue placeholder="Price Range (₦)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-10000">Under ₦10,000</SelectItem>
                <SelectItem value="10000-25000">₦10,000 - ₦25,000</SelectItem>
                <SelectItem value="25000-50000">₦25,000 - ₦50,000</SelectItem>
                <SelectItem value="50000-100000">₦50,000 - ₦100,000</SelectItem>
                <SelectItem value="100000-99999999">₦100,000+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40 h-12 rounded-xl border-[#D4AF37]/20">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-black/60 mb-4">No products found</p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setPriceRange("all");
                setActiveTab("all");
              }}
              className="bg-[#D4AF37] hover:bg-[#C4A030] text-white rounded-full"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <p className="text-black/60 mb-6">{filteredProducts.length} product{filteredProducts.length !== 1 && "s"} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
            <section className="py-16">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-serif text-black mb-6">All Reviews</h2>
                {reviewsLoading ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {[...Array(6)].map((_, i) => (
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
                ) : allReviews.length === 0 ? (
                  <p className="text-black/60">No reviews yet</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {allReviews.slice(0, 12).map((r) => (
                      <ReviewCard key={r.id} review={{ id: r.id, name: r.name, rating: r.rating, comment: r.comment, date: new Date(r.created_at).toLocaleDateString(), verified: true }} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}