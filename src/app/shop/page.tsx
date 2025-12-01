'use client';
import { useState, useEffect } from "react";
import ProductCard from "@/components/shared/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Shimmer";
import { allProducts } from "@/components/data/dummyData";
import { useCart } from "@/components/cart/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Shop() {
  const [isLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    if (category) {
      if (category.includes("Resin")) setActiveTab("resin");
      else if (category.includes("Bead")) setActiveTab("beads");
      else if (category.includes("Catering")) setActiveTab("catering");
    }
  }, []);

  

  let filteredProducts = [...allProducts];

  if (activeTab === "resin") {
    filteredProducts = filteredProducts.filter((p) => p.category === "Resin Works");
  } else if (activeTab === "beads") {
    filteredProducts = filteredProducts.filter((p) => p.category === "Bead Works");
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
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-25">Under $25</SelectItem>
                <SelectItem value="25-50">$25 - $50</SelectItem>
                <SelectItem value="50-100">$50 - $100</SelectItem>
                <SelectItem value="100-999">$100+</SelectItem>
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

        <p className="text-black/60 mb-6">{filteredProducts.length} product{filteredProducts.length !== 1 && "s"} found</p>

        {filteredProducts.length === 0 ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}