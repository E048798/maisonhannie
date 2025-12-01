'use client';
import { useState } from 'react';
import Link from 'next/link';
import { allProducts, reviews } from '@/components/data/dummyData';
import { useCart } from '@/components/cart/CartContext';
import { Button } from '@/components/ui/button';
import { Shimmer } from '@/components/ui/Shimmer';
import StarRating from '@/components/shared/StarRating';
import ReviewCard from '@/components/shared/ReviewCard';
import RatingModal from '@/components/rating/RatingModal';
import { ArrowLeft, ShoppingBag, Heart, Minus, Plus, Share2, Truck, Shield, RotateCcw, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

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
};

export default function ProductDetail() {
  const [product, setProduct] = useState<Product | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const productIdParam = params.get('id');
    const productId = productIdParam ? Number(productIdParam) : NaN;
    const foundProduct = allProducts.find((p: any) => p.id === productId);
    return (foundProduct as Product) || null;
  });
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const { addToCart } = useCart();
  

  function handleAddToCart() {
    if (product) {
      for (let i = 0; i < quantity; i++) addToCart(product);
    }
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
        <div className="relative w-full max-w-7xl mx-auto px-4 pb-8">
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
                <img src={product.image} alt={product.name} className="w-full h-[500px] object-cover" />
                {product.featured && (
                  <div className="absolute top-6 left-6">
                    <span className="px-4 py-2 bg-[#D4AF37] text-white font-medium rounded-full">Featured</span>
                  </div>
                )}
                <button onClick={() => setIsWishlisted(!isWishlisted)} className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform">
                  <Heart className={cn('w-5 h-5 transition-colors', isWishlisted ? 'fill-pink-400 text-pink-400' : 'text-black/50')} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4 mb-6">
              <StarRating rating={product.rating ?? 0} showCount count={product.reviews ?? 0} />
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

              <button className="w-14 h-14 rounded-full border-2 border-[#D4AF37]/30 flex items-center justify-center hover:bg-[#D4AF37]/10 transition-colors">
                <Share2 className="w-5 h-5 text-black" />
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
                    <Star key={i} className={cn('w-5 h-5', i < (product.rating ?? 0) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-200')} />
                  ))}
                </div>
                <span className="text-black/70">{product.rating ?? 0} out of 5</span>
              </div>
            </div>
            <Button onClick={() => setShowRatingModal(true)} variant="outline" className="rounded-full border-[#D4AF37]/30 text-black">
              <Star className="w-4 h-4 mr-2" /> Write a Review
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {reviews.slice(0, 4).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      </div>

      <RatingModal isOpen={showRatingModal} onClose={() => setShowRatingModal(false)} product={product} />
    </div>
  );
}