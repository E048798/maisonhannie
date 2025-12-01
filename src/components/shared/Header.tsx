"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/CartContext";
import { Menu, X, ShoppingBag, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

const pagesWithLightHeader = ["/admin", "/blog/post"];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { cartCount, setIsCartOpen } = useCart();

  const needsSolidHeader = pagesWithLightHeader.some((p) => pathname.startsWith(p));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Resin Works", href: "/resin" },
    { name: "Bead Works", href: "/beads" },
    { name: "Catering", href: "/catering" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
    { name: "Track Order", href: "/track-order" },
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
    </>
  );
}