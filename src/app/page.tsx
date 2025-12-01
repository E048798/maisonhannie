import HeroSlider from "@/components/home/HeroSlider";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import AboutPreview from "@/components/home/AboutPreview";
import Newsletter from "@/components/shared/Newsletter";
import { testimonials } from "@/components/data/dummyData";
import { Quote } from "lucide-react";

export default function Home() {
  return (
    <div>
      <HeroSlider />
      <FeaturedProducts />
      <CategoryShowcase />
      <AboutPreview />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-black mb-4">
              What Our Clients Say
            </h2>
            <p className="text-black/70">
              Real stories from our wonderful community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-[#F7F3EC] rounded-2xl p-8 relative"
              >
                <Quote className="w-10 h-10 text-[#D4AF37]/20 absolute top-6 right-6" />
                <p className="text-black/80 leading-relaxed mb-6 relative z-10">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
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