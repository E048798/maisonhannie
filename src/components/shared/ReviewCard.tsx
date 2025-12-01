import StarRating from "./StarRating";
import { User } from "lucide-react";

type Review = {
  id: number;
  name: string;
  rating: number;
  comment: string;
  avatar?: string;
  date?: string;
  verified?: boolean;
};

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-[#E5DCC5] flex items-center justify-center flex-shrink-0">
          {review.avatar ? (
            <img src={review.avatar} alt={review.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-[#D4AF37]" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-black">{review.name}</h4>
            {review.date && <span className="text-xs text-black/50">{review.date}</span>}
          </div>
          <StarRating rating={review.rating} size="sm" />
          <p className="mt-3 text-black/70 text-sm leading-relaxed">{review.comment}</p>
          {review.verified && <span className="inline-flex items-center mt-3 text-xs text-green-600 font-medium">✓ Verified Purchase</span>}
        </div>
      </div>
    </div>
  );
}