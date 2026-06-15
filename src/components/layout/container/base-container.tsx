import { cn } from '@/lib/utils/utils'

interface BaseContainerProps {
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
    paddingX?: 'none' | 'sm' | 'md' | 'lg';
    paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    center?: boolean;
    className?: string;
}

const sizes = {
    sm: 'max-w-2xl',
    md: 'max-w-3xl',
    lg: 'max-w-4xl',
    xl: 'max-w-5xl',
    '2xl': 'max-w-7xl',
    '3xl': 'max-w-[1440px]',
    full: 'max-w-full'
}

const paddingX = {
    none: 'px-0',
    sm: 'px-[clamp(0.5rem,2vw,1rem)]',
    md: 'px-[clamp(0.75rem,3vw,1.5rem)]',
    lg: 'px-[clamp(1rem,4vw,2rem)]'
}

const paddingY = {
    none: 'py-0',
    sm: 'py-[clamp(0.5rem,2vh,1rem)]',
    md: 'py-[clamp(0.75rem,2.5vh,1.5rem)]',
    lg: 'py-[clamp(1rem,3vh,2rem)]',
    xl: 'py-[clamp(1.5rem,4vh,3rem)]'
}

export default function BaseContainer({ 
    children, 
    size = 'md',
    paddingX: px = 'md',
    paddingY: py = 'md',
    center = false,
    className 
}: BaseContainerProps) {
    return (
        <div className={cn(
            'mx-auto w-full',
            sizes[size],
            paddingX[px],
            paddingY[py],
            center && 'text-center',
            className
        )}>
            {children}
        </div>
    )
} 