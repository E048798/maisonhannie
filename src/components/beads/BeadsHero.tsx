import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Gem, Heart } from "lucide-react";

export default function BeadsHero() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1920&q=80')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-pink-900/80 via-pink-900/60 to-transparent" />

      <div className="absolute top-32 right-32 w-72 h-72 bg-[#D4AF37]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-16 right-16 w-48 h-48 bg-pink-300/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <Gem className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-white/90 text-sm font-medium">Handmade Jewelry</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
            Bead <span className="text-[#D4AF37]">Works</span>
          </h1>

          <p className="text-xl text-white/80 mb-8 leading-relaxed">
            Elegant bracelets, necklaces, and accessories handcrafted with love.
            Each piece is a unique expression of artistry and style.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/shop?category=Bead%20Works">
              <Button className="h-14 px-8 bg-[#D4AF37] hover:bg-[#C4A030] text-white font-medium rounded-full text-base">
                <Heart className="w-5 h-5 mr-2" />
                Shop Jewelry Collection
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/20">
            {[
              { value: "Natural", label: "Gemstones" },
              { value: "Custom", label: "Designs Available" },
              { value: "Gift", label: "Ready Packaging" },
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