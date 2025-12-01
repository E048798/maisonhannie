import Link from "next/link";
import { Heart, MessageCircle, Eye, ThumbsUp } from "lucide-react";

type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  author?: string;
  likes?: number;
  hearts?: number;
  views?: number;
  comments?: { id: number; name: string; comment: string; date: string }[];
};

export default function BlogCard({ post }: { post: BlogPost }) {
  const commentCount = post.comments?.length ?? 0;

  return (
    <Link
      href={`/blog/post?id=${post.id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-[#D4AF37] text-white text-xs font-medium rounded-full">
            {post.category}
          </span>
        </div>
      </div>

      <div className="p-6">
        <p className="text-xs text-black/50 mb-2">
          {post.date} · By {post.author ?? "Maison Hannie"}
        </p>
        <h3 className="text-xl font-semibold text-black mb-3 line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
          {post.title}
        </h3>
        <p className="text-black/70 text-sm line-clamp-2 mb-4">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-4 text-sm text-black/50">
          <div className="flex items-center gap-1">
            <ThumbsUp className="w-4 h-4" />
            <span>{post.likes ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{post.hearts ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{post.views ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{commentCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}