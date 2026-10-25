import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ROTK Tracker", template: "%s · ROTK Tracker" },
  description: "Stats, classements et joueurs en direct pour H1Z1 sur Return of the King.",
  openGraph: {
    title: "ROTK Tracker",
    description: "Stats, classements et joueurs en direct pour H1Z1 sur Return of the King.",
    type: "website",
  },
};

const NAV = [
  { href: "/", label: "Live" },
  { href: "/classements", label: "Classements" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Teko:wght@400;500;600&display=swap"
        />
      </head>
      <body className="antialiased">
        <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
            <Link href="/" className="font-display text-2xl leading-none text-bone">
              ROTK<span className="text-blood">.</span>Tracker
            </Link>
            <nav className="flex gap-4 text-sm font-medium text-dust">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-bone">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-xs text-dust">
          Projet de fan, non affilié à ROTK ni à Daybreak Game Company. Données publiques de rotk.app.
        </footer>
      </body>
    </html>
  );
}
