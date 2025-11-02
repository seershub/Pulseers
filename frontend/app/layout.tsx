import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pulseers - Signal Your Team",
  description:
    "Decentralized social signaling platform for football matches. Signal your support on-chain.",
  icons: {
    icon: "/icon-512.png",
  },
  openGraph: {
    title: "Pulseers",
    description: "Signal your support for football teams on-chain",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
