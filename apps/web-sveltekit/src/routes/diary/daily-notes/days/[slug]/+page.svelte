<script lang="ts">
  import PageIntro from '$lib/components/PageIntro.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';
  export let data: { note: { title: string; description: string; href: string; slug: string; date: string } };
</script>

<SeoHead
  title={data.note.title}
  path={data.note.href}
  image="/diary/opengraph-image.png"
  twitterImage="/diary/twitter-image.png"
/>

<PageIntro
  eyebrow="Daily notes"
  title={data.note.title}
  description={data.note.description}
/>

<section class="prose-panel">
  <p class="text-muted-foreground text-sm font-mono">Content coming soon.</p>
</section>

<SiteFooter />
