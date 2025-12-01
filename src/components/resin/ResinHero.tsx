"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Palette } from "lucide-react";

export default function ResinHero() {
  const [heroUrl, setHeroUrl] = useState<string>(
    "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=1920&q=80"
  );

  useEffect(() => {
    const candidate = "/resin-hero.jpg";
    const img = new Image();
    img.src = candidate;
    img.onload = () => setHeroUrl(candidate);
  }, []);

  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${heroUrl}')` }} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />

      <div className="absolute top-20 right-20 w-64 h-64 bg-[#D4AF37]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <Palette className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-white/90 text-sm font-medium">Artisan Resin Collection</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
            Resin <span className="text-[#D4AF37]">Works</span>
          </h1>

          <p className="text-xl text-white/80 mb-8 leading-relaxed">
            Each piece tells a story. Discover handcrafted resin trays, coasters,
            and wall art that transform ordinary spaces into extraordinary ones.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/shop?category=Resin%20Works">
              <Button className="h-14 px-8 bg-[#D4AF37] hover:bg-[#C4A030] text-white font-medium rounded-full text-base">
                <Sparkles className="w-5 h-5 mr-2" />
                Shop Resin Collection
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/20">
            {[
              { value: "100%", label: "Handmade" },
              { value: "Eco", label: "Friendly Materials" },
              { value: "Unique", label: "One-of-a-kind" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-2xl font-bold text-[#D4AF37]">{item.value}</p>
                <p className="text-sm text-white/60">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}