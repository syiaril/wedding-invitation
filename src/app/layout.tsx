import type { Metadata } from "next";
import "./globals.css";

const OG_IMAGE_URL = "https://phzbfeoxgwqfmulacpzn.supabase.co/storage/v1/object/public/wedding-assets/images/og-cover.jpg";
const FAVICON_URL = "https://phzbfeoxgwqfmulacpzn.supabase.co/storage/v1/object/public/wedding-assets/images/favicon.ico";

export const metadata: Metadata = {
  metadataBase: new URL("https://wedding.mhmdsyiaril.my.id"),
  title: "The Wedding of Asmunandar & Salasatin | 18 Oktober 2026",
  description:
    "Kami mengundang Anda untuk merayakan momen bahagia pernikahan Asmunandar & Salasatin. 18 Oktober 2026.",
  openGraph: {
    title: "The Wedding of Asmunandar & Salasatin",
    description:
      "Kami mengundang Anda untuk merayakan momen bahagia pernikahan Asmunandar & Salasatin.",
    type: "website",
    images: [OG_IMAGE_URL],
  },
  icons: {
    icon: FAVICON_URL,
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
