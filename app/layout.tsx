import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { PinProvider } from "@/context/PinContext";
import { VaultProvider } from "@/context/VaultContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Keyora — Zero-Knowledge Password Manager",
  description:
    "End-to-end client-side encrypted password manager. Zero-knowledge architecture powered by AES-256-GCM and Firebase cloud storage.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col font-sans antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <PinProvider>
              <VaultProvider>{children}</VaultProvider>
            </PinProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
