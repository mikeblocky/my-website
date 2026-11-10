<script lang="ts">
  import { page } from '$app/stores';
  import { Home, User, Palette, BookOpen, Users, Heart, MessageCircle, PanelLeftClose, PanelLeftOpen, Menu, X } from '@lucide/svelte';
  import { navLinks } from '$lib/site';
  import ThemeToggle from './ThemeToggle.svelte';
  export let collapsed = false;
  let mobileExpanded = false;
  const icons = [Home, User, Palette, BookOpen, Users, Heart, MessageCircle];
  $: activeIndex = navLinks.findIndex(link => link.href === '/' ? $page.url.pathname === '/' : $page.url.pathname.startsWith(link.href) || (link.href === '/journal' && /^\/(blog|diary|learning)/.test($page.url.pathname)));
</script>

<svelte:window on:keydown={(event) => { if (event.key === 'Escape') mobileExpanded = false; }} />
{#if mobileExpanded}<button class="sidebar-backdrop" type="button" aria-label="Close navigation" on:click={() => mobileExpanded = false}></button>{/if}
<aside class="site-sidebar" class:collapsed class:mobile-open={mobileExpanded} aria-label="Site navigation">
  <a class="sidebar-identity" href="/" on:click={() => mobileExpanded = false} aria-label="Mike's homepage">
    <img src="/mike-avatar.jpg" width="40" height="40" alt="Mike" />
    <span class="sidebar-label"><strong>Mike</strong><small>mikeblocky.com</small></span>
  </a>
  <button class="sidebar-mobile-toggle" type="button" aria-label={mobileExpanded ? 'Close menu' : 'Open menu'} aria-expanded={mobileExpanded} aria-controls="sidebar-primary-links" on:click={() => mobileExpanded = !mobileExpanded}>
    <span class="sidebar-icon"><svelte:component this={mobileExpanded ? X : Menu} size={19} /></span><span class="sidebar-label">Menu</span>
  </button>
  <nav class="sidebar-links" id="sidebar-primary-links" aria-label="Primary navigation">
    {#if activeIndex >= 0}<span class="sidebar-selection" style:transform={`translateY(${activeIndex * 48}px)`} aria-hidden="true"></span>{/if}
    {#each navLinks as link, index}
      <a href={link.href} on:click={() => mobileExpanded = false} class:active={index === activeIndex} aria-current={index === activeIndex ? 'page' : undefined} aria-label={link.label} title={link.label} style={`--nav-order: ${index}`}>
        <span class="sidebar-icon"><svelte:component this={icons[index]} size={19} strokeWidth={1.7} /></span>
        <span class="sidebar-label">{link.label}</span>
      </a>
    {/each}
  </nav>
  <div class="sidebar-bottom">
    <ThemeToggle />
    <button class="sidebar-collapse" type="button" aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} aria-expanded={!collapsed} on:click={() => collapsed = !collapsed}>
      <svelte:component this={collapsed ? PanelLeftOpen : PanelLeftClose} size={18} /><span class="sidebar-label">Collapse</span>
    </button>
  </div>
</aside>
