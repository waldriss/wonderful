import type { Metadata } from "next";
import { Fredoka, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/home/Navbar";
import CartDrawer from "@/components/shop/CartDrawer";
import { Providers } from "@/components/providers";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["300","400", "500", "600", "700",],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Wonderful",
    template: "%s | Wonderful",
  },
  description: "Wonderful, plateforme de commande healthy food et dashboard client/admin.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${fredoka.variable} ${geistMono.variable}  antialiased`}
      >
        <Providers>
          {/* Navbar without NavSpacer - the navbar will occupy space naturally when in relative position */}
          <div className="pt-10 w-full absolute"> {/* Add padding to the top to give some space */}
            <Navbar />
          </div>
          {children}
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
