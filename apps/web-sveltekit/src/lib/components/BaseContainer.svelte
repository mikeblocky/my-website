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
    sm: 'px-2 sm:px-3 md:px-4',
    md: 'px-3 sm:px-4 md:px-6',
    lg: 'px-4 sm:px-6 md:px-8'
  };

  const paddingYs = {
    none: 'py-0',
    sm: 'py-2 sm:py-3 md:py-4',
    md: 'py-3 sm:py-4 md:py-6',
    lg: 'py-4 sm:py-6 md:py-8',
    xl: 'py-6 sm:py-8 md:py-12'
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
