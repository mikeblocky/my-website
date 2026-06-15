<script lang="ts">
  import { ChevronRight } from '@lucide/svelte';

  export let href: string;
  export let title: string;
  export let description = '';
</script>

<a class="section-link-item pride-outline-hover" {href}>
  <span>
    <strong>{title}</strong>
    {#if description}
      <small>{description}</small>
    {/if}
  </span>
  <ChevronRight size={16} strokeWidth={1.8} />
</a>
