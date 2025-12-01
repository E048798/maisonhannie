import Link from "next/link";
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white/90">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-serif text-white mb-2">Maison Hannie</h3>
            <p className="text-[#D4AF37] text-sm font-medium mb-4">Handcrafted Beauty</p>
            <p className="text-white/60 text-sm leading-relaxed">Creating unique, handcrafted pieces that bring beauty and elegance to your everyday life.</p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-[#D4AF37] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-[#D4AF37] transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-[#D4AF37] transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/resin" className="text-white/60 hover:text-[#D4AF37] transition-colors text-sm">Resin Works</Link></li>
              <li><Link href="/beads" className="text-white/60 hover:text-[#D4AF37] transition-colors text-sm">Bead Works</Link></li>
              <li><Link href="/catering" className="text-white/60 hover:text-[#D4AF37] transition-colors text-sm">Catering</Link></li>
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
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <span className="text-white/60 text-sm">123 Artisan Lane<br />Creative District, CD 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span className="text-white/60 text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                <span className="text-white/60 text-sm">hello@maisonhannie.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">© {currentYear} Maison Hannie. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-white/40 hover:text-white/60 text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-white/40 hover:text-white/60 text-sm transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}