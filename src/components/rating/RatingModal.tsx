"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/shared/StarRating";
import { Send, CheckCircle } from "lucide-react";

export default function RatingModal({ isOpen, onClose, product }: { isOpen: boolean; onClose: () => void; product: any }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating > 0) {
      setSubmitted(true);
    }
  }

  function handleClose() {
    setSubmitted(false);
    setRating(0);
    setComment("");
    onClose();
  }

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full sm:max-w-md bg-[#F7F3EC] rounded-2xl shadow-lg p-6">
          <div className="mb-4">
            <h2 className="text-black font-serif text-xl">{submitted ? "Thank You!" : "Rate This Product"}</h2>
          </div>

          {submitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-black mb-2">Review Submitted!</h3>
              <p className="text-black/60 text-sm mb-6">Thank you for sharing your feedback. Your review helps others make informed decisions.</p>
              <Button onClick={handleClose} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white rounded-full">Close</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl">
                <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <h4 className="font-medium text-black">{product.name}</h4>
                  <p className="text-sm text-[#D4AF37]">{product.category}</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-black/70 mb-3">How would you rate this product?</p>
                <div className="flex justify-center">
                  <StarRating rating={rating} size="xl" interactive onChange={setRating} />
                </div>
                {rating > 0 && (
                  <p className="text-sm text-[#D4AF37] mt-2">
                    {rating === 5 && "Excellent!"}
                    {rating === 4 && "Great!"}
                    {rating === 3 && "Good"}
                    {rating === 2 && "Fair"}
                    {rating === 1 && "Poor"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-black/70 block mb-2">Share your experience (optional)</label>
                <Textarea placeholder="What did you like or dislike about this product?" value={comment} onChange={(e) => setComment(e.target.value)} className="bg-white border-[#D4AF37]/20 focus:border-[#D4AF37] min-h-[100px]" />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1 rounded-full border-[#D4AF37]/30">Cancel</Button>
                <Button type="submit" disabled={rating === 0} className="flex-1 bg-[#D4AF37] hover:bg-[#C4A030] text-white rounded-full disabled:opacity-50">
                  <Send className="w-4 h-4 mr-2" />
                  Submit Review
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}