<script lang="ts">
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';
  export let data; export let form;
</script>
<svelte:head><title>Private folders | mikeblocky.com</title><meta name="robots" content="noindex,nofollow,noarchive,noimageindex" /></svelte:head>
<SectionPageShell title="Private folders" currentLabel="Private folders">
  <section class="vault-workspace">
    {#if form?.error}<p role="alert">{form.error}</p>{/if}
    {#if data.authenticated}
      <form method="POST" action="?/lock"><button class="vault-quiet">Lock folders</button></form>
      <form method="POST" action="?/create" class="vault-form"><label for="person">Person</label><input id="person" name="person" value={data.suggestedPerson} required maxlength="80" autocomplete="off" /><button>Create folder</button></form>
      {#if form?.created}<div class="vault-credential" role="status"><p>Save this password now. It won’t be shown again.</p><a href={`/commissions/files/${form.folderId}`}>Open new folder</a><label>Password<input readonly value={form.password} aria-label="Generated folder password" /></label></div>{/if}
      <div class="vault-folder-list">{#each data.folders as folder}<a href={`/commissions/files/${folder.id}`}><strong>{folder.person}</strong><span>Open folder →</span></a>{/each}</div>
    {:else}
      <form method="POST" action="?/unlock" class="vault-form"><label for="password">Private folder admin password</label><input id="password" name="password" type="password" required maxlength="256" autocomplete="current-password" /><button>Unlock</button></form>
    {/if}
  </section>
</SectionPageShell>
