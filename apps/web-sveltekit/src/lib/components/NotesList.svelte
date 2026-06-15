<script lang="ts">
  export let notes: any[] = [];
</script>

<section class="notes-list">
  {#each notes as note, index}
    <div class="note-row">
      <a href={note.href} target={note.href.startsWith('http') ? '_blank' : undefined} rel={note.href.startsWith('http') ? 'noreferrer' : undefined}>
        <article>
          <h2>{note.title}</h2>
          <p>{note.description}</p>
          <small>Last Updated: {note.lastUpdated}</small>
        </article>
      </a>
      {#if index < notes.length - 1}
        <hr />
      {/if}
    </div>
  {/each}
</section>
