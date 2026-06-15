<script lang="ts">
  import SeoHead from '$lib/components/SeoHead.svelte';
  import BlogPostTemplate from '$lib/components/BlogPostTemplate.svelte';
  export let data: { note: { title: string; description: string; href: string; slug: string; date: string } };

  function formatDate(isoString: string): string {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch {
      return isoString;
    }
  }
</script>

<SeoHead
  title={data.note.title}
  path={data.note.href}
  image="/diary/opengraph-image.png"
  twitterImage="/diary/twitter-image.png"
  description={data.note.description}
/>

<BlogPostTemplate
  title={data.note.title}
  date={formatDate(data.note.date)}
  readingTime="1 min read"
  slug={data.note.slug}
  themes={[]}
  parentLabel="Daily notes"
  parentHref="/diary"
>
  <p class="text-muted-foreground text-sm font-mono">Content coming soon.</p>
</BlogPostTemplate>

