"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: 0,
    title: "Tailor Works",
    subtitle: "Women’s Handmade Gowns",
    description: "Custom-tailored gowns crafted for women with timeless elegance",
    image: "https://iagnlzvwcrqsscaloauy.supabase.co/storage/v1/object/public/Images/13025.jpg",
    href: "/tailor",
    color: "from-violet-900/70",
  },
  {
    id: 1,
    title: "Resin Works",
    subtitle: "Artisan Creations",
    description: "Discover handcrafted resin trays, coasters, and wall art that transform your space",
    image: "https://iagnlzvwcrqsscaloauy.supabase.co/storage/v1/object/public/Images/2148734208.jpg",
    href: "/resin",
    color: "from-blue-900/70",
  },
  {
    id: 2,
    title: "Bead Works",
    subtitle: "Elegant Jewelry",
    description: "Handmade bracelets, necklaces, and accessories crafted with love",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1920&q=80",
    href: "/beads",
    color: "from-pink-900/70",
  },
  {
    id: 3,
    title: "Catering",
    subtitle: "Homemade Delights",
    description: "Delicious homemade meals and event catering for every occasion",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=1920&q=80",
    href: "/catering",
    color: "from-amber-900/70",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const imgs = slides.map((s) => {
      const img = new Image();
      img.src = s.image;
      return img;
    });
    Promise.all(
      imgs.map(
        (img) =>
          new Promise((resolve) => {
            img.onload = resolve as any;
            img.onerror = resolve as any;
          })
      )
    ).then(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const prevSlide = () => {};
  const nextSlide = () => {};

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-black to-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Loading beautiful things...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative h-screen overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-all duration-1000 ease-out",
            index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
          )}
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }} />
          <div className={cn("absolute inset-0 bg-gradient-to-r to-transparent", slide.color)} />
          <div className="absolute inset-0 bg-black/30" />

          <div className="relative h-full max-w-7xl mx-auto px-4 pl-[30px] flex items-center">
            <div
              className={cn(
                "max-w-xl transition-all duration-1000 delay-300",
                index === currentSlide ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-white/90 text-sm font-medium">{slide.subtitle}</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">{slide.title}</h1>

              <p className="text-lg text-white/80 mb-12 leading-relaxed">{slide.description}</p>

              <div className="flex gap-4">
                <Link href={slide.href}>
                  <Button className="h-14 px-8 bg-[#D4AF37] hover:bg-[#C4A030] text-white font-medium rounded-full text-base">Explore Collection</Button>
                </Link>
                <Link href="/shop">
                  <Button variant="outline" className="h-14 px-8 border-2 border-white/30 text-white hover:bg-white hover:text-black font-medium rounded-full text-base bg-transparent">Shop All</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      
    </section>
  );
}