"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const categories = [
  {
    id: 0,
    name: "Tailor Works",
    description: "Women’s handmade gowns",
    image: "https://iagnlzvwcrqsscaloauy.supabase.co/storage/v1/object/public/Images/13025.jpg",
    href: "/tailor",
    count: "",
  },
  {
    id: 1,
    name: "Resin Works",
    description: "Artistic home décor & trays",
    image: "https://iagnlzvwcrqsscaloauy.supabase.co/storage/v1/object/public/Images/2148734208.jpg",
    href: "/resin",
    count: "24 Products",
  },
  {
    id: 2,
    name: "Bead Works",
    description: "Handcrafted jewelry",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80",
    href: "/beads",
    count: "32 Products",
  },
  {
    id: 3,
    name: "Catering",
    description: "Homemade delights",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80",
    href: "/catering",
    count: "18 Items",
  },
];

export default function CategoryShowcase() {
  const [tailorCount, setTailorCount] = useState<number | null>(null);
  const [resinCount, setResinCount] = useState<number | null>(null);
  const [beadsCount, setBeadsCount] = useState<number | null>(null);
  const [cateringCount, setCateringCount] = useState<number | null>(null);
  useEffect(() => {
    Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }).eq("category", "Fashion Design"),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("category", "Resin Works"),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("category", "Bead Works"),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("category", "Catering"),
    ]).then(([tailor, resin, beads, catering]) => {
      setTailorCount(tailor.count ?? 0);
      setResinCount(resin.count ?? 0);
      setBeadsCount(beads.count ?? 0);
      setCateringCount(catering.count ?? 0);
    });
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#F7F3EC]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-black mb-4">Explore Our Collections</h2>
          <p className="text-black/70 max-w-xl mx-auto">Four unique artisan experiences, one beautiful brand</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={category.href} className="group relative h-[400px] rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${category.image})` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="inline-block px-3 py-1 bg-[#D4AF37] text-white text-xs font-medium rounded-full mb-4">
                  {category.id === 0
                    ? `${tailorCount ?? 0} Products`
                    : category.id === 1
                    ? `${resinCount ?? 0} Products`
                    : category.id === 2
                    ? `${beadsCount ?? 0} Products`
                    : `${cateringCount ?? 0} Items`}
                </span>
                <h3 className="text-2xl font-serif text-white mb-2">{category.name}</h3>
                <p className="text-white/70 mb-4">{category.description}</p>
                <div className="flex items-center gap-2 text-[#D4AF37] font-medium">
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}