<script lang="ts">
  import { page } from '$app/stores';
  import { Home, User, Palette, BookOpen, Users, Heart, MessageCircle, ClipboardList, PanelLeftClose, PanelLeftOpen } from '@lucide/svelte';
  import { navLinks } from '$lib/site';
  import ThemeToggle from './ThemeToggle.svelte';
  export let collapsed = false;
  const icons = [Home, User, Palette, BookOpen, Users, Heart, MessageCircle, ClipboardList];
  $: activeIndex = navLinks.findIndex(link => link.href === '/' ? $page.url.pathname === '/' : $page.url.pathname.startsWith(link.href) || (link.href === '/journal' && /^\/(blog|diary|learning)/.test($page.url.pathname)));
</script>

<aside class="site-sidebar" class:collapsed aria-label="Site navigation">
  <nav class="sidebar-links" id="sidebar-primary-links" aria-label="Primary navigation">
    {#if activeIndex >= 0}<span class="sidebar-selection" style:transform={`translateY(${activeIndex * 48}px)`} aria-hidden="true"></span>{/if}
    {#each navLinks as link, index}
      <a href={link.href} class:active={index === activeIndex} aria-current={index === activeIndex ? 'page' : undefined} aria-label={link.label} title={link.label}>
        <span class="sidebar-icon"><svelte:component this={icons[index]} size={19} strokeWidth={1.7} /></span>
        <span class="sidebar-label">{link.label}</span>
      </a>
    {/each}
  </nav>
  <div class="sidebar-bottom">
    <ThemeToggle />
    <button class="sidebar-collapse" type="button" aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} aria-expanded={!collapsed} on:click={() => collapsed = !collapsed}>
      <span class="sidebar-icon"><svelte:component this={collapsed ? PanelLeftOpen : PanelLeftClose} size={18} /></span><span class="sidebar-label">collapse</span>
    </button>
  </div>
</aside>
