<script lang="ts">
  import {
    ArrowRight,
    Book,
    BookOpen,
    Heart,
    MessageSquare,
    Palette,
    PenTool,
    Sparkles,
    User,
    Users
  } from '@lucide/svelte';
  import { portalLinks } from '$lib/site';
  import HomePixelBackground from './HomePixelBackground.svelte';
  import WorldClocks from './WorldClocks.svelte';
  import SiteFooter from './SiteFooter.svelte';
  let backgroundPaused = false;
  import type { BlogPost } from '@mikeblocky/site-data';
  export let artworks: { src: string; label: string; width: number; height: number }[] = [];
  export let artworkCount = 0;
  export let recentPosts: BlogPost[] = [];
  import BaseContainer from './BaseContainer.svelte';
  import { reveal } from '../actions/reveal';

  const portalIcons = {
    user: User,
    palette: Palette,
    book: Book,
    'book-open': BookOpen,
    users: Users,
    heart: Heart,
    message: MessageSquare
  };

  const currentWork = [
    {
      icon: BookOpen,
      text: 'Learning Japanese through study, music, and videos.'
    },
    {
      icon: Palette,
      text: 'Drawing illustrations and character studies.'
    },
    {
      icon: PenTool,
      text: 'Writing about life, art, and the stories I read.'
    },
    {
      icon: Sparkles,
      text: 'Building and updating this site.'
    }
  ];

</script>
<BaseContainer size="lg" paddingX="md" paddingY="lg">
  <div class="sanctuary-home">
    <HomePixelBackground {artworks} paused={backgroundPaused} />

    <header class="home-hero">
      <div class="sanctuary-intro" aria-labelledby="home-title" use:reveal>
        <div class="home-heading-row">
          <img class="sanctuary-mark" data-pixel-glow src="/icon.svg" alt="" width="40" height="40" />
          <h1 id="home-title" data-pixel-glow>mikeblocky.com</h1>
        </div>
        <p class="sanctuary-lead">Hi, I'm Mike. I'm a Vietnamese artist and a Japanese student.</p>
      </div>
      <p class="home-about-note">I draw the characters and everyday moments that stay with me. This is where I collect those drawings, write about the stories I love, and keep a little space for the people I meet along the way.</p>
      <nav class="home-quick-links" aria-label="Start exploring">
        <a data-pixel-glow href="/artworks">gallery <span class="home-link-count">{artworkCount} works</span><ArrowRight size={15} /></a>
        <a data-pixel-glow href="/journal">journal <ArrowRight size={15} /></a>
        <a data-pixel-glow href="/interact">say hello <MessageSquare size={15} /></a>
      </nav>
    </header>

    <section class="home-recent" aria-labelledby="recent-title">
      <div class="sanctuary-section-heading"><h2 id="recent-title">From the journal</h2><a href="/journal">All writing <ArrowRight size={15} /></a></div>
      {#each recentPosts.slice(0, 2) as post}
        <a class="home-journal-note" title={post.title} href={`/blog/posts/${post.slug}`}>
          <span>{post.themes[0]} · {post.readingTime}</span><h3>{post.title}</h3><p>{post.description}</p><ArrowRight size={18} aria-hidden="true" />
        </a>
      {/each}
    </section>

    <section class="sanctuary-explore" id="explore" aria-labelledby="explore-title">
      <div class="sanctuary-section-heading" use:reveal>
        <h2 id="explore-title">Explore</h2>
      </div>
      <nav aria-label="Explore the archive" class="sanctuary-portals">
        {#each portalLinks as portal, index}
          {@const Icon = portalIcons[portal.icon as keyof typeof portalIcons]}
          <div use:reveal={(index % 2) * 70}>
            <a href={portal.href} class="sanctuary-portal" data-pixel-glow>
              <span class="sanctuary-portal-icon"><svelte:component this={Icon} size={19} strokeWidth={1.5} /></span>
              <span class="sanctuary-portal-copy"><strong>{portal.label}</strong><span>{portal.description}</span></span>
              <ArrowRight class="sanctuary-arrow" size={17} strokeWidth={1.5} />
            </a>
          </div>
        {/each}
      </nav>
    </section>

    <div class="home-support">
    <section class="sanctuary-ongoings" aria-labelledby="ongoings-title">
      <div class="sanctuary-section-heading" use:reveal>
        <h2 id="ongoings-title">Currently</h2>
      </div>
      <div class="sanctuary-work-list">
        {#each currentWork as item, index}
          <div class="sanctuary-work" use:reveal={index * 60}>
            <span class="pride-text" data-pixel-glow><svelte:component this={item.icon} size={18} strokeWidth={1.5} /></span>
            <p>{item.text}</p>
          </div>
        {/each}
      </div>
    </section>

      <WorldClocks compact />
    </div>

    <section class="sanctuary-socials" aria-labelledby="socials-title" use:reveal>
      <h2 id="socials-title">Contact</h2>

      <a class="sanctuary-text-link" href="mailto:mibeblocky@gmail.com">mibeblocky@gmail.com <ArrowRight size={16} /></a>
    </section>

    <SiteFooter spacing="none">
      <button slot="controls" class="home-motion-toggle" type="button" aria-pressed={backgroundPaused} on:click={() => backgroundPaused = !backgroundPaused}>{backgroundPaused ? 'play background' : 'pause background'}</button>
    </SiteFooter>
  </div>
</BaseContainer>
