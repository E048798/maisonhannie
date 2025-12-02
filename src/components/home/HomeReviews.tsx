"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import ReviewCard from "@/components/shared/ReviewCard";
import { Shimmer } from "@/components/ui/Shimmer";

type Review = { id: string; name: string; rating: number; comment: string; created_at: string };

export default function HomeReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    supabase
      .from("reviews")
      .select("id, name, rating, comment, created_at")
      .order("created_at", { ascending: false })
      .limit(9)
      .then(({ data }) => {
        setReviews((data as any) || []);
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-black mb-4">Latest Reviews</h2>
          <p className="text-black/70">Real feedback from our products across all collections</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-4">
                  <Shimmer className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Shimmer className="h-4 w-32 rounded" />
                    <Shimmer className="h-3 w-24 rounded" />
                  </div>
                </div>
                <Shimmer className="h-3 w-full rounded" />
                <Shimmer className="h-3 w-5/6 rounded" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-black/60">No reviews yet</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={{ id: r.id as any, name: r.name, rating: r.rating, comment: r.comment, date: new Date(r.created_at).toLocaleDateString(), verified: true }} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}