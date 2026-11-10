<script lang="ts">
  import {
    ArrowRight,
    Bird,
    Book,
    BookOpen,
    GitFork,
    Heart,
    Mail,
    MessageSquare,
    Palette,
    PenTool,
    Sparkles,
    User,
    Users
  } from '@lucide/svelte';
  import { portalLinks } from '$lib/site';
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

  const footerLinks = [
    { href: 'mailto:mibeblocky@gmail.com', icon: Mail, label: 'email' },
    { href: 'https://github.com/mikeblocky', icon: GitFork, label: 'github' },
    { href: 'https://x.com/mikeblocky', icon: Bird, label: 'twitter' }
  ];
</script>
<BaseContainer size="lg" paddingX="md" paddingY="lg">
  <div class="sanctuary-home">

    <section class="sanctuary-intro" aria-labelledby="home-title" use:reveal>
      <img class="sanctuary-mark" src="/icon.svg" alt="" width="48" height="48" />
      <h1 id="home-title">mikeblocky.com</h1>
      <p class="sanctuary-lead">Hi, I'm Mike. I'm a Vietnamese artist and a Japanese student.</p>
    </section>

    <figure class="sanctuary-art" use:reveal={80}>
      <a href="/artworks" aria-label="Explore Mike's illustrations">
        <div class="sanctuary-art-crop">
          <img src="/image-cover.png" alt="A drawing of Shima and Mitsumi from January 2025, featuring a quiet sky and soft colors." fetchpriority="high" />
        </div>
      </a>
    </figure>

    <section class="sanctuary-explore" id="explore" aria-labelledby="explore-title">
      <div class="sanctuary-section-heading" use:reveal>
        <h2 id="explore-title">Explore</h2>
      </div>
      <nav aria-label="Explore the archive" class="sanctuary-portals">
        {#each portalLinks as portal, index}
          {@const Icon = portalIcons[portal.icon as keyof typeof portalIcons]}
          <div use:reveal={(index % 2) * 70}>
            <a href={portal.href} class="sanctuary-portal">
              <span class="sanctuary-portal-icon"><svelte:component this={Icon} size={19} strokeWidth={1.5} /></span>
              <span class="sanctuary-portal-copy"><strong>{portal.label}</strong></span>
              <ArrowRight class="sanctuary-arrow" size={17} strokeWidth={1.5} />
            </a>
          </div>
        {/each}
      </nav>
    </section>

    <section class="sanctuary-ongoings" aria-labelledby="ongoings-title">
      <div class="sanctuary-section-heading" use:reveal>
        <h2 id="ongoings-title">Current ongoings</h2>
      </div>
      <div class="sanctuary-work-list">
        {#each currentWork as item, index}
          <div class="sanctuary-work" use:reveal={index * 60}>
            <span class="pride-text"><svelte:component this={item.icon} size={18} strokeWidth={1.5} /></span>
            <p>{item.text}</p>
          </div>
        {/each}
      </div>
    </section>

    <section class="sanctuary-socials" aria-labelledby="socials-title" use:reveal>
      <h2 id="socials-title">Contact</h2>

      <a class="sanctuary-text-link" href="mailto:mibeblocky@gmail.com">mibeblocky@gmail.com <ArrowRight size={16} /></a>
    </section>

    <footer class="sanctuary-footer">
      <span>© {new Date().getFullYear()} mikeblocky.com</span>
      <div>
        {#each footerLinks as link}
          <a href={link.href} aria-label={link.label} target={link.href.startsWith('mailto:') ? undefined : '_blank'} rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}>
            <svelte:component this={link.icon} size={17} strokeWidth={1.5} />
          </a>
        {/each}
      </div>
    </footer>
  </div>
</BaseContainer>
