import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://gsf.goa.paruluniversity.ac.in'),
  title: 'Goa Startup Festival 2026 | Parul University',
  description:
    'Join the biggest startup movement at Parul University Goa Campus. Pitch your idea, attend masterclasses, and explore the startup ecosystem.',
  keywords: ['Startup Festival', 'Parul University', 'Goa', 'Entrepreneurship', 'Startups', 'Tech Event', 'Networking'],
  authors: [{ name: 'Parul University' }],
  creator: 'Parul University',
  openGraph: {
    title: 'Goa Startup Festival 2026',
    description: 'Join the biggest startup movement at Parul University Goa Campus.',
    url: 'https://gsf.goa.paruluniversity.ac.in',
    siteName: 'Goa Startup Festival 2026',
    images: [
      {
        url: '/hero-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Goa Startup Festival Hero Image',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Goa Startup Festival 2026',
    description: 'Join the biggest startup movement at Parul University Goa Campus.',
    images: ['/hero-image.jpg'],
  },
  icons: {
    icon: '/icon.png',
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
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Inline script to prevent FOUC — sets theme class before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var isDark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
