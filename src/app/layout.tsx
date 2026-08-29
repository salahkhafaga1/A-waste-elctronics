import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "تدوير المخلفات الإلكترونية | E-Waste Egypt",
  description: "المنصة الرقمية الرائدة في مصر لجمع وإعادة تدوير المخلفات الإلكترونية واستبدالها بنقاط ومكافآت قيّمة.",
  keywords: ["تدوير إلكترونيات", "مخلفات إلكترونية", "إعادة تدوير مصر", "e-waste egypt", "recycling cairo"],
  authors: [{ name: "E-Waste Egypt Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          socialButtonsVariant: "blockButton",
          logoPlacement: "inside",
        },
        variables: {
          colorPrimary: "#059669",
          colorText: "#0f172a",
          colorBackground: "#ffffff",
          fontFamily: "var(--font-cairo), sans-serif",
          borderRadius: "0.5rem",
        },
      }}
    >
      <html lang="ar" dir="rtl" className={cairo.variable}>
        <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-emerald-500 selection:text-white">
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
