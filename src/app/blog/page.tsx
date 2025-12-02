'use client';
import { useState, useEffect } from "react";
import BlogCard from "@/components/blog/BlogCard";
import { BlogCardSkeleton } from "@/components/ui/Shimmer";
import { getSupabase } from "@/lib/supabaseClient";
import Newsletter from "@/components/shared/Newsletter";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Blog() {
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [posts, setPosts] = useState<any[]>([]);

  const categories = ["all", "Behind the Scenes", "Trends", "Recipes", "Sustainability"] as const;

  const filteredPosts = activeCategory === "all" ? posts : posts.filter((p) => p.category === activeCategory);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.from('site_settings').select('show_blog').limit(1).then(({ data }) => {
      const s = (data && data[0]) || null;
      setBlocked(!(s?.show_blog ?? true));
      setSettingsLoaded(true);
    });
    supabase.from("blog_posts").select("*").then(({ data }) => {
      setPosts(data || []);
      setIsLoading(false);
    });
  }, []);

  if (settingsLoaded && blocked) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-[#F7F3EC] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-black mb-4">404 — Page Not Found</h1>
          <p className="text-black/60 mb-6">This page is currently unavailable.</p>
          <a href="/" className="inline-block px-6 py-3 rounded-full bg-[#D4AF37] text-white">Go Home</a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="relative py-32 bg-black overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#D4AF37] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <BookOpen className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-white/90 text-sm font-medium">Stories & Inspiration</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">
            Our <span className="text-[#D4AF37]">Blog</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">Discover the stories behind our craft, trends, recipes, and more</p>
        </div>
      </section>

      <section className="py-20 bg-[#F7F3EC]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center gap-2 mb-12 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "rounded-full",
                  activeCategory === category ? "bg-[#D4AF37] hover:bg-[#C4A030] text-white" : "border-[#D4AF37]/30 text-black hover:bg-[#D4AF37]/10"
                )}
              >
                {category === "all" ? "All Posts" : category}
              </Button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading
              ? Array(6)
                  .fill(0)
                  .map((_, i) => <BlogCardSkeleton key={i} />)
              : filteredPosts.map((post) => <BlogCard key={post.id} post={post} />)}
          </div>

          {filteredPosts.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <p className="text-black/60 text-lg">No posts found in this category</p>
            </div>
          )}
        </div>
      </section>

      <Newsletter />
    </div>
  );
}