import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { UMAMI_SRC, UMAMI_WEBSITE_ID } from '@/lib/analytics';

export const metadata: Metadata = {
  title: { default: 'Study Notes — MDU BCA', template: '%s | Study Notes' },
  description: 'BCA Semester I study notes — Mathematics, Problem Solving, Computer Architecture, and more.',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Study Notes',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* KaTeX CSS — needed for math rendering */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          crossOrigin="anonymous"
        />
        {/* Inline theme init — prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const t = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            document.documentElement.setAttribute('data-theme', t);
          } catch(e) {}
        `}} />
      </head>
      <body>
        {children}
        {/* Umami analytics — deferred, no cookies, GDPR-ok */}
        {UMAMI_WEBSITE_ID && (
          <Script
            src={UMAMI_SRC}
            data-website-id={UMAMI_WEBSITE_ID}
            strategy="lazyOnload"
            defer
          />
        )}
      </body>
    </html>
  );
}
