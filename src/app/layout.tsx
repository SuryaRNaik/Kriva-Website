import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";

export const metadata: Metadata = {
  title: "Kriva Studio – Handmade Tanjore & Fabric Art by Ruchitha Reddy",
  description:
    "Kriva Studio by Ruchitha Reddy — premium handmade Tanjore paintings and traditional fabric art. Each piece is uniquely crafted using authentic techniques. Shop original artworks or join our workshops.",
  keywords:
    "Kriva Studio, Ruchitha Reddy, Tanjore painting, fabric art, handmade art, Indian art, custom paintings, art workshops, Chennai art studio",
  openGraph: {
    title: "Kriva Studio – Handmade Tanjore & Fabric Art",
    description:
      "Premium handmade Tanjore paintings and fabric art by Ruchitha Reddy. Authentic Indian craft with a contemporary touch.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Inter:wght@300;400;500;600;700&family=Dancing+Script:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
