<script lang="ts">
  export let item: any;
  export let compact = false;
  export let viewMode: 'detailed' | 'simplified' = 'detailed';
</script>

<article class:compact class="recommendation-card pride-soft-card">
  {#if item.imageUrl}
    <div class="recommendation-media">
      <img src={item.imageUrl} alt="" loading="lazy" />
    </div>
  {:else}
    <div class="recommendation-fallback">{item.medium?.slice(0, 1)}</div>
  {/if}

  <div class="recommendation-body">
    <span class="recommendation-medium">{item.medium?.toLowerCase()}</span>
    <div>
      <h2>{item.title}</h2>
      <p class="recommendation-creator">{item.creator}</p>
    </div>
    {#if viewMode === 'detailed' && item.thought}
      <p class="recommendation-thought">{item.thought}</p>
    {/if}
    {#if viewMode === 'detailed' && item.links?.length}
      <div class="recommendation-links">
        {#each item.links as link}
          <a href={link.url} target="_blank" rel="noreferrer">{link.label.toLowerCase()} →</a>
        {/each}
      </div>
    {/if}
  </div>
</article>
