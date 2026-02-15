import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "GlobalCampus | AI-Powered Learning Platform",
    template: "%s | GlobalCampus",
  },
  description:
    "Access study materials, notes, question papers, and educational videos. Buy and sell books in the marketplace. The ultimate platform for students.",
  keywords: [
    "GlobalCampus",
    "Study Materials",
    "Notes",
    "Question Papers",
    "Education",
    "Learning Platform",
    "Marketplace",
    "Videos",
  ],
  openGraph: {
    title: "GlobalCampus | The Future of Education",
    description: "AI-Powered Learning Platform for the Next Generation.",
    url: "https://globlecampus.com",
    siteName: "GlobalCampus",
    type: "website",
  },
};

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Background from "./components/Background";
import ClientExtras from "./components/ClientExtras";
import GoogleAnalytics from "../components/GoogleAnalytics";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <GoogleAnalytics />
        <Background />
        <ClientExtras />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
