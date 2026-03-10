import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: {
    default: "Spark Savings — Cost-Saving Opportunities Marketplace",
    template: "%s | Spark Savings",
  },
  description:
    "Discover proven cost-saving strategies from expert contributors. Browse opportunities, unlock playbooks, and reduce business expenses across technology, procurement, energy, and more.",
  keywords: [
    "cost savings",
    "procurement",
    "business expenses",
    "savings marketplace",
    "cost reduction",
    "expense management",
  ],
  openGraph: {
    type: "website",
    siteName: "Spark Savings",
    title: "Spark Savings — Cost-Saving Opportunities Marketplace",
    description:
      "Discover proven cost-saving strategies from expert contributors. Browse opportunities, unlock playbooks, and reduce business expenses.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spark Savings — Cost-Saving Opportunities Marketplace",
    description:
      "Discover proven cost-saving strategies from expert contributors.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || "https://sparksavings.com"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50/60 min-h-screen flex flex-col text-slate-900">
        <Providers>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
            {children}
          </main>
          <Footer />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
