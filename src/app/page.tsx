import HeroSlider from "@/components/home/HeroSlider";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import Newsletter from "@/components/shared/Newsletter";
import HomeReviews from "@/components/home/HomeReviews";

export default function Home() {
  return (
    <div>
      <HeroSlider />
      <FeaturedProducts />
      <CategoryShowcase />

      <HomeReviews />

      <Newsletter />
    </div>
  );
}