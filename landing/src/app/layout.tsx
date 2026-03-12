import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CommanDeck — Unified Command Center for Engineers",
  description:
    "One dashboard for tickets, PRs, AI sessions, and team updates. Stop context switching. Start shipping.",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
  openGraph: {
    title: "CommanDeck",
    description: "Unified command center for engineering work",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
