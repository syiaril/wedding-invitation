import type { Metadata } from "next";
import { Playfair_Display, Great_Vibes, Lato } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
  display: "swap",
});

const lato = Lato({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-lato",
  display: "swap",
});

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
    <html
      lang="id"
      className={`h-full antialiased ${playfairDisplay.variable} ${greatVibes.variable} ${lato.variable}`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
