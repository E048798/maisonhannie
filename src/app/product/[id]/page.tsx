"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/components/cart/CartContext";
import { useFavorites } from "@/components/favorites/FavoritesContext";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/shared/StarRating";
import ReviewCard from "@/components/shared/ReviewCard";
import RatingModal from "@/components/rating/RatingModal";
import { ArrowLeft, ShoppingBag, Heart, Minus, Plus, Share2, Truck, Shield, RotateCcw, Star, Play, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Shimmer } from "@/components/ui/Shimmer";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category?: string;
  description?: string;
  featured?: boolean;
  rating?: number;
  reviews?: number;
  originalPrice?: number;
  images?: string[];
  videos?: string[];
};

export default function ProductDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const { addToCart } = useCart();
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState<{ type: "image" | "video"; src: string } | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [shareNotice, setShareNotice] = useState("");

  useEffect(() => {
    setProductLoading(true);
    supabase.from("products").select("*").eq("id", id).then(({ data }) => {
      const prod = (data && data[0]) || null;
      setProduct(prod as any);
      if (prod) {
        const firstImage = Array.isArray((prod as any).images) && (prod as any).images.length ? (prod as any).images[0] : (prod as any).image;
        setActiveMedia({ type: "image", src: String(firstImage) });
      }
      setProductLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setReviewsLoading(true);
    supabase
      .from("reviews")
      .select("id, name, rating, comment, created_at, product_id")
      .eq("product_id", id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setReviews(data || []);
        setReviewsLoading(false);
      });
  }, [id]);

  function handleAddToCart() {
    if (product) {
      for (let i = 0; i < quantity; i++) addToCart(product);
    }
  }

  if (productLoading) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-[#F7F3EC]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-[30vh] min-h-[200px] mb-8">
            <Shimmer className="w-full h-full rounded-2xl" />
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <Shimmer className="w-full h-[500px] rounded-3xl" />
              <div className="grid grid-cols-5 gap-3">
                {[...Array(5)].map((_, i) => (
                  <Shimmer key={i} className="h-20 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Shimmer className="h-8 w-64 rounded" />
              <Shimmer className="h-6 w-40 rounded" />
              <Shimmer className="h-24 w-full rounded" />
              <div className="flex gap-4">
                <Shimmer className="h-14 w-40 rounded-full" />
                <Shimmer className="h-14 w-40 rounded-full" />
                <Shimmer className="h-14 w-14 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-[#F7F3EC] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-black mb-4">Product not found</h1>
          <Link href="/shop">
            <Button className="bg-[#D4AF37] hover:bg-[#C4A030] text-white rounded-full">Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <section className="relative h-[30vh] min-h-[200px] flex items-end">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${product.image})` }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative w-full max-w-7xl mx-auto px-4 py-[50px] md:py-8">
          <Link href="/shop" className="inline-flex items-center gap-2 text-white/80 hover:text-[#D4AF37] transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Shop
          </Link>
          <p className="text-[#D4AF37] font-medium uppercase tracking-wider mb-1">{product.category}</p>
          <h1 className="text-3xl md:text-4xl font-serif text-white">{product.name}</h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="relative">
            <div className="sticky top-24">
              <div className="relative rounded-3xl overflow-hidden bg-white shadow-lg">
                {activeMedia?.type === "video" ? (
                  <video src={activeMedia.src} controls className="w-full h-[500px] object-cover bg-black" />
                ) : (
                  <img src={activeMedia?.src || product.image} alt={product.name} className="w-full h-[500px] object-cover" />
                )}
                {product.featured && (
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 bg-[#D4AF37] text-white font-medium rounded-full">Featured</span>
                  </div>
                )}
                <button onClick={() => product && toggleFavorite(product)} className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform">
                  <Heart className={cn('w-5 h-5 transition-colors', isFavorite(product.id) ? 'fill-pink-400 text-pink-400' : 'text-black/50')} />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-3">
                {[product.image, ...(product.images || []), ...(product.videos || [])]
                  .filter(Boolean)
                  .map((src, idx, arr) => {
                    const isVideo = (product.videos || []).includes(src as any);
                    const handleOpen = () => {
                      setActiveMedia({ type: isVideo ? "video" : "image", src: String(src) });
                      setIsMediaModalOpen(true);
                    };
                    return (
                      <button
                        key={idx}
                        onClick={handleOpen}
                        className={cn("relative h-20 rounded-lg overflow-hidden bg-[#F7F3EC] border", activeMedia?.src === src ? "border-[#D4AF37]" : "border-transparent")}
                      >
                        {isVideo ? (
                          <>
                            <video src={String(src)} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                <Play className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <img src={String(src)} alt="thumb" className="w-full h-full object-cover" />
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4 mb-6">
              {(() => {
                const count = reviews.length;
                const avg = count ? Math.round((reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / count) * 10) / 10 : 0;
                return <StarRating rating={avg} showCount count={count} />;
              })()}
              <button onClick={() => setShowRatingModal(true)} className="text-sm text-[#D4AF37] hover:underline">
                Write a review
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-bold text-black">₦{product.price.toLocaleString()}</span>
              {product.originalPrice && <span className="text-xl text-black/40 line-through">₦{product.originalPrice.toLocaleString()}</span>}
            </div>

            <p className="text-black/70 leading-relaxed mb-8">{product.description}</p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex items-center gap-4 bg-white rounded-full p-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-full bg-[#E5DCC5] flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-semibold text-black">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-full bg-[#E5DCC5] flex items-center justify-center hover:bg-[#D4AF37] hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button onClick={handleAddToCart} className="flex-1 h-14 bg-[#D4AF37] hover:bg-[#C4A030] text-white font-medium rounded-full text-base">
                <ShoppingBag className="w-5 h-5 mr-2" /> Add to Cart
              </Button>

              <button
                onClick={() => {
                  const url = typeof window !== 'undefined' ? window.location.href : '';
                  const data = { title: product.name, text: product.description || product.name, url };
                  if (navigator.share) {
                    navigator.share(data).catch(() => {});
                  } else if (navigator.clipboard && url) {
                    navigator.clipboard.writeText(url).then(() => {
                      setShareNotice('Link copied');
                      setTimeout(() => setShareNotice(''), 2000);
                    });
                  }
                }}
                className="w-14 h-14 rounded-full border-2 border-[#D4AF37]/30 flex items-center justify-center hover:bg-[#D4AF37]/10 transition-colors relative"
              >
                <Share2 className="w-5 h-5 text-black" />
                {shareNotice && (
                  <span className="absolute -bottom-8 text-xs bg-[#F7F3EC] px-2 py-1 rounded-full border border-[#D4AF37]/30 text-black">
                    {shareNotice}
                  </span>
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 p-6 bg-white rounded-2xl">
              {[
                { icon: Truck, label: 'Free Shipping', desc: 'On orders over ₦50,000' },
                { icon: Shield, label: 'Secure Payment', desc: '100% protected' },
                { icon: RotateCcw, label: 'Easy Returns', desc: '30-day returns' },
              ].map((feature) => (
                <div key={feature.label} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-2">
                    <feature.icon className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <p className="font-medium text-black text-sm">{feature.label}</p>
                  <p className="text-xs text-black/50">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-serif text-black mb-2">Customer Reviews</h2>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn('w-5 h-5', i < (reviews.length ? Math.round((reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length)) : 0) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-200')} />
                  ))}
                </div>
                <span className="text-black/70">{reviews.length ? Math.round((reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length) * 10) / 10 : 0} out of 5</span>
              </div>
            </div>
            <Button onClick={() => setShowRatingModal(true)} variant="outline" className="rounded-full border-[#D4AF37]/30 text-black">
              <Star className="w-4 h-4 mr-2" /> Write a Review
            </Button>
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
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={{ id: review.id, name: review.name, rating: review.rating, comment: review.comment, date: new Date(review.created_at).toLocaleDateString(), verified: true }} />
              ))}
            </div>
          )}
        </section>
      </div>

      <RatingModal isOpen={showRatingModal} onClose={() => setShowRatingModal(false)} product={product} />

      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsMediaModalOpen(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-xl">
              <button onClick={() => setIsMediaModalOpen(false)} className="absolute right-3 top-3 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30">
                <X className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => {
                  const items = [product.image, ...(product.images || []), ...(product.videos || [])].filter(Boolean) as string[];
                  const idx = items.findIndex((s) => s === activeMedia?.src);
                  const nextIdx = (idx - 1 + items.length) % items.length;
                  const isVid = (product.videos || []).includes(items[nextIdx] as any);
                  setActiveMedia({ type: isVid ? 'video' : 'image', src: String(items[nextIdx]) });
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => {
                  const items = [product.image, ...(product.images || []), ...(product.videos || [])].filter(Boolean) as string[];
                  const idx = items.findIndex((s) => s === activeMedia?.src);
                  const nextIdx = (idx + 1) % items.length;
                  const isVid = (product.videos || []).includes(items[nextIdx] as any);
                  setActiveMedia({ type: isVid ? 'video' : 'image', src: String(items[nextIdx]) });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
              {activeMedia?.type === 'video' ? (
                <video src={activeMedia?.src || ''} controls autoPlay className="w-full max-h-[80vh]" />
              ) : (
                <img src={activeMedia?.src || ''} alt="media" className="w-full max-h-[80vh] object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}