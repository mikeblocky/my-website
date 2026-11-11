<script lang="ts">
  import { FolderLock, Eye, EyeOff, ArrowRight } from '@lucide/svelte';
  export let admin=false;
  let show=false;
</script>
<section class="gallery-login">
  <div class="gallery-symbol"><FolderLock size={28} strokeWidth={1.5} /></div>
  <h2>{admin?'Your private galleries':'Open your gallery'}</h2>
  <form method="POST" action="?/unlock" class="gallery-fields">
    <label for="gallery-password">{admin?'Admin passphrase':'Gallery password'}</label>
    <div class="gallery-password-input"><input id="gallery-password" name="password" type={show?'text':'password'} required maxlength="256" autocomplete="current-password" spellcheck="false" autocapitalize="off"  /><button class="gallery-icon" type="button" aria-label={show?'Hide passphrase':'Show passphrase'} on:click={()=>show=!show}>{#if show}<EyeOff size={18} />{:else}<Eye size={18} />{/if}</button></div>
    <button class="gallery-button primary" type="submit">{admin?'Open galleries':'Open gallery'}<ArrowRight size={17} /></button>
  </form>
</section>
