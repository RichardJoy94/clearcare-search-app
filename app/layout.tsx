import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import Navigation from "./components/Navigation/Navigation";
import { AuthProvider } from "@/lib/AuthContext";
import { SearchLimitProvider } from "@/contexts/SearchLimitContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

const GA_MEASUREMENT_ID = 'G-YTQPP7RV81';

export const metadata: Metadata = {
  title: "Healthcare Price Transparency",
  description: "Search and compare healthcare service prices",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SearchLimitProvider>
            <Navigation />
            {children}
          </SearchLimitProvider>
        </AuthProvider>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
