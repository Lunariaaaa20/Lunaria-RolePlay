import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lunaria-role-play.vercel.app"),
  title: {
    default: "Lunaria",
    template: "%s | Lunaria",
  },
  description:
    "Premium fantasy roleplay guild management web app for Lunaria.",
  applicationName: "Lunaria",
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "/icons/lunaria-icon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icons/lunaria-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/lunaria-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/lunaria-icon-180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: "/icons/lunaria-icon-32.png",
  },
  appleWebApp: {
    capable: true,
    title: "Lunaria",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#060816",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
