import type { Metadata } from "next";
// Using Inter for supreme readability and neutrality (standard for gov/official sites)
import { Inter } from "next/font/google"; 
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-geist-sans", // Keeping variable name for compatibility
  display: "swap"
});

export const metadata: Metadata = {
  title: "Nepal Loto 6 - Official National Lottery",
  description: "The official, government-approved online lottery system of Nepal. Secure, transparent, and verified.",
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
