import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Pulseers - Signal Your Team",
  description:
    "Decentralized social signaling platform for football matches. Signal your support on-chain.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-512x512.png", sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    title: "Pulseers",
    description: "Signal your support for football teams on-chain",
    url: process.env.NEXT_PUBLIC_URL || "https://pulseers.vercel.app",
    siteName: "Pulseers",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pulseers - Signal Your Team",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulseers",
    description: "Signal your support for football teams on-chain",
    images: ["/og-image.png"],
  },
  other: {
    // Farcaster Mini App metadata
    "fc:miniapp": JSON.stringify({
      version: "next",
      name: "Pulseers",
      description: "Signal your support for football teams on-chain",
      iconUrl: `${process.env.NEXT_PUBLIC_URL || "https://pulseers.vercel.app"}/icon-192x192.png`,
      imageUrl: `${process.env.NEXT_PUBLIC_URL || "https://pulseers.vercel.app"}/og-image.png`,
      splashImageUrl: `${process.env.NEXT_PUBLIC_URL || "https://pulseers.vercel.app"}/splash.png`,
      splashBackgroundColor: "#0052FF",
      button: {
        title: "Signal Your Team",
        action: {
          type: "launch_frame",
          url: process.env.NEXT_PUBLIC_URL || "https://pulseers.vercel.app"
        }
      },
      homeUrl: process.env.NEXT_PUBLIC_URL || "https://pulseers.vercel.app"
    }),
    // Farcaster Frame metadata (fallback)
    "fc:frame": "vNext",
    "fc:frame:image": `${process.env.NEXT_PUBLIC_URL || "https://pulseers.vercel.app"}/og-image.png`,
    "fc:frame:button:1": "Launch App",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": process.env.NEXT_PUBLIC_URL || "https://pulseers.vercel.app",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
