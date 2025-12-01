'use client';
import { useState } from "react";
import CateringHero from "@/components/catering/CateringHero";
import BookingForm from "@/components/catering/BookingForm";
import ProductCard from "@/components/shared/ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Shimmer";
import Newsletter from "@/components/shared/Newsletter";
import { cateringMenu, testimonials } from "@/components/data/dummyData";
import { useCart } from "@/components/cart/CartContext";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Catering() {
  const [isLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const { addToCart } = useCart();

  const categories = ["all", "Breakfast", "Lunch", "Pastries", "Events"] as const;

  const filteredMenu =
    activeCategory === "all"
      ? cateringMenu
      : cateringMenu.filter((p) => p.subcategory === activeCategory);

  

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
            {filteredMenu.map((item) => (
              <ProductCard key={item.id} product={item} onAddToCart={addToCart} />
            ))}
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
          <h2 className="text-3xl font-serif text-black text-center mb-12">Happy Clients</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-[#F7F3EC] rounded-2xl p-8 relative">
                <Quote className="w-10 h-10 text-[#D4AF37]/20 absolute top-6 right-6" />
                <p className="text-black/80 leading-relaxed mb-6 relative z-10">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h4 className="font-semibold text-black">{testimonial.name}</h4>
                    <p className="text-sm text-[#D4AF37]">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}