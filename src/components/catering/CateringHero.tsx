"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Calendar } from "lucide-react";

export default function CateringHero() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555244162-803834f70033?w=1920&q=80')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-amber-900/90 via-amber-900/70 to-transparent" />

      <div className="absolute top-20 right-20 w-80 h-80 bg-[#D4AF37]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-32 right-48 w-64 h-64 bg-orange-300/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <UtensilsCrossed className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-white/90 text-sm font-medium">Homemade Delights</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
            Catering <span className="text-[#D4AF37]">Services</span>
          </h1>

          <p className="text-xl text-white/80 mb-8 leading-relaxed">
            From intimate gatherings to grand celebrations, we bring homemade
            goodness to your table. Fresh ingredients, made with love.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              className="h-14 px-8 bg-[#D4AF37] hover:bg-[#C4A030] text-white font-medium rounded-full text-base"
              onClick={() => document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Catering
            </Button>
            <Link href="/shop?category=Catering">
              <Button variant="outline" className="h-14 px-8 border-2 border-white/30 text-white hover:bg-white hover:text-black font-medium rounded-full text-base bg-transparent">
                View Menu
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/20">
            {[
              { value: "Fresh", label: "Ingredients" },
              { value: "Custom", label: "Menus Available" },
              { value: "50+", label: "Events Catered" },
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