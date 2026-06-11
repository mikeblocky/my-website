'use client'

import { ReactNode, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'

type PageTransitionProps = {
    children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname()
    const prefersReducedMotion = useReducedMotion()

    const transition = useMemo(() => (
        prefersReducedMotion
            ? { duration: 0 }
            : {
                duration: 0.38,
                ease: [0.16, 1, 0.3, 1] as any
            }
    ), [prefersReducedMotion])

    if (prefersReducedMotion) {
        return <div className="min-h-full">{children}</div>
    }

    return (
        <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="min-h-full"
        >
            {children}
        </motion.div>
    )
}
