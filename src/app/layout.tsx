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
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/lunaria-icon-512.png",
    apple: "/icons/lunaria-icon-180.png",
    shortcut: "/icons/lunaria-icon-32.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lunaria",
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
      <body
        className={`${outfit.className} min-h-screen bg-[#060816] text-white antialiased`}
      >
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
