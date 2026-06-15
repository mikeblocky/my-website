import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/ui/theme/theme-provider'
import { cn } from '@/lib/utils/utils'
import { monoFont, sansFont, dmSans, codeFont } from '@/styles/fonts/fonts'
import { PageTransition } from '@/components/layout/page-transition/PageTransition'
import { MobileAppShell } from '@/components/layout/mobile-app-shell/MobileAppShell'

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
      dmSans.variable,
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var flags = [
                  { colors: '#e25566, #f59e0b, #eab308, #22c55e, #14b8a6, #3b82f6, #6366f1, #a855f7', glow: '326 78% 72%' },
                  { colors: '#ef4444, #f97316, #eab308, #22c55e, #3b82f6, #a855f7', glow: '14 90% 63%' },
                  { colors: '#3b82f6, #ec4899, #ffffff, #78350f, #1e293b, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #a855f7', glow: '325 80% 65%' },
                  { colors: '#111827, #78350f, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #a855f7', glow: '0 85% 60%' },
                  { colors: '#d946ef, #a855f7, #3b82f6', glow: '300 80% 60%' },
                  { colors: '#ff007f, #ffcc00, #00ccff', glow: '330 100% 60%' },
                  { colors: '#60a5fa, #f472b6, #ffffff, #f472b6, #60a5fa', glow: '210 80% 70%' },
                  { colors: '#facc15, #ffffff, #a855f7, #1e293b', glow: '50 90% 60%' },
                  { colors: '#c084fc, #ffffff, #15803d', glow: '270 85% 75%' },
                  { colors: '#1e293b, #94a3b8, #ffffff, #a855f7', glow: '270 60% 50%' },
                  { colors: '#1e293b, #ffffff, #a855f7, #94a3b8', glow: '270 70% 60%' },
                  { colors: '#a855f7, #facc15, #a855f7', glow: '45 90% 60%' },
                  { colors: '#f97316, #fdba74, #ffffff, #f472b6, #db2777', glow: '340 80% 60%' },
                  { colors: '#0f766e, #2dd4bf, #4ade80, #ffffff, #60a5fa, #4f46e5, #7c3aed', glow: '165 75% 55%' },
                  { colors: '#1e293b, #94a3b8, #ffffff, #4ade80, #ffffff, #94a3b8, #1e293b', glow: '120 70% 60%' },
                  { colors: '#f43f5e, #ffffff, #a855f7, #111827, #3b82f6', glow: '340 85% 65%' },
                  { colors: '#f43f5e, #10b981, #3b82f6', glow: '335 80% 60%' },
                  { colors: '#fbcfe8, #f43f5e, #8b5cf6, #3b82f6, #93c5fd', glow: '335 80% 65%' },
                  { colors: '#15803d, #4ade80, #ffffff, #94a3b8, #111827', glow: '120 75% 55%' },
                  { colors: '#1e293b, #ffffff, #22c55e, #64748b', glow: '142 70% 50%' },
                  { colors: '#ef4444, #facc15, #3b82f6, #ffffff, #111827', glow: '0 80% 60%' },
                  { colors: '#f43f5e, #fbcfe8, #d8b4fe, #ffffff, #d8b4fe, #93c5fd, #2563eb', glow: '330 80% 65%' },
                  { colors: '#10b981, #a7f3d0, #ffffff, #fbcfe8, #f43f5e', glow: '150 75% 60%' },
                  { colors: '#ffffff, #22c55e, #111827', glow: '142 70% 50%' },
                  { colors: '#ec4899, #8b5cf6, #3b82f6', glow: '300 80% 60%' },
                  { colors: '#f43f5e, #a855f7, #22c55e', glow: '300 80% 60%' },
                  { colors: '#2563eb, #ef4444, #111827, #f59e0b', glow: '220 80% 55%' },
                  { colors: '#ec4899, #3b82f6, #22c55e, #facc15, #f97316, #a855f7', glow: '300 85% 65%' },
                  { colors: '#facc15, #a855f7, #3b82f6, #ec4899, #ffffff, #78350f, #1e293b, #ef4444, #f97316, #22c55e, #a855f7', glow: '50 90% 60%' },
                  { colors: '#111827, #ffffff, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #a855f7', glow: '0 80% 60%' }
                ];
                var date = new Date();
                var month = date.getMonth();
                var day = date.getDate();
                var activeIndex = (month === 5) ? (day - 1) % 30 : (day - 1) % 30;
                var currentFlag = flags[activeIndex] || flags[1];
                var root = document.documentElement;
                root.style.setProperty('--pride-colors', currentFlag.colors);
                var colorsArr = currentFlag.colors.split(', ');
                var colorsRepeat = currentFlag.colors + ', ' + colorsArr[0];
                root.style.setProperty('--pride-colors-repeat', colorsRepeat);
                root.style.setProperty('--pride-glow-val', currentFlag.glow);
              })();
            `
          }}
        />
        <link rel="preload" as="image" href="/distribution/2026/kemutai-hanashi/Illustration125c.webp?v=1" type="image/webp" />
      </head>
      <body className={cn(
        "min-h-dvh bg-background transition-colors duration-300 overflow-x-hidden"
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-dvh relative overflow-x-hidden">
            <main className="w-full mx-auto mt-4 px-[clamp(0.75rem,4vw,1.5rem)] pb-[calc(8rem+env(safe-area-inset-bottom,0px))] sm:pb-4">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
          </div>
          <MobileAppShell />
        </ThemeProvider>
      </body>
    </html>
  )
}

