import type { Metadata } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import SmoothScroll from '@/components/SmoothScroll';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Goa Startup Festival 2026 | Where Ideas Take Flight',
  description:
    'The Goa Startup Festival 2026 — a two-day startup launchpad featuring masterclasses, investor firesides, startup expo, and idea competitions. Sept 2–3, 2026 at Parul University, Goa.',
  keywords: [
    'Goa Startup Festival',
    'startup event',
    'Parul University',
    'entrepreneurship',
    'startup competition',
    'masterclass',
    'investors',
    'Goa',
    '2026',
  ],
  openGraph: {
    title: 'Goa Startup Festival 2026',
    description:
      'More than a festival — it\'s a startup launchpad. Sept 2–3, 2026 at Parul University, Goa.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-body bg-[#060608] text-cloud-white antialiased min-h-screen flex flex-col">
        <SmoothScroll>
          <AuthProvider>
            {children}
          </AuthProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
