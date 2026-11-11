<script lang="ts">
  import { enhance } from '$app/forms';
  import { FolderOpen, Plus, Search, ArrowUpRight, LockKeyhole, X } from '@lucide/svelte';
  import GalleryShell from '$lib/components/GalleryShell.svelte';
  import GalleryLogin from '$lib/components/GalleryLogin.svelte';
  import GalleryPassphrase from '$lib/components/GalleryPassphrase.svelte';
  export let data; export let form;
  let search='',creating=false,saving=false;
  $: if(data.suggestedPerson)creating=true;
  $: folders=data.folders.filter(folder=>folder.person.toLowerCase().includes(search.toLowerCase().trim()));
</script>
<svelte:head><title>Commission galleries | mikeblocky.com</title><meta name="robots" content="noindex,nofollow,noarchive,noimageindex" /></svelte:head>
<GalleryShell title="Commission galleries" meta={data.authenticated?`${data.folders.length} private galleries`:'Private access'}>
  <svelte:fragment slot="actions">{#if data.authenticated}<form method="POST" action="?/lock"><button class="gallery-button quiet"><LockKeyhole size={16} />Lock</button></form>{/if}</svelte:fragment>
  {#if form?.error}<p class="gallery-notice error" role="alert">{form.error}</p>{/if}
  {#if data.authenticated}
    <div class="gallery-toolbar"><label class="gallery-search"><Search size={18} /><input aria-label="Find a gallery" placeholder="Find a person…" bind:value={search} /></label><button type="button" class="gallery-button primary" on:click={()=>creating=!creating}><Plus size={17} />New gallery</button></div>
    {#if creating}<form method="POST" action="?/create" class="gallery-new" use:enhance={()=>{saving=true;return async({update,result})=>{await update({reset:false});saving=false;if(result.type==='success')creating=false;};}}><div class="gallery-fields"><label for="person">Who is this gallery for?</label><input id="person" name="person" value={data.suggestedPerson} required maxlength="80" autocomplete="off" placeholder="Name or @username" /></div><button class="gallery-button primary" disabled={saving}>{saving?'Creating…':'Create gallery'}</button><button type="button" class="gallery-icon" aria-label="Cancel new gallery" on:click={()=>creating=false}><X size={17} /></button></form>{/if}
    {#if form?.created}<GalleryPassphrase password={form.password} folderId={form.folderId} />{/if}
    <div class="gallery-people">{#each folders as folder}<a class="gallery-person" href={`/commissions/files/${folder.id}`}><span class="gallery-person-symbol">{#if folder.cover_id}<img src={`/commissions/files/${folder.id}/image/${folder.cover_id}`} alt="" loading="lazy" />{:else}<FolderOpen size={28} strokeWidth={1.5} />{/if}</span><div><strong>{folder.person}</strong><small>{folder.image_count||0} {(folder.image_count||0)===1?'image':'images'} · Private</small></div><ArrowUpRight size={18} class="gallery-person-arrow" /></a>{:else}<div class="gallery-empty"><FolderOpen size={32} /><h2>{search?'No matching galleries':'Your galleries live here'}</h2><p>{search?'Try another name.':'Create a gallery for someone you’re working with.'}</p></div>{/each}</div>
  {:else}<GalleryLogin admin />{/if}
</GalleryShell>
