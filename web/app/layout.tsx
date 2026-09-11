import type { Metadata } from 'next';
import Link from 'next/link';
import { IBM_Plex_Sans } from 'next/font/google';
import { ThemeToggle } from '@/components/ThemeToggle';
import './globals.css';

const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3003';

const themeBoot = `(function(){try{if(localStorage.getItem('lm-theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}})()`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Luciano Mocchegiani',
  description: 'Software Engineer',
  openGraph: {
    title: 'Luciano Mocchegiani',
    description: 'Software Engineer',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luciano Mocchegiani',
    description: 'Software Engineer',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={body.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>
        <header className="top">
          <Link href="/" className="topMark">
            LM
          </Link>
          <ThemeToggle />
        </header>
        {children}
      </body>
    </html>
  );
}
