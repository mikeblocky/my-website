<script lang="ts">
  export let monthGroups: any[] = [];
</script>

<section class="weekly-reflections-list">
  {#each monthGroups as group, index}
    <details open={index === 0}>
      <summary>
        <span>{group.month}</span>
      </summary>
      <div class="week-rail">
        {#each group.weeks as week}
          <a href={week.href}>{week.title}</a>
        {/each}
      </div>
    </details>
  {/each}
</section>
