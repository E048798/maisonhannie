"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { getSupabase } from "@/lib/supabaseClient";
import { Shimmer } from "@/components/ui/Shimmer";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [contact, setContact] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    supabase
      .from("contact_info")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        setContact((data && data[0]) || null);
        setLoading(false);
      });
  }, []);

  return (
    <footer className="bg-black text-white/90">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-serif text-white mb-2">Maison Hannie</h3>
            <p className="text-[#D4AF37] text-sm font-medium mb-4">Handcrafted Beauty</p>
            <p className="text-white/60 text-sm leading-relaxed">Creating unique, handcrafted pieces that bring beauty and elegance to your everyday life.</p>
            <div className="flex gap-4 mt-6">
              {loading ? (
                <>
                  <Shimmer className="w-10 h-10 rounded-full" />
                  <Shimmer className="w-10 h-10 rounded-full" />
                  <Shimmer className="w-10 h-10 rounded-full" />
                </>
              ) : (
                <>
                  {contact?.instagram_url && (
                    <a href={contact.instagram_url} className="p-2 bg-white/10 rounded-full hover:bg-[#D4AF37] transition-colors" aria-label="Instagram">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {contact?.facebook_url && (
                    <a href={contact.facebook_url} className="p-2 bg-white/10 rounded-full hover:bg-[#D4AF37] transition-colors" aria-label="Facebook">
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {contact?.twitter_url && (
                    <a href={contact.twitter_url} className="p-2 bg-white/10 rounded-full hover:bg-[#D4AF37] transition-colors" aria-label="Twitter">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                </>
              )}
            </div>
          </div>

          <div>
          <h4 className="font-semibold text-white mb-6">Quick Links</h4>
          <ul className="space-y-3">
            <li><Link href="/resin" className="text-white/60 hover:text-[#D4AF37] transition-colors text-sm">Resin Works</Link></li>
            <li><Link href="/beads" className="text-white/60 hover:text-[#D4AF37] transition-colors text-sm">Bead Works</Link></li>
            <li><Link href="/catering" className="text-white/60 hover:text-[#D4AF37] transition-colors text-sm">Catering</Link></li>
            <li><Link href="/tailor" className="text-white/60 hover:text-[#D4AF37] transition-colors text-sm">Tailor Works</Link></li>
            <li><Link href="/shop" className="text-white/60 hover:text-[#D4AF37] transition-colors text-sm">Shop All</Link></li>
          </ul>
        </div>

          <div>
            <h4 className="font-semibold text-white mb-6">Help</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-white/60 hover:text-[#D4AF37] transition-colors text-sm">About Us</Link></li>
              <li><Link href="/contact" className="text-white/60 hover:text-[#D4AF37] transition-colors text-sm">Contact</Link></li>
              <li><Link href="/track-order" className="text-white/60 hover:text-[#D4AF37] transition-colors text-sm">Track Order</Link></li>
              <li><Link href="/blog" className="text-white/60 hover:text-[#D4AF37] transition-colors text-sm">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6">Contact Us</h4>
            <ul className="space-y-4">
              {loading ? (
                <>
                  <div className="space-y-2">
                    <Shimmer className="h-4 w-64 rounded" />
                    <Shimmer className="h-4 w-48 rounded" />
                  </div>
                  <Shimmer className="h-4 w-40 rounded" />
                  <Shimmer className="h-4 w-56 rounded" />
                </>
              ) : (
                <>
                  <li className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                    <span className="text-white/60 text-sm" dangerouslySetInnerHTML={{ __html: (contact?.address || "").replace(/\n/g, "<br />") }} />
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                    <span className="text-white/60 text-sm">{contact?.phone || ""}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                    <span className="text-white/60 text-sm">{contact?.email || ""}</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">© {currentYear} Maison Hannie. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-white/40 hover:text-white/60 text-sm transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-white/40 hover:text-white/60 text-sm transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}