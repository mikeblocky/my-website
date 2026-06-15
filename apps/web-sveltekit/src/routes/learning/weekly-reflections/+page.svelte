<script lang="ts">
  import PageIntro from '$lib/components/PageIntro.svelte';
  import SeoHead from '$lib/components/SeoHead.svelte';
  import WeeklyReflectionsList from '$lib/components/WeeklyReflectionsList.svelte';
  import SiteFooter from '$lib/components/SiteFooter.svelte';

  export let data;
</script>

<SeoHead
  title="Weekly Reflections"
  path="/learning/weekly-reflections"
  image="/learning/opengraph-image.png"
  twitterImage="/learning/twitter-image.png"
/>

<PageIntro
  eyebrow="Weekly Reflections"
  title="Weekly Reflections"
  description="My attempt at documenting, reflecting on, and being grateful for what I learned each week in my pursuit of knowledge."
/>

<WeeklyReflectionsList monthGroups={data.monthGroups} />

<SiteFooter />
