'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'

// Suppress false-positive React 19 warnings regarding inline scripts during development
if (process.env.NODE_ENV === 'development') {
    const orig = console.error
    console.error = (...args: any[]) => {
        if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) return
        orig.apply(console, args)
    }
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    React.useEffect(() => {
        const triggerReload = () => {
            const reloadKey = 'chunk-load-reload-attempted'
            const lastReload = sessionStorage.getItem(reloadKey)
            const now = Date.now()

            // Limit reload frequency to once every 10 seconds to prevent infinite reload loops
            if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
                sessionStorage.setItem(reloadKey, now.toString())
                console.warn('Chunk load error or static chunk fetch failure detected. Reloading with cache buster...')
                
                try {
                    const url = new URL(window.location.href)
                    url.searchParams.set('_cb', now.toString())
                    window.location.replace(url.toString())
                } catch (e) {
                    window.location.reload()
                }
            }
        }

        const handleCaptureError = (event: ErrorEvent) => {
            // 1. Check if a script tag failed to load (resource load error)
            const target = event.target as HTMLElement | null
            if (target && target.tagName === 'SCRIPT') {
                const src = (target as HTMLScriptElement).src || ''
                if (src.includes('/_next/static/chunks/')) {
                    triggerReload()
                    return
                }
            }

            // 2. Check if it's a runtime ChunkLoadError
            const errorMsg = event.message || ''
            const errorStack = (event.error && event.error.stack) || ''
            const isChunkError = 
                errorMsg.includes('ChunkLoadError') || 
                /loading chunk/i.test(errorMsg) ||
                errorStack.includes('ChunkLoadError') ||
                /loading chunk/i.test(errorStack)

            if (isChunkError) {
                triggerReload()
            }
        }

        const handlePromiseRejection = (event: PromiseRejectionEvent) => {
            const reason = event.reason
            const errorMsg = (reason && reason.message) || ''
            const errorStack = (reason && reason.stack) || ''
            const isChunkError = 
                errorMsg.includes('ChunkLoadError') || 
                /loading chunk/i.test(errorMsg) ||
                errorStack.includes('ChunkLoadError') ||
                /loading chunk/i.test(errorStack)

            if (isChunkError) {
                triggerReload()
            }
        }

        // Use capture phase (third arg: true) to intercept resource loading errors (like <script> tag 404s) which do not bubble
        window.addEventListener('error', handleCaptureError, true)
        window.addEventListener('unhandledrejection', handlePromiseRejection)

        return () => {
            window.removeEventListener('error', handleCaptureError, true)
            window.removeEventListener('unhandledrejection', handlePromiseRejection)
        }
    }, [])

    // Only apply type: "application/json" on the client to avoid React 19 script-execution warnings
    const scriptProps = typeof window === 'undefined' 
        ? undefined 
        : ({ type: 'application/json' } as const)

    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            scriptProps={scriptProps}
            {...props}
        >
            {children}
        </NextThemesProvider>
    )
} 