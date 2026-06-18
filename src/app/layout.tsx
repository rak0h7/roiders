import type { Metadata } from "next";
import { DM_Sans, Geist_Mono, Inter, Orbitron, Syne } from "next/font/google";
import { getSiteUrl } from "@/lib/siteUrl";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { SiteConfigProvider } from "@/context/SiteConfigContext";
import { NavigationProvider } from "@/context/NavigationContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { ToastProvider } from "@/context/ToastContext";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Roiders Club — Labs, Gear, Training & Nutrition",
  description:
    "Private performance health platform. Track bloodwork, gear, training, and nutrition in one command center with cross-module intelligence.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Roiders Club" },
  openGraph: {
    title: "Roiders Club — Your health command center",
    description:
      "Labs, gear, training, and nutrition trackers in one place. Private access-key auth, optional cloud sync.",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-show-ambient-bg="true" data-content-width="default" className={`${dmSans.variable} ${syne.variable} ${geistMono.variable} ${inter.variable} ${orbitron.variable} h-full`}>
      <body className="min-h-full antialiased">
        <SiteConfigProvider>
          <AuthProvider>
            <SettingsProvider>
              <ToastProvider>
                <NavigationProvider>
                  <AppProvider>{children}</AppProvider>
                </NavigationProvider>
              </ToastProvider>
            </SettingsProvider>
          </AuthProvider>
        </SiteConfigProvider>
      </body>
    </html>
  );
}