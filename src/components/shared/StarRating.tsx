"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  rating?: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg" | "xl";
  interactive?: boolean;
  onChange?: (value: number) => void;
  showCount?: boolean;
  count?: number;
};

export default function StarRating({ rating = 0, maxRating = 5, size = "md", interactive = false, onChange, showCount = false, count = 0 }: Props) {
  const [hoverRating, setHoverRating] = useState(0);
  const sizes: Record<NonNullable<Props["size"]>, string> = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5", xl: "w-8 h-8" };

  function handleClick(index: number) {
    if (interactive && onChange) onChange(index + 1);
  }

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, index) => {
        const filled = interactive ? index < (hoverRating || rating) : index < rating;
        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(index)}
            onMouseEnter={() => interactive && setHoverRating(index + 1)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={cn("transition-transform", interactive && "hover:scale-125 cursor-pointer", !interactive && "cursor-default")}
          >
            <Star className={cn(sizes[size], "transition-colors", filled ? "fill-[#D4AF37] text-[#D4AF37]" : "text-gray-200")} />
          </button>
        );
      })}
      {showCount && <span className="text-sm text-black/60 ml-1">({count})</span>}
    </div>
  );
}