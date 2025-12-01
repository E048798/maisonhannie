import Link from "next/link";
import { Button } from "@/components/ui/button";
import Newsletter from "@/components/shared/Newsletter";
import { Heart, Sparkles, Award, Target, Users, Palette } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Heart,
      title: "Passion",
      description: "Every piece is created with genuine love and dedication to craft.",
    },
    { icon: Sparkles, title: "Quality", description: "We use only premium materials to ensure lasting beauty." },
    { icon: Target, title: "Uniqueness", description: "No two pieces are exactly alike - each is a one-of-a-kind treasure." },
    { icon: Users, title: "Community", description: "Building connections through shared appreciation of handmade art." },
  ];

  return (
    <div>
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80')" }} />
        <div className="absolute inset-0 bg-black/80" />

        <div className="relative max-w-7xl mx-auto px-4 py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <Heart className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-white/90 text-sm font-medium">Our Story</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">
            About <span className="text-[#D4AF37]">Maison Hannie</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">Where handcrafted beauty meets heartfelt passion</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-black mb-6">
                The Heart Behind<br />
                <span className="text-[#D4AF37]">the Brand</span>
              </h2>

              <div className="space-y-6 text-black/70 leading-relaxed">
                <p>
                  Maison Hannie was born from a simple yet profound belief: that handcrafted items carry a piece of the maker&apos;s soul. What began as a creative outlet during quiet evenings has blossomed into a brand that celebrates the beauty of handmade artistry.
                </p>
                <p>
                  Our founder, Sarah Hannie, discovered her passion for resin art and beadwork while searching for meaningful ways to express creativity. Each piece became not just an object, but a story of patience, precision, and love.
                </p>
                <p>
                  Today, Maison Hannie encompasses three distinct yet harmonious collections: stunning resin works, elegant bead jewelry, and delicious homemade catering. Together, they represent our commitment to bringing handcrafted beauty into every aspect of life.
                </p>
              </div>

              <Link href="/contact">
                <Button className="mt-8 h-12 px-8 bg-[#D4AF37] hover:bg-[#C4A030] text-white font-medium rounded-full">Get in Touch</Button>
              </Link>
            </div>

            <div className="relative">
              <img src="https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=600&q=80" alt="Founder" className="rounded-3xl shadow-2xl" />
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#D4AF37] flex items-center justify-center">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-black text-lg">5+ Years</p>
                    <p className="text-black/60 text-sm">Creating Beauty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#F7F3EC]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full mb-6">
            <Palette className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-sm text-black font-medium">Our Mission</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-serif text-black mb-6 max-w-3xl mx-auto">
            &quot;To bring <span className="text-[#D4AF37]">handcrafted beauty</span> into everyday moments&quot;
          </h2>

          <p className="text-black/70 max-w-2xl mx-auto text-lg leading-relaxed">
            We believe that the things we surround ourselves with should be meaningful, beautiful, and made with care. Every piece from Maison Hannie is designed to add a touch of artisan elegance to your life.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-black mb-4">Our Values</h2>
            <p className="text-black/70 max-w-xl mx-auto">The principles that guide everything we create</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center p-8 bg-[#F7F3EC] rounded-2xl hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">{value.title}</h3>
                <p className="text-black/70">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Happy Clients" },
              { value: "1200+", label: "Products Made" },
              { value: "50+", label: "Events Catered" },
              { value: "5", label: "Years of Craft" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl md:text-5xl font-bold text-[#D4AF37] mb-2">{stat.value}</p>
                <p className="text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}