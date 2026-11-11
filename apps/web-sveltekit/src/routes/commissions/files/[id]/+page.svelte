<script lang="ts">
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';
  export let data; export let form;
  let pin: {fileId:string;x:number;y:number}|null=null;
  function placePin(event:MouseEvent,fileId:string) { const box=(event.currentTarget as HTMLElement).getBoundingClientRect();pin={fileId,x:Math.max(0,Math.min(1,(event.clientX-box.left)/box.width)),y:Math.max(0,Math.min(1,(event.clientY-box.top)/box.height))}; }
</script>
<svelte:head><title>Private commission folder | mikeblocky.com</title><meta name="robots" content="noindex,nofollow,noarchive,noimageindex" /></svelte:head>
<SectionPageShell title={data.authenticated ? data.person : 'Private folder'} currentLabel="Private folder">
  <section class="vault-workspace">
    {#if form?.error}<p role="alert">{form.error}</p>{/if}
    {#if data.authenticated}
      <header class="vault-toolbar">{#if data.admin}<a href="/commissions/files">All folders</a>{:else}<form method="POST" action="?/lock"><button>Lock folder</button></form>{/if}</header>
      {#if data.admin}
        <form method="POST" action="?/upload" enctype="multipart/form-data" class="vault-form"><label for="image">Add an image</label><input id="image" name="image" type="file" accept="image/png,image/jpeg,image/webp" required /><button>Upload</button></form>
        <details><summary>Folder access</summary><p>Share this page’s address and its password with {data.person}.</p><form method="POST" action="?/rotate"><button>Generate a new password and revoke existing sessions</button></form></details>
        {#if form?.password}<label class="vault-credential">Save the new password now.<input readonly value={form.password} aria-label="New folder password" /></label>{/if}
      {/if}
      <div class="vault-images">{#each data.files as file}<figure class:archived={!!file.archived}><button type="button" class="vault-image-frame" aria-label={`Annotate ${file.name}`} on:click={event=>placePin(event,file.id)}><img src={`/commissions/files/${data.id}/image/${file.id}`} alt={file.name} loading="lazy" />{#each data.comments.filter(comment=>comment.file_id===file.id) as comment,index}<span class="vault-pin" style={`left:${comment.x!*100}%;top:${comment.y!*100}%`} title={comment.body}>{index+1}</span>{/each}{#if pin?.fileId===file.id}<span class="vault-pin pending" style={`left:${pin.x*100}%;top:${pin.y*100}%`}>+</span>{/if}</button><figcaption>{file.name} · <a href={`/commissions/files/${data.id}/image/${file.id}`} target="_blank" rel="noreferrer">Full size ↗</a></figcaption>{#if data.admin}<form method="POST" action="?/archive"><input type="hidden" name="fileId" value={file.id} /><button>{file.archived?'Restore image':'Archive image'}</button></form>{/if}</figure>{:else}<p>No images yet.</p>{/each}</div>
      <section class="vault-comments"><h2>Comments & notes</h2><form method="POST" action="?/comment" class="vault-form"><input type="hidden" name="fileId" value={pin?.fileId||''} /><input type="hidden" name="x" value={pin?.x??''} /><input type="hidden" name="y" value={pin?.y??''} /><label for="comment">{pin?'Add a note at the selected point':'Leave a comment'}</label>{#if pin}<button type="button" on:click={()=>pin=null}>Cancel annotation</button>{/if}<textarea id="comment" name="body" required maxlength="2000" rows="3"></textarea><button>Post {pin?'annotation':'comment'}</button></form>{#each data.comments as comment}<article><header><strong>{comment.author}</strong><small>{comment.file_id?'Image note':'Comment'} · {comment.created_at.slice(0,10)}</small></header><p>{comment.body}</p></article>{/each}</section>
    {:else}
      <form method="POST" action="?/unlock" class="vault-form"><label for="password">Folder password</label><input id="password" name="password" type="password" autocomplete="current-password" required maxlength="256" /><button>Open folder</button></form>
    {/if}
  </section>
</SectionPageShell>
