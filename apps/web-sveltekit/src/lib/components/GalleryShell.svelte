<script lang="ts">
  import BaseContainer from './BaseContainer.svelte';
  import SiteFooter from './SiteFooter.svelte';
  import '$lib/styles/gallery.css';
  export let title:string;
  export let meta='';
  export let detail=false;
  export let overview=false;
</script>
<BaseContainer size="xl" paddingX="md" paddingY="lg">
  <div class="gallery-shell">
    <nav class="gallery-crumbs" aria-label="Breadcrumb"><a href="/">🐶 Home</a><span>/</span>{#if overview}<span>Commissions</span>{:else}<a href="/commissions">Commissions</a><span>/</span>{#if detail}<a href="/commissions/files">Galleries</a>{:else}<span>Galleries</span>{/if}{/if}</nav>
    <header class="gallery-heading"><div><h1>{title}</h1>{#if meta}<p>{meta}</p>{/if}</div><div class="gallery-heading-actions"><slot name="actions" /></div></header>
    <slot />
  </div>
  <SiteFooter />
</BaseContainer>
