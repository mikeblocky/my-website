import { cn } from '@/lib/utils/utils'
import { StackVertical } from '@/components/layout/layout-stack/layout-stack'
import { monoFont } from '@/styles/fonts/fonts'

interface ListProps {
    children: React.ReactNode;
    className?: string;
    type?: 'unordered' | 'ordered';
    variant?: 'default' | 'compact';
    marker?: 'disc' | 'circle' | 'square' | 'decimal' | 'none';
    spacing?: 'tight' | 'normal' | 'relaxed';
    fontSize?: 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl' | '2xl';
    paddingLeft?: 'sm' | 'md' | 'lg' | 'xs' | 'none';
}

interface ListItemProps {
    children: React.ReactNode;
    className?: string;
    markerClassName?: string;
}

const listFontClass = monoFont.className

const listFontSize = {
    xs: 'text-[14px] sm:text-[15px]',
    sm: 'text-[15px] sm:text-[16px] md:text-[17px]',
    md: 'text-[16px] sm:text-[17px] md:text-[18px]',
    base: 'text-[18px] sm:text-[20px]',
    lg: 'text-[20px] sm:text-[22px]',
    xl: 'text-[22px] sm:text-[26px]',
    '2xl': 'text-[26px] sm:text-[33px]'
}

const spacingStyles = {
    tight: 'space-y-1.5 sm:space-y-2',
    normal: 'space-y-2 sm:space-y-3',
    relaxed: 'space-y-3 sm:space-y-4'
}

const markerStyles = {
    disc: 'list-disc',
    circle: 'list-circle',
    square: 'list-square',
    decimal: 'list-decimal',
    none: 'list-none'
}

const paddingLeftStyles = {
    sm: 'pl-2 sm:pl-3',
    md: 'pl-3 sm:pl-5',
    lg: 'pl-4 sm:pl-6',
    xs: 'pl-1 sm:pl-2',
    none: 'pl-0'
}

export function List({ 
    children, 
    className,
    type = 'unordered',
    variant = 'default',
    marker = 'disc',
    spacing = 'normal',
    fontSize = 'sm',
    paddingLeft = 'md'
}: ListProps) {
    const Component = type === 'ordered' ? 'ol' : 'ul'
    
    return (
        <Component
            className={cn(
                'ml-3 sm:ml-5',
                markerStyles[marker],
                spacingStyles[spacing],
                variant === 'compact' && 'text-[14px] sm:text-[15px]',
                listFontClass,
                listFontSize[fontSize],
                paddingLeftStyles[paddingLeft],
                'text-foreground dark:text-white',
                'marker:text-[0.9em] marker:text-muted-foreground dark:marker:text-gray-400',
                className
            )}
        >
            {children}
        </Component>
    )
}

export function ListItem({ children, className, markerClassName }: ListItemProps) {
    return (
        <li className={cn(
            'pl-1.5 sm:pl-2.5 leading-8',
            markerClassName,
            listFontClass,
            className
        )}>
            {children}
        </li>
    )
}

// Example of a nested list component for better organization
export function NestedList({ 
    items 
}: { 
    items: {
        content: React.ReactNode;
        subitems?: React.ReactNode[];
    }[] 
}) {
    return (
        <List>
            {items.map((item, index) => (
                <StackVertical key={index} gap="sm">
                    <ListItem>{item.content}</ListItem>
                    {item.subitems && (
                        <List marker="circle" spacing="tight" className="ml-4">
                            {item.subitems.map((subitem, subIndex) => (
                                <ListItem key={subIndex}>{subitem}</ListItem>
                            ))}
                        </List>
                    )}
                </StackVertical>
            ))}
        </List>
    )
} 
