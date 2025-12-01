"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { allProducts, blogPosts as initialBlogPosts } from "@/components/data/dummyData";

type Settings = {
  showBlog: boolean;
  showShop: boolean;
  showCatering: boolean;
  showResin: boolean;
  showBeads: boolean;
};

type Product = {
  id: number | string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  image: string;
  rating?: number;
  reviews?: number;
  featured?: boolean;
  hidden?: boolean;
  serves?: string;
  originalPrice?: number;
  description?: string;
};

type Comment = { id: number | string; name: string; comment: string; date: string };

type BlogPost = {
  id: number | string;
  title: string;
  excerpt: string;
  image: string;
  author?: string;
  date: string;
  category: string;
  likes?: number;
  hearts?: number;
  claps?: number;
  views?: number;
  comments?: Comment[];
  hidden?: boolean;
};

type AdminContextValue = {
  settings: Settings;
  updateSettings: (key: keyof Settings, value: boolean) => void;
  products: Product[];
  addProduct: (product: Omit<Product, "id" | "rating" | "reviews">) => Product;
  updateProduct: (id: Product["id"], data: Partial<Product>) => void;
  deleteProduct: (id: Product["id"]) => void;
  toggleProductVisibility: (id: Product["id"]) => void;
  toggleProductFeatured: (id: Product["id"]) => void;
  blogPosts: BlogPost[];
  addBlogPost: (post: Omit<BlogPost, "id" | "likes" | "hearts" | "claps" | "views" | "comments">) => BlogPost;
  updateBlogPost: (id: BlogPost["id"], data: Partial<BlogPost>) => void;
  deleteBlogPost: (id: BlogPost["id"]) => void;
  toggleBlogVisibility: (id: BlogPost["id"]) => void;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    showBlog: true,
    showShop: true,
    showCatering: true,
    showResin: true,
    showBeads: true,
  });

  const [products, setProducts] = useState<Product[]>(allProducts as Product[]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts as BlogPost[]);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("maisonhannie_admin_settings");
      const savedProducts = localStorage.getItem("maisonhannie_admin_products");
      const savedBlogPosts = localStorage.getItem("maisonhannie_admin_blog");

      if (savedSettings) setSettings(JSON.parse(savedSettings));
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      if (savedBlogPosts) setBlogPosts(JSON.parse(savedBlogPosts));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("maisonhannie_admin_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("maisonhannie_admin_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("maisonhannie_admin_blog", JSON.stringify(blogPosts));
  }, [blogPosts]);

  function updateSettings(key: keyof Settings, value: boolean) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function addProduct(product: Omit<Product, "id" | "rating" | "reviews">): Product {
    const newProduct: Product = {
      ...product,
      id: `p${Date.now()}`,
      rating: 0,
      reviews: 0,
    };
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  }

  function updateProduct(id: Product["id"], data: Partial<Product>) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }

  function deleteProduct(id: Product["id"]) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function toggleProductVisibility(id: Product["id"]) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, hidden: !p.hidden } : p)));
  }

  function toggleProductFeatured(id: Product["id"]) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p)));
  }

  function addBlogPost(post: Omit<BlogPost, "id" | "likes" | "hearts" | "claps" | "views" | "comments">): BlogPost {
    const newPost: BlogPost = {
      ...post,
      id: `blog${Date.now()}`,
      likes: 0,
      hearts: 0,
      claps: 0,
      views: 0,
      comments: [],
    };
    setBlogPosts((prev) => [...prev, newPost]);
    return newPost;
  }

  function updateBlogPost(id: BlogPost["id"], data: Partial<BlogPost>) {
    setBlogPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }

  function deleteBlogPost(id: BlogPost["id"]) {
    setBlogPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function toggleBlogVisibility(id: BlogPost["id"]) {
    setBlogPosts((prev) => prev.map((p) => (p.id === id ? { ...p, hidden: !p.hidden } : p)));
  }

  return (
    <AdminContext.Provider
      value={{
        settings,
        updateSettings,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductVisibility,
        toggleProductFeatured,
        blogPosts,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        toggleBlogVisibility,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}