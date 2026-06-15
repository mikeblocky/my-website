<script lang="ts">
  import { cn } from '@/lib/utils/utils';

  export let gap: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  let className = '';
  export { className as class };
</script>

<div class={cn('flex flex-row items-center', 
  gap === 'none' ? '' : 
  gap === 'xs' ? 'gap-0.5 sm:gap-1' : 
  gap === 'sm' ? 'gap-1 sm:gap-2' : 
  gap === 'md' ? 'gap-2 sm:gap-4' : 
  gap === 'lg' ? 'gap-4 sm:gap-8' : 
  'gap-6 sm:gap-12',
  className
)}>
  <slot />
</div>
