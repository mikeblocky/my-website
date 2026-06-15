<script lang="ts">
  import type { StatItem } from '$lib/stats/types';

  export let data: StatItem[] = [];

  $: total = data.reduce((acc, item) => acc + item.value, 0);

  function colorClass(color: string) {
    const match = color.match(/bg-([a-z]+)-500/);
    return match ? `stat-color-${match[1]}` : 'stat-color-blue';
  }
</script>

<section class="stats-panel">
  <div>
    <h3>Total works</h3>
    <p>{total}</p>
  </div>

  <div class="stats-list">
    {#each data as item, index}
      {@const percent = total > 0 ? (item.value / total) * 100 : 0}
      <article>
        <div>
          <span>{item.label}</span>
          <small>{item.value} works ({percent.toFixed(1)}%)</small>
        </div>
        <i
          class={colorClass(item.color)}
          style={`--stat-width: ${percent}%; --stat-index: ${index}`}
          aria-label={`${item.label}: ${item.value} works`}
        ></i>
      </article>
    {/each}
  </div>
</section>
