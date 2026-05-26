import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RL Policy Playground",
  description:
    "Interactive visualization of reinforcement learning agents navigating grid worlds. Watch Q-learning, SARSA, and Monte Carlo algorithms learn in real-time with value function heatmaps and policy arrows.",
  keywords: [
    "reinforcement learning",
    "Q-learning",
    "SARSA",
    "Monte Carlo",
    "value function",
    "policy visualization",
    "grid world",
    "machine learning",
    "interactive",
    "educational",
  ],
  authors: [{ name: "Bellam Policy Lab" }],
  openGraph: {
    title: "RL Policy Playground",
    description:
      "Watch reinforcement learning agents learn to navigate grid worlds in real-time",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "RL Policy Playground",
    description:
      "Interactive visualization of RL agents with real-time value function heatmaps",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0c0e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%230b0c0e' width='100' height='100' rx='15'/><rect fill='%234fb3a9' x='15' y='15' width='30' height='30' rx='5'/><rect fill='%23d87b3c' x='55' y='55' width='30' height='30' rx='5'/><path d='M45 30 L55 30 L55 45 L70 45 L70 55 L55 55' stroke='%23e8e9eb' stroke-width='4' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
