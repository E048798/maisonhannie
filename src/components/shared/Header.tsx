"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/CartContext";
import { Menu, X, ShoppingBag, Search, User, Heart, ChevronDown } from "lucide-react";
import FavoritesModal from "@/components/favorites/FavoritesModal";
import { useFavorites } from "@/components/favorites/FavoritesContext";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { Shimmer } from "@/components/ui/Shimmer";

const pagesWithLightHeader = ["/admin", "/blog/post"];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isServicesMobileOpen, setIsServicesMobileOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();
  const { favorites } = useFavorites();
  const servicesRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const searchTimer = useRef<any>(null);
  const [siteSettings, setSiteSettings] = useState<{ show_shop: boolean; show_blog: boolean; show_resin: boolean; show_beads: boolean; show_catering: boolean; show_tailor: boolean }>({ show_shop: true, show_blog: true, show_resin: true, show_beads: true, show_catering: true, show_tailor: true });

  const needsSolidHeader = pagesWithLightHeader.some((p) => pathname.startsWith(p));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setIsServicesOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('show_shop, show_blog, show_resin, show_beads, show_catering, show_tailor')
      .limit(1)
      .then(({ data }) => {
        const s = (data && data[0]) || null;
        if (s) setSiteSettings({
          show_shop: s.show_shop ?? true,
          show_blog: s.show_blog ?? true,
          show_resin: s.show_resin ?? true,
          show_beads: s.show_beads ?? true,
          show_catering: s.show_catering ?? true,
          show_tailor: s.show_tailor ?? true,
        });
      });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setIsServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (isSearchOpen && searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isSearchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    searchTimer.current = setTimeout(() => {
      supabase
        .from("products")
        .select("*")
        .ilike("name", `%${searchQuery}%`)
        .limit(12)
        .then(({ data }) => {
          setSearchResults(data || []);
          setSearchLoading(false);
        });
    }, 300);
  }, [searchQuery]);

  const navLinks = [
    ...(siteSettings.show_shop ? [{ name: "Shop", href: "/shop" }] : []),
    { name: "About", href: "/about" },
    ...(siteSettings.show_blog ? [{ name: "Blog", href: "/blog" }] : []),
    { name: "Contact", href: "/contact" },
    { name: "Track Order", href: "/track-order" },
  ];
  const serviceLinks = [
    ...(siteSettings.show_tailor ? [{ name: "Tailor Works", href: "/tailor" }] : []),
    ...(siteSettings.show_resin ? [{ name: "Resin Works", href: "/resin" }] : []),
    ...(siteSettings.show_beads ? [{ name: "Bead Works", href: "/beads" }] : []),
    ...(siteSettings.show_catering ? [{ name: "Catering", href: "/catering" }] : []),
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled || needsSolidHeader ? "bg-white/95 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex flex-col">
              <span
                className={cn(
                  "text-2xl font-serif transition-colors",
                  isScrolled || needsSolidHeader ? "text-black" : "text-white"
                )}
              >
                Maison Hannie
              </span>
              <span
                className={cn(
                  "text-xs tracking-widest uppercase transition-colors",
                  isScrolled || needsSolidHeader ? "text-[#D4AF37]" : "text-white/80"
                )}
              >
                Handcrafted Beauty
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              <Link
                href="/"
                className={cn(
                  "text-sm font-medium transition-colors relative group",
                  isScrolled || needsSolidHeader ? "text-black hover:text-[#D4AF37]" : "text-white/90 hover:text-white"
                )}
              >
                Home
                <span className="absolute -bottom-1 left-0 h-0.5 bg-[#D4AF37] transition-all w-0 group-hover:w-full" />
              </Link>
              <div className="relative" ref={servicesRef}>
                <button
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className={cn(
                    "text-sm font-medium transition-colors flex items-center gap-1",
                    isScrolled || needsSolidHeader ? "text-black hover:text-[#D4AF37]" : "text-white/90 hover:text-white"
                  )}
                >
                  Services <ChevronDown className="w-4 h-4" />
                </button>
                {isServicesOpen && (
                  <div className="absolute mt-2 w-56 bg-white rounded-xl shadow-lg border p-2">
                    {serviceLinks.map((s) => (
                      <Link key={s.href} href={s.href} onClick={() => setIsServicesOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-black hover:bg-[#E5DCC5]">
                        {s.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors relative group",
                    isScrolled || needsSolidHeader
                      ? isActive(link.href)
                        ? "text-[#D4AF37]"
                        : "text-black hover:text-[#D4AF37]"
                      : isActive(link.href)
                      ? "text-[#D4AF37]"
                      : "text-white/90 hover:text-white"
                  )}
                >
                  {link.name}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-0.5 bg-[#D4AF37] transition-all",
                      isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                    )}
                  />
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn(
                  "p-2.5 rounded-full transition-colors",
                  isScrolled || needsSolidHeader ? "text-black hover:bg-[#E5DCC5]" : "text-white hover:bg-white/20"
                )}
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className={cn(
                  "p-2.5 rounded-full transition-colors relative",
                  isScrolled || needsSolidHeader ? "text-black hover:bg-[#E5DCC5]" : "text-white hover:bg-white/20"
                )}
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsFavoritesOpen(true)}
                className={cn(
                  "p-2.5 rounded-full transition-colors relative",
                  isScrolled || needsSolidHeader ? "text-black hover:bg-[#E5DCC5]" : "text-white hover:bg-white/20"
                )}
              >
                <Heart className="w-5 h-5" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>

              <Link
                href="/admin"
                className={cn(
                  "p-2.5 rounded-full transition-colors hidden md:flex",
                  isScrolled || needsSolidHeader ? "text-black hover:bg-[#E5DCC5]" : "text-white hover:bg-white/20"
                )}
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(
                  "p-2.5 rounded-full transition-colors lg:hidden",
                  isScrolled || needsSolidHeader ? "text-black hover:bg-[#E5DCC5]" : "text-white hover:bg-white/20"
                )}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {isSearchOpen && (
        <div className="fixed top-[72px] left-0 right-0 z-40">
          <div className="max-w-7xl mx-auto px-4" ref={searchRef}>
            <div className="bg-white rounded-2xl shadow-xl border">
              <div className="flex items-center gap-3 p-4 border-b">
                <Search className="w-5 h-5 text-black/50" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 h-12 rounded-xl border border-[#D4AF37]/20 px-3 bg-white focus:border-[#D4AF37]"
                />
                <button onClick={() => setIsSearchOpen(false)} className="p-2 rounded-full hover:bg-[#E5DCC5]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                {searchLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-[#F7F3EC] rounded-xl">
                        <Shimmer className="w-14 h-14 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Shimmer className="h-4 w-40 rounded" />
                          <Shimmer className="h-3 w-24 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="text-black/60">Start typing to search products</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F7F3EC]"
                      >
                        <img src={p.image} alt={p.name} className="w-14 h-14 rounded-lg object-cover" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-black line-clamp-1">{p.name}</p>
                          <p className="text-xs text-[#D4AF37]">₦{p.price?.toLocaleString?.() ?? p.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all duration-300",
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <div
          className={cn(
            "absolute top-0 right-0 bottom-0 w-80 bg-white shadow-xl transition-transform duration-300",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-serif text-black">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-[#E5DCC5] text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1">
              <div className="mb-2">
                <button
                  onClick={() => setIsServicesMobileOpen(!isServicesMobileOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-black hover:bg-[#E5DCC5] font-medium"
                >
                  <span>Services</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isServicesMobileOpen && (
                  <div className="mt-1 space-y-1">
                    {serviceLinks.map((s) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-6 py-2 rounded-xl text-black hover:bg-[#E5DCC5]"
                      >
                        {s.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-xl transition-colors font-medium",
                    isActive(link.href) ? "bg-[#E5DCC5] text-[#D4AF37]" : "text-black hover:bg-[#E5DCC5]"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl transition-colors font-medium text-black hover:bg-[#E5DCC5] mt-4 border-t pt-6"
              >
                Admin Panel
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <FavoritesModal isOpen={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} />
    </>
  );
}