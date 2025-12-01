import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/components/cart/CartContext";
import { AdminProvider } from "@/components/admin/AdminContext";
import Header from "@/components/shared/Header";
import CartDrawer from "@/components/cart/CartDrawer";
import Footer from "@/components/shared/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Maison Hannie",
  description: "Luxury home goods and decor",
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
            <div className="min-h-screen bg-[#F7F3EC] font-sans">
              <Header />
              <CartDrawer />

              <main>
                {children}
              </main>

              <Footer />
            </div>
          </CartProvider>
        </AdminProvider>
      </body>
    </html>
  );
}