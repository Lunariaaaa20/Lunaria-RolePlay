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
  title: "Lunaria Roleplay Guild",
  description: "Premium fantasy roleplay guild management web app for Lunaria.",
  manifest: "/manifest.json",
  applicationName: "Lunaria",
  appleWebApp: {
    capable: true,
    title: "Lunaria",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/images/lunaria-login-bg.png",
    apple: "/images/lunaria-login-bg.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#d7a83f",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
