import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/ui/theme/theme-provider'
import { cn } from '@/lib/utils/utils'
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var reloadKey = 'chunk-load-recovery-attempted';
                var reloadWindowMs = 30000;

                function clearRuntimeCaches() {
                  var tasks = [];

                  if ('caches' in window) {
                    tasks.push(
                      caches.keys()
                        .then(function(keys) {
                          return Promise.all(keys.map(function(key) {
                            return caches.delete(key);
                          }));
                        })
                        .catch(function() {})
                    );
                  }

                  if ('serviceWorker' in navigator) {
                    tasks.push(
                      navigator.serviceWorker.getRegistrations()
                        .then(function(registrations) {
                          return Promise.all(registrations.map(function(registration) {
                            return registration.unregister();
                          }));
                        })
                        .catch(function() {})
                    );
                  }

                  return Promise.all(tasks);
                }

                function reloadWithoutCache() {
                  var now = Date.now();
                  try {
                    var url = new URL(window.location.href);
                    url.searchParams.set('__chunk_recovery', now.toString());
                    window.location.replace(url.toString());
                  } catch (e) {
                    window.location.reload();
                  }
                }

                function triggerReload() {
                  var lastReload = sessionStorage.getItem(reloadKey);
                  var now = Date.now();
                  if (!lastReload || now - parseInt(lastReload, 10) > reloadWindowMs) {
                    sessionStorage.setItem(reloadKey, now.toString());
                    clearRuntimeCaches().then(reloadWithoutCache, reloadWithoutCache);
                  }
                }

                window.addEventListener('error', function(event) {
                  var target = event.target;
                  if (target && target.tagName === 'SCRIPT') {
                    var src = target.src || '';
                    if (src.indexOf('/_next/static/chunks/') !== -1) {
                      triggerReload();
                    }
                  }
                  var msg = event.message || '';
                  var stack = (event.error && event.error.stack) || '';
                  if (msg.indexOf('ChunkLoadError') !== -1 || /loading chunk/i.test(msg) || stack.indexOf('ChunkLoadError') !== -1 || /loading chunk/i.test(stack)) {
                    triggerReload();
                  }
                }, true);
                window.addEventListener('unhandledrejection', function(event) {
                  var reason = event.reason;
                  var msg = (reason && reason.message) || '';
                  var stack = (reason && reason.stack) || '';
                  if (msg.indexOf('ChunkLoadError') !== -1 || /loading chunk/i.test(msg) || stack.indexOf('ChunkLoadError') !== -1 || /loading chunk/i.test(stack)) {
                    triggerReload();
                  }
                });
              })();
            `
          }}
        />
      </head>
      <body className={cn(
        "h-full bg-background transition-colors duration-300"
      )}>
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

