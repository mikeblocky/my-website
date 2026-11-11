<script lang="ts">
  import { Copy, Check, KeyRound, ArrowUpRight } from '@lucide/svelte';
  export let password:string;
  export let folderId:string;
  let copied='';
  async function copy(kind:'phrase'|'link') { try{await navigator.clipboard.writeText(kind==='phrase'?password:new URL(`/commissions/files/${folderId}`,window.location.origin).href);copied=kind;}catch{copied='select';} }
</script>
<section class="gallery-passphrase" aria-label="New gallery passphrase" role="status">
  <header><span><KeyRound size={18} />Gallery password</span><small>Shown once — save it now</small></header>
  <div class="gallery-phrase-copy"><output class="gallery-phrase-text" aria-label="Generated gallery passphrase">{password}</output><button type="button" class="gallery-icon" aria-label="Copy passphrase" on:click={()=>copy('phrase')}>{#if copied==='phrase'}<Check size={18} />{:else}<Copy size={18} />{/if}</button></div>
  <footer><button type="button" class="gallery-button quiet" on:click={()=>copy('link')}>{#if copied==='link'}<Check size={15} />Link copied{:else}<Copy size={15} />Copy gallery link{/if}</button><a class="gallery-text-link" href={`/commissions/files/${folderId}`}>Open<ArrowUpRight size={15} /></a></footer>
  {#if copied==='select'}<small>Select the passphrase to copy it.</small>{/if}
</section>
