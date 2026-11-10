<script lang="ts">
  import { reveal } from '../actions/reveal';

  export let eyebrow = '';
  export let title: string;
  export let description = '';
  export let showDescription = false;
  export let showPrideBadge = false;
</script>

<section class="page-intro">
  <div class="section-header-top">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/" class="breadcrumb-home"><img src="/icon.svg" alt="" width="18" height="18" aria-hidden="true" />Home</a>
      {#if eyebrow}
        <span aria-hidden="true">/</span>
        <span>{eyebrow}</span>
      {/if}
    </nav>
  </div>

  <div class="section-title-block" use:reveal>
    <h1>{title}</h1>
    {#if showDescription && description}
      <p>{description}</p>
    {/if}
  </div>
</section>
