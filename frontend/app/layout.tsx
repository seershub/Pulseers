import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Pulseers - Daily Football Predictions",
  description:
    "Predict daily football match outcomes and compete on the leaderboard. Signal your support for your favorite teams on-chain.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-1024.png", sizes: "1024x1024", type: "image/png" },
    ],
    apple: [{ url: "/icon-1024.png", sizes: "1024x1024", type: "image/png" }],
  },
  openGraph: {
    title: "Pulseers - Football Predictions",
    description: "Predict football matches daily on Base Mainnet and compete for prizes!",
    url: "https://pulseers.seershub.com",
    siteName: "Pulseers",
    images: [
      {
        url: "https://pulseers.seershub.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pulseers - Football Predictions",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulseers - Football Predictions",
    description: "Predict football matches daily on Base Mainnet and compete for prizes!",
    images: ["https://pulseers.seershub.com/og-image.png"],
  },
  other: {
    // Farcaster Mini App embed metadata
    "fc:miniapp": JSON.stringify({
      version: "next",
      imageUrl: "https://pulseers.seershub.com/hero.png",
      button: {
        title: "Launch Pulseers",
        action: {
          type: "launch_miniapp",
          name: "Pulseers",
          url: "https://pulseers.seershub.com",
          splashImageUrl: "https://pulseers.seershub.com/splash.png",
          splashBackgroundColor: "#0052FF"
        }
      }
    }),
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
