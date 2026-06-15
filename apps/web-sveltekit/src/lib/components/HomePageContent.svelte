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
  import DesktopNav from './DesktopNav.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import BaseContainer from './BaseContainer.svelte';
  import StackVertical from './StackVertical.svelte';

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
      text: 'Learning Japanese at my own pace, mixing study with music, videos, and whatever helps me get used to the language.'
    },
    {
      icon: Palette,
      text: 'Drawing small, quiet scenes and just trying to make things that feel right to me.'
    },
    {
      icon: PenTool,
      text: 'Writing down thoughts here and there—about life, art, and the stories that stick with me.'
    },
    {
      icon: Sparkles,
      text: 'Working on this site slowly, turning it into a place where I can share things and hopefully connect with people.'
    }
  ];

  const footerLinks = [
    { href: 'mailto:mibeblocky@gmail.com', icon: Mail, label: 'email' },
    { href: 'https://github.com/mikeblocky', icon: GitFork, label: 'github' },
    { href: 'https://x.com/mikeblocky', icon: Bird, label: 'twitter' }
  ];
</script>

<BaseContainer size="lg" paddingX="md" paddingY="lg">
  <div class="flex justify-between items-center mb-8">
    <DesktopNav />
    <div class="ml-auto"><ThemeToggle /></div>
  </div>

  <StackVertical gap="lg">
    <div class="relative pb-8">
      <div class="relative">
        <StackVertical gap="xs">
          <!-- Logo with float animation class -->
          <div class="pride-icon-glow w-10 h-10 sm:w-12 sm:h-12 animate-[float-icon_3s_ease-in-out_infinite]">
            <img src="/icon.svg" alt="mikeblocky" width="48" height="48" class="h-full w-full" />
          </div>

          <div class="relative mb-4 mt-6">
            <h1 class="font-sans font-bold text-slate-900 dark:text-white text-2xl sm:text-3xl md:text-3xl lg:text-4xl">
              mikeblocky.com
            </h1>
          </div>

          <div class="space-y-4">
            <p class="font-mono text-base md:text-[1.0625rem] font-normal text-foreground dark:text-white leading-relaxed">
              Hi, I'm Mike. I'm a Vietnamese artist and a Japanese student, living between drawings and long, wandering thoughts. This website is my small, personal corner of the internet—a slow space where I archive my illustrations, write down reflections, and slowly try to connect.
            </p>

            <!-- Typographic Archive Portals List -->
            <div class="grid grid-cols-1 gap-2 pt-6">
              {#each portalLinks as portal}
                {@const Icon = portalIcons[portal.icon as keyof typeof portalIcons]}
                <a
                  href={portal.href}
                  class="group flex items-center justify-between p-3.5 border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/30 rounded-lg hover:border-[hsl(var(--pride-glow-val))]/30 hover:bg-white/85 dark:hover:bg-slate-900/40 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200"
                >
                  <div class="flex items-center gap-4 min-w-0">
                    <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center border border-slate-100 dark:border-slate-900/50 group-hover:border-[hsl(var(--pride-glow-val))]/20 transition-colors duration-300">
                      <span class="text-muted-foreground/70 group-hover:text-[hsl(var(--pride-glow-val))] transition-colors duration-200">
                        <svelte:component this={Icon} size={16} strokeWidth={1.5} />
                      </span>
                    </div>
                    <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 min-w-0">
                      <span class="font-mono text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-200 group-hover:text-[hsl(var(--pride-glow-val))] transition-colors duration-200">
                        {portal.label}
                      </span>
                      <span class="hidden sm:inline text-slate-300 dark:text-slate-800">—</span>
                      <span class="hidden sm:block font-mono text-xs text-muted-foreground truncate group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors duration-200">
                        {portal.description}
                      </span>
                    </div>
                  </div>
                  <ArrowRight class="w-4 h-4 text-muted-foreground/50 transition-[transform,color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:-translate-y-0.5 group-hover:text-[hsl(var(--pride-glow-val))]" strokeWidth={1.5} />
                </a>
              {/each}
            </div>
          </div>
        </StackVertical>
      </div>

      <div class="mt-8 -mb-8">
        <div class="relative w-full aspect-[4/3] sm:aspect-[2/1] md:aspect-[21/9] rounded-lg overflow-hidden border-0">
          <div class="pride-gradient-line absolute inset-x-0 top-0 z-10 h-1 opacity-70"></div>
          <img
            class="object-cover w-full h-full"
            src="/image-cover.png"
            alt="A drawing of Shima and Mitsumi from January 2025, featuring a quiet sky and soft colors."
          />
        </div>
      </div>
    </div>

    <div>
      <StackVertical gap="none">
        <h2 class="font-sans font-bold text-xl sm:text-2xl md:text-2xl lg:text-3xl mb-3 mt-5 text-foreground dark:text-white">
          Current ongoings
        </h2>
        <StackVertical gap="md">
          {#each currentWork as item, index}
            <div class="group flex items-center gap-3">
              <span class="pride-text transition-colors duration-200 group-hover:text-pink-500 dark:group-hover:text-pink-300">
                <svelte:component this={item.icon} size={16} strokeWidth={1.8} />
              </span>
              <p class="font-mono text-base md:text-[1.0625rem] font-normal text-muted-foreground dark:text-gray-400">
                {item.text}
              </p>
            </div>
          {/each}
        </StackVertical>
      </StackVertical>
    </div>

    <div>
      <h2 class="font-sans font-bold text-xl sm:text-2xl md:text-2xl lg:text-3xl mb-3 mt-5 text-foreground dark:text-white">
        Socials
      </h2>
      <p class="font-mono text-base md:text-[1.0625rem] font-normal text-foreground dark:text-white leading-relaxed">
        I always accept any emails about works and personal stuffs, just email me at
        <a href="mailto:mibeblocky@gmail.com" class="pride-text hover:underline">mibeblocky@gmail.com</a>
        or message via
        <a href="https://x.com/mikeblocky" class="pride-text hover:underline">Twitter</a>.
      </p>
    </div>
  </StackVertical>
</BaseContainer>

<footer class="relative mt-auto pt-12 mt-6">
  <!-- Gradient Line -->
  <div class="relative w-full mb-8">
    <div class="absolute inset-0 w-full h-[1px] bg-gradient-to-r pride-gradient-line opacity-80 dark:opacity-90"></div>
  </div>

  <div class="font-mono w-full max-w-screen-md mx-auto px-4 flex flex-col items-center gap-4 sm:gap-6 text-sm text-muted-foreground/60">
    <div class="flex items-center justify-center gap-6 sm:gap-8">
      <!-- Social Links -->
      <div class="flex items-center gap-6">
        {#each footerLinks as link, index}
          <div class="hover:-translate-y-0.5 active:scale-95 transition-all duration-200">
            <a
              href={link.href}
              aria-label={link.label}
              target={link.href.startsWith('mailto:') ? undefined : '_blank'}
              rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}
              class="block pride-text transition-all duration-200 -m-2 p-2 hover:bg-pink-400/10 rounded-md hover:shadow-md hover:shadow-pink-500/5"
            >
              <svelte:component this={link.icon} size={16} strokeWidth={1.8} />
            </a>
          </div>
        {/each}
      </div>

      <!-- Copyright -->
      <span class="pride-text text-[10px] sm:text-xs">
        © {new Date().getFullYear()} mikeblocky.com
      </span>
    </div>
  </div>

  <!-- Bottom padding -->
  <div class="h-8" />
</footer>
