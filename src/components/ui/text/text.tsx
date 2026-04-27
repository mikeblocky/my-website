import { cn } from '@/lib/utils/utils'
import { monoFont } from '@/styles/fonts/fonts'

interface TextProps {
    children: React.ReactNode;
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl' | '2xl';
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    variant?: 'default' | 'blue' | 'sky' | 'green' | 'red' | 'orange' | 'muted' | 'caption';
    align?: 'left' | 'center' | 'right' | 'justify';
    transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    truncate?: boolean;
}

// Define types for the default styles
type TextSize = NonNullable<TextProps['size']>
type TextWeight = NonNullable<TextProps['weight']>
type TextVariant = NonNullable<TextProps['variant']>
type TextAlign = NonNullable<TextProps['align']>
type TextTransform = NonNullable<TextProps['transform']>

// Default styles that will be applied to every Text component
const defaultStyles = {
    size: 'sm' as TextSize,
    weight: 'normal' as TextWeight,
    variant: 'default' as TextVariant,
    align: 'left' as TextAlign,
    transform: 'none' as TextTransform,
    truncate: false
}

const defaultSizes = {
    h1: 'text-2xl sm:text-3xl md:text-3xl lg:text-4xl',
    h2: 'text-xl sm:text-2xl md:text-2xl lg:text-3xl',
    h3: 'text-lg sm:text-xl md:text-xl lg:text-2xl',
    h4: 'text-base sm:text-lg md:text-lg lg:text-xl',
    h5: 'text-sm sm:text-base md:text-base lg:text-lg',
    h6: 'text-xs sm:text-sm md:text-sm lg:text-base'
}

const textSizes = {
    xs: 'text-[14px] sm:text-[15px]',
    sm: 'text-[15px] sm:text-[16px] md:text-[17px]',
    md: 'text-[16px] sm:text-[17px] md:text-[18px]',
    base: 'text-[18px] sm:text-[20px]',
    lg: 'text-[20px] sm:text-[22px]',
    xl: 'text-[22px] sm:text-[26px]',
    '2xl': 'text-[26px] sm:text-[33px]',
}

const fontWeights = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
}

const variants = {
    default: 'text-foreground dark:text-white',
    blue: 'text-blue-600 dark:text-blue-400',
    sky: 'text-sky-600 dark:text-sky-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    orange: 'text-orange-600 dark:text-orange-400',
    muted: 'text-muted-foreground dark:text-gray-400',
    caption: 'text-xs text-muted-foreground dark:text-gray-400'
}

const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
}

const transforms = {
    none: '',
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize'
}

export default function Text({ 
    children, 
    className,
    size = defaultStyles.size,
    weight = defaultStyles.weight,
    variant = defaultStyles.variant,
    align = defaultStyles.align,
    transform = defaultStyles.transform,
    truncate = defaultStyles.truncate
}: TextProps) {
    // Use the provided value or fall back to default
    const finalSize = size || defaultStyles.size
    const finalWeight = weight || defaultStyles.weight
    const finalVariant = variant || defaultStyles.variant
    const finalAlign = align || defaultStyles.align
    const finalTransform = transform || defaultStyles.transform

    return (
        <p className={cn(
            monoFont.className,
            textSizes[finalSize],
            fontWeights[finalWeight],
            variants[finalVariant],
            alignments[finalAlign],
            transforms[finalTransform],
            truncate && 'truncate',
            className
        )}>
            {children}
        </p>
    );
} 