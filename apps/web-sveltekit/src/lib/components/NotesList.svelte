<script lang="ts">
  export let notes: any[] = [];
</script>

<div class="home-blog-list">
  {#each notes as note, index}
    <a
      href={note.href}
      class="home-blog-row"
      style="--entry-index: {index}"
      target={note.href.startsWith('http') ? '_blank' : undefined}
      rel={note.href.startsWith('http') ? 'noreferrer' : undefined}
    >
      <span>{note.lastUpdated}</span>
      <strong>{note.title}</strong>
      <p>{note.description}</p>
    </a>
  {/each}
</div>
