<script lang="ts">
  import { onMount } from 'svelte';
  import { Vibrate } from '@lucide/svelte';
  import { hapticsEnabled, setHaptics } from '$lib/interaction-feedback';
  let supported=false;
  onMount(()=>{supported=typeof navigator.vibrate==='function'&&navigator.maxTouchPoints>0;});
</script>
{#if supported}<button type="button" class="haptics-toggle" aria-label="Haptic feedback" aria-pressed={$hapticsEnabled} on:click={()=>setHaptics(!$hapticsEnabled)}><Vibrate size={17}/><span>haptics</span></button>{/if}
<style>
  button{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:6px;border:0;border-radius:10px;background:transparent;color:hsl(var(--muted-foreground));font:inherit;font-size:var(--font-size-xs);cursor:pointer;}
  button[aria-pressed=true]{color:hsl(var(--site-blue));background:hsl(var(--site-blue)/.08);}
</style>
