<script lang="ts">
  import PageIntro from '$lib/components/PageIntro.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';

  export let data: any;
</script>

<SeoHead
  title={`${data.week.title} | Weekly Reflections`}
  path={data.week.href}
  image="/learning/opengraph-image.png"
  twitterImage="/learning/twitter-image.png"
  description={data.week.description}
/>

<PageIntro
  eyebrow="Weekly Reflections"
  title={data.week.title}
  description={data.week.description}
/>

<section class="prose-panel prose dark:prose-invert max-w-none pb-24 font-sans text-left">
  <svelte:component this={data.content} />
</section>

<SiteFooter />
