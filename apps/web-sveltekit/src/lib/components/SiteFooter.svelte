<script lang="ts">
  import { page } from '$app/stores';
  import { Bird, GitFork, Mail } from '@lucide/svelte';
  import { cn } from '@/lib/utils/utils';

  export let color = 'blue';
  export let spacing: 'default' | 'compact' | 'none' = 'default';
  
  const socials = [
    { href: 'mailto:me@mikeblocky.com', label: 'email', icon: Mail },
    { href: 'https://github.com/mikeblocky', label: 'github', icon: GitFork },
    { href: 'https://x.com/mikeblocky', label: 'twitter', icon: Bird }
  ];

  $: pathname = $page.url.pathname;
  $: isHomepage = pathname === '/' || pathname === '/homepage';
  $: parent = isHomepage ? null : getParentLink(pathname);
  $: links = isHomepage
    ? []
    : parent
      ? [parent, { href: '/', label: 'Homepage' }]
      : [{ href: '/', label: 'Homepage' }];

  function getParentLink(pathname: string) {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length <= 1) return null;

    if (parts[0] === 'blog') return { href: '/journal', label: 'Journal' };
    if (parts[0] === 'learning') return { href: '/learning', label: 'Learning' };
    if (parts[0] === 'notes') return { href: '/notes', label: 'Notes' };
    if (parts[0] === 'draw') return { href: '/draw', label: 'Draw' };
    if (parts[0] === 'talk') return { href: '/talk', label: 'Talk' };
    if (parts[0] === 'suggestions') return { href: '/suggestions', label: 'Suggestions' };
    if (parts[0] === 'sketchbook') return { href: '/sketchbook', label: 'Sketchbook' };
    if (parts[0] === 'artworks') return { href: '/artworks', label: 'Gallery' };
    if (parts[0] === 'diary') return { href: '/diary', label: 'Diary' };

    return null;
  }

  $: paddingTopClass = spacing === 'compact' ? 'pt-6' : spacing === 'none' ? 'pt-0' : 'pt-12';
  $: bottomSpacerClass = spacing === 'compact' ? 'h-4' : spacing === 'none' ? 'h-0' : 'h-8';
</script>

<footer class={cn("relative mt-auto w-full", paddingTopClass)}>
  <!-- Gradient Line -->
  <div class="relative w-full mb-8">
    <div class={cn(
      "absolute inset-0 w-full h-[1px] bg-gradient-to-r pride-gradient-line opacity-80",
      color === 'blue' && "dark:opacity-90",
      color === 'green' && "dark:via-green-400/30"
    )} />
  </div>

  <div class="w-full max-w-screen-md mx-auto px-4 flex flex-col items-center gap-4 sm:gap-6 text-sm text-muted-foreground/60 font-mono">
    <!-- Navigation Links -->
    {#if links.length > 0}
      <div class="flex flex-wrap items-center justify-center gap-x-3">
        {#each links as link, index}
          <a
            href={link.href}
            class={cn(
              "hover:text-foreground transition-colors duration-200",
              color === 'blue' && "hover:text-blue-500",
              color === 'green' && "hover:text-green-500",
              color === 'violet' && "hover:text-violet-500",
              color === 'amber' && "hover:text-amber-500"
            )}
          >
            {link.label}
          </a>
          {#if index < links.length - 1}
            <span class="opacity-30">/</span>
          {/if}
        {/each}
      </div>
    {/if}

    <!-- Social Links and Copyright -->
    <div class="flex items-center justify-center gap-6 sm:gap-8">
      <div class="flex items-center gap-6">
        {#each socials as social}
          <div class="hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
            <a
              href={social.href}
              target={social.href.startsWith('mailto:') ? undefined : '_blank'}
              rel={social.href.startsWith('mailto:') ? undefined : 'noreferrer'}
              class="block pride-text -m-2 p-2 hover:bg-pink-400/10 rounded-md hover:shadow-md hover:shadow-pink-500/5 transition-all duration-200"
            >
              <svelte:component this={social.icon} class="w-3 h-3 sm:w-4 sm:h-4" />
            </a>
          </div>
        {/each}
      </div>

      <span class="pride-text text-[10px] sm:text-xs">
        © {new Date().getFullYear()} mikeblocky.com
      </span>
    </div>
  </div>

  <!-- Bottom spacer -->
  <div class={bottomSpacerClass} />
</footer>
