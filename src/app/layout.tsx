import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Canada Immigration Accompagnement | Plateforme professionnelle",
    template: "%s | Canada Immigration",
  },
  description:
    "Plateforme privée d’accompagnement professionnel pour vos projets d’immigration au Canada. Immigration permanente, permis de travail, études, regroupement familial et plus.",
  keywords: [
    "immigration Canada",
    "accompagnement immigration",
    "permis de travail Canada",
    "études Canada",
    "visa Canada",
    "regroupement familial",
  ],
  openGraph: {
    title: "Canada Immigration Accompagnement",
    description:
      "Accompagnement professionnel et transparent pour votre projet d’immigration au Canada.",
    locale: "fr_FR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
