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
                type: 'spring' as const,
                stiffness: 420,
                damping: 28,
                mass: 0.45
            }
    ), [prefersReducedMotion])

    if (prefersReducedMotion) {
        return <div className="min-h-full">{children}</div>
    }

    return (
        <motion.div
            key={pathname}
            initial={{ opacity: 0.85, filter: 'blur(6px)', y: 4 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={transition}
            className="min-h-full will-change-[opacity,filter,transform]"
        >
            {children}
        </motion.div>
    )
}
