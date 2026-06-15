<script lang="ts">
  import { cn } from '@/lib/utils/utils';

  export let size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full' = 'md';
  export let paddingX: 'none' | 'sm' | 'md' | 'lg' = 'md';
  export let paddingY: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let center = false;
  let className = '';
  export { className as class };

  const sizes = {
    sm: 'max-w-2xl',
    md: 'max-w-3xl',
    lg: 'max-w-4xl',
    xl: 'max-w-5xl',
    '2xl': 'max-w-7xl',
    '3xl': 'max-w-[1440px]',
    full: 'max-w-full'
  };

  const paddingXs = {
    none: 'px-0',
    sm: 'px-[clamp(0.5rem,2vw,1rem)]',
    md: 'px-[clamp(0.75rem,3vw,1.5rem)]',
    lg: 'px-[clamp(1rem,4vw,2rem)]'
  };

  const paddingYs = {
    none: 'py-0',
    sm: 'py-[clamp(0.5rem,2vh,1rem)]',
    md: 'py-[clamp(0.75rem,2.5vh,1.5rem)]',
    lg: 'py-[clamp(1rem,3vh,2rem)]',
    xl: 'py-[clamp(1.5rem,4vh,3rem)]'
  };
</script>

<div
  class={cn(
    'mx-auto w-full',
    sizes[size],
    paddingXs[paddingX],
    paddingYs[paddingY],
    center && 'text-center',
    className
  )}
>
  <slot />
</div>
