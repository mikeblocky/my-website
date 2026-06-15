<script lang="ts">
  import { cn } from '@/lib/utils/utils';

  export let gap: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  let className = '';
  export { className as class };

  const gaps = {
    none: '',
    xs: 'space-y-0.5 sm:space-y-1',
    sm: 'space-y-1 sm:space-y-2',
    md: 'space-y-2 sm:space-y-4',
    lg: 'space-y-4 sm:space-y-8',
    xl: 'space-y-6 sm:space-y-12'
  };
</script>

<div class={cn('flex flex-col', gaps[gap], className)}>
  <slot />
</div>
