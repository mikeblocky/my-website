<script lang="ts">
  import SeoHead from '$lib/components/SeoHead.svelte';
  import ZineBookshelf from '$lib/components/ZineBookshelf.svelte';
  import SectionPageShell from '$lib/components/SectionPageShell.svelte';

  export let data;
</script>

<SeoHead title="zine" path="/zine" description="Collected works presented as small page-turning books." />

<SectionPageShell
  title="Zine"
  description="Collected works arranged as handmade books."
  currentLabel="Zine"
  footerColor="blue"
>
  <ZineBookshelf zines={data.zines} />
</SectionPageShell>
