import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/components/cart/CartContext";
import { FavoritesProvider } from "@/components/favorites/FavoritesContext";
import { AdminProvider } from "@/components/admin/AdminContext";
import Header from "@/components/shared/Header";
import CartDrawer from "@/components/cart/CartDrawer";
import Footer from "@/components/shared/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Maison Hannie",
  description: "Luxury home goods and decor",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Maison Hannie",
    description: "Luxury home goods and decor",
    url: "https://maison-hannie.com",
    siteName: "Maison Hannie",
    images: [
      { url: "/opengraph-image", width: 1200, height: 630, alt: "Maison Hannie" },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maison Hannie",
    description: "Luxury home goods and decor",
    images: ["/twitter-image"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminProvider>
          <CartProvider>
            <FavoritesProvider>
              <div className="min-h-screen bg-[#F7F3EC] font-sans">
                <Header />
                <CartDrawer />

                <main>
                  {children}
                </main>

                <Footer />
              </div>
            </FavoritesProvider>
          </CartProvider>
        </AdminProvider>
      </body>
    </html>
  );
}