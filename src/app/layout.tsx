import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Wedding of Nandar & Salsa | 18 Oktober 2026",
  description:
    "Kami mengundang Anda untuk merayakan momen bahagia pernikahan Nandar & Salsa. 18 Oktober 2026.",
  openGraph: {
    title: "The Wedding of Nandar & Salsa",
    description:
      "Kami mengundang Anda untuk merayakan momen bahagia pernikahan Nandar & Salsa.",
    type: "website",
    images: ["/images/og-cover.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
