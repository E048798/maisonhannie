'use client';
import { useState } from 'react';
import Link from 'next/link';
import { blogPosts } from '@/components/data/dummyData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Shimmer } from '@/components/ui/Shimmer';
import { ArrowLeft, ThumbsUp, Heart, PartyPopper, Eye, MessageCircle, Send, User, Share2, Facebook, Twitter, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Comment = { id: number; name: string; comment: string; date: string };
type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  author?: string;
  views?: number;
  likes?: number;
  hearts?: number;
  claps?: number;
  comments?: Comment[];
};

export default function BlogPost() {
  const initialPost: BlogPost | null = (() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const postIdParam = params.get('id');
    const postId = postIdParam ? Number(postIdParam) : NaN;
    const foundPost = blogPosts.find((p) => p.id === postId);
    return foundPost || null;
  })();
  const [post, setPost] = useState<BlogPost | null>(initialPost);
  const [reactions, setReactions] = useState({ likes: initialPost?.likes ?? 0, hearts: initialPost?.hearts ?? 0, claps: initialPost?.claps ?? 0 });
  const [userReactions, setUserReactions] = useState({ likes: false, hearts: false, claps: false });
  const [comments, setComments] = useState<Comment[]>(initialPost?.comments ?? []);
  const [newComment, setNewComment] = useState({ name: '', comment: '' });
  const [commentLoading, setCommentLoading] = useState(false);
  

  function handleReaction(type: 'likes' | 'hearts' | 'claps') {
    setUserReactions((prev) => ({ ...prev, [type]: !prev[type] }));
    setReactions((prev) => ({ ...prev, [type]: prev[type] + (userReactions[type] ? -1 : 1) }));
  }

  function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (newComment.name && newComment.comment) {
      setCommentLoading(true);
      setComments((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: newComment.name,
          comment: newComment.comment,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        },
      ]);
      setNewComment({ name: '', comment: '' });
      setCommentLoading(false);
    }
  }

  

  if (!post) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-[#F7F3EC] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-black mb-4">Post not found</h1>
          <Link href="/blog">
            <Button className="bg-[#D4AF37] hover:bg-[#C4A030] text-white rounded-full">Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-[#F7F3EC]">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/blog" className="inline-flex items-center gap-2 text-black/70 hover:text-[#D4AF37] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        <div className="relative h-[400px] rounded-3xl overflow-hidden mb-8">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute top-6 left-6">
            <span className="px-4 py-2 bg-[#D4AF37] text-white font-medium rounded-full">{post.category}</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-serif text-black mb-4">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-black/60 mb-8 pb-8 border-b border-[#D4AF37]/20">
          <span>{post.date}</span>
          <span>·</span>
          <span>By {post.author ?? 'Maison Hannie'}</span>
          <span>·</span>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{post.views ?? 0} views</span>
          </div>
        </div>

        <div className="prose prose-lg max-w-none text-black/80 mb-12">
          <p className="lead text-xl">{post.excerpt}</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
            enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-12">
          <p className="text-sm text-black/60 mb-4">Did you enjoy this article?</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleReaction('likes')}
              className={cn(
                'flex items-center gap-2 px-5 py-3 rounded-full border-2 transition-all',
                userReactions.likes ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-[#D4AF37]/20 text-black/70 hover:border-blue-200'
              )}
            >
              <ThumbsUp className={cn('w-5 h-5', userReactions.likes && 'fill-blue-500')} />
              <span className="font-medium">{reactions.likes}</span>
            </button>

            <button
              onClick={() => handleReaction('hearts')}
              className={cn(
                'flex items-center gap-2 px-5 py-3 rounded-full border-2 transition-all',
                userReactions.hearts ? 'bg-pink-50 border-pink-200 text-pink-600' : 'border-[#D4AF37]/20 text-black/70 hover:border-pink-200'
              )}
            >
              <Heart className={cn('w-5 h-5', userReactions.hearts && 'fill-pink-500')} />
              <span className="font-medium">{reactions.hearts}</span>
            </button>

            <button
              onClick={() => handleReaction('claps')}
              className={cn(
                'flex items-center gap-2 px-5 py-3 rounded-full border-2 transition-all',
                userReactions.claps ? 'bg-amber-50 border-amber-200 text-amber-600' : 'border-[#D4AF37]/20 text-black/70 hover:border-amber-200'
              )}
            >
              <PartyPopper className={cn('w-5 h-5', userReactions.claps && 'fill-amber-500')} />
              <span className="font-medium">{reactions.claps}</span>
            </button>

            <div className="ml-auto flex gap-2">
              <button className="p-3 rounded-full border-2 border-[#D4AF37]/20 text-black/70 hover:bg-[#D4AF37]/10 transition-colors">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-full border-2 border-[#D4AF37]/20 text-black/70 hover:bg-[#D4AF37]/10 transition-colors">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-full border-2 border-[#D4AF37]/20 text-black/70 hover:bg-[#D4AF37]/10 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-black mb-6 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#D4AF37]" /> Comments ({comments.length})
          </h3>

          <form onSubmit={handleAddComment} className="mb-8 p-6 bg-[#F7F3EC] rounded-xl">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <Input
                placeholder="Your name"
                value={newComment.name}
                onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                className="bg-white border-[#D4AF37]/20"
                required
              />
              <div />
            </div>
            <Textarea
              placeholder="Write a comment..."
              value={newComment.comment}
              onChange={(e) => setNewComment({ ...newComment, comment: e.target.value })}
              className="bg-white border-[#D4AF37]/20 mb-4 min-h-[100px]"
              required
            />
            <Button type="submit" disabled={commentLoading} className="bg-[#D4AF37] hover:bg-[#C4A030] text-white rounded-full">
              {commentLoading ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" /> Posting...</>) : (<><Send className="w-4 h-4 mr-2" /> Post Comment</>)}
            </Button>
          </form>

          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-center text-black/50 py-8">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#E5DCC5] flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-black">{comment.name}</span>
                      <span className="text-xs text-black/50">{comment.date}</span>
                    </div>
                    <p className="text-black/70">{comment.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}