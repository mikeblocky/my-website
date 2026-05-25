import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/ui/theme/theme-provider'
import { cn } from '@/lib/utils/utils'
import Script from 'next/script'
import { monoFont, sansFont, codeFont } from '@/styles/fonts/fonts'
import { PageTransition } from '@/components/layout/page-transition/PageTransition'

const SITE_URL = 'https://www.mikeblocky.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'mikeblocky.com',
  description: 'a site where i share my thoughts and archive my artworks',
  alternates: {
    canonical: SITE_URL
  },
  openGraph: {
    siteName: 'mikeblocky.com',
    url: SITE_URL,
    type: 'website',
    images: [
      {
        url: '/opengraph-image.jpg',
        width: 1200,
        height: 630,
        alt: 'mikeblocky.com'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/twitter-image.jpg']
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn(
      "h-full",
      monoFont.variable,
      sansFont.variable,
      codeFont.variable
    )} suppressHydrationWarning>
      <body className={cn(
        "h-full bg-background transition-colors duration-300"
      )}>
        <Script
          id="chunk-load-recovery"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  var reloadKey = 'mikeblocky-chunk-reload';
  function getReloaded() {
    try { return sessionStorage.getItem(reloadKey) === '1'; } catch (error) { return false; }
  }
  function setReloaded() {
    try { sessionStorage.setItem(reloadKey, '1'); } catch (error) {}
  }
  function clearReloaded() {
    try { sessionStorage.removeItem(reloadKey); } catch (error) {}
  }
  function isChunkLoadFailure(reason) {
    var message = String((reason && (reason.message || reason.reason || reason.error)) || reason || '');
    return message.indexOf('ChunkLoadError') !== -1 || /Loading chunk .* failed/i.test(message) || /Failed to load chunk/i.test(message);
  }
  function recover(reason) {
    if (!isChunkLoadFailure(reason)) return;
    if (getReloaded()) return;
    setReloaded();
    window.location.reload();
  }
  window.addEventListener('error', function (event) {
    recover(event.error || event.message);
  });
  window.addEventListener('unhandledrejection', function (event) {
    recover(event.reason);
  });
  window.addEventListener('load', function () {
    clearReloaded();
  });
})();
            `,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen relative">
            <div className="flex-1 flex flex-col">
              <main className="container mx-auto mt-4 px-4 flex-1">
                <PageTransition>
                  {children}
                </PageTransition>
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

