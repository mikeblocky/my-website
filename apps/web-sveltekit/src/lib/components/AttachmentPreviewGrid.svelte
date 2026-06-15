<script lang="ts">
  import { X } from '@lucide/svelte';

  export let urls: string[] = [];
  export let onRemove: (index: number) => void;
  export let alt = 'Attachment thumbnail';
  export let className = '';
  export let compact = false;
</script>

{#if urls.length > 0}
  <div class="flex flex-wrap gap-2.5 {className}">
    {#each urls as url, index (url + '-' + index)}
      <div
        class="group/thumb relative overflow-hidden rounded-xl border border-gray-200/80 bg-gray-50/50 p-1 dark:border-gray-800/80 dark:bg-gray-900/50 transition-all duration-150 {compact ? 'rounded-lg p-0.5' : ''}"
      >
        <img
          src={url}
          {alt}
          width={96}
          height={64}
          class="h-16 w-24 rounded-lg object-cover {compact ? 'rounded' : ''}"
        />
        <button
          type="button"
          on:click={() => onRemove(index)}
          class="absolute right-1.5 top-1.5 rounded-full bg-rose-500 p-1 text-white shadow-md transition-colors hover:bg-rose-600 cursor-pointer"
          title="Remove image"
        >
          <X size={10} strokeWidth={3} />
        </button>
      </div>
    {/each}
  </div>
{/if}
