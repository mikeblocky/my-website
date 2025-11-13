import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/ui/theme/theme-provider'
import { cn } from '@/lib/utils/utils'
import { Analytics } from "@vercel/analytics/react"
import { monoFont, sansFont, codeFont } from '@/styles/fonts/fonts'
import { PageTransition } from '@/components/layout/page-transition/PageTransition'

const SITE_URL = 'https://www.mikeblocky.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'mikeblocky.com',
  description: 'a site where i share my thoughts and archive my artworks',
  openGraph: {
    siteName: 'mikeblocky.com',
    url: SITE_URL,
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image'
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
                <Analytics />
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

