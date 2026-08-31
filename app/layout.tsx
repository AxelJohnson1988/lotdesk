import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lotdesk — Minneapolis auction desk",
  description:
    "Scores police, municipal, and GSA lots the way an operator would. Full fee stack. 28% net or pass.",
  openGraph: {
    title: "Lotdesk",
    description: "Minneapolis auction desk. 28% net or pass.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;600;700&family=Special+Elite&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
