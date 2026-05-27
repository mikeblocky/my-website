'use client'

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
