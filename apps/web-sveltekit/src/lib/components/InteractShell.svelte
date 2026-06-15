<script lang="ts">
  import { page } from '$app/stores';
  import PillTabs from './PillTabs.svelte';
  import TalkBoard from './TalkBoard.svelte';
  import DrawBoard from './DrawBoard.svelte';
  import SuggestionsBoard from './SuggestionsBoard.svelte';
  import SketchbookBoard from './SketchbookBoard.svelte';

  const tabs = [
    { id: 'guestbook', label: 'Guestbook board' },
    { id: 'prompts', label: 'Drawing prompts' },
    { id: 'suggestions', label: 'Media suggestions' },
    { id: 'sketchbook', label: 'Sketchbook' }
  ];

  let activeTab = 'guestbook';
  let passcode = '';
  let isAdminMode = false;

  $: hashTab = $page.url.hash.startsWith('#prompt-')
    ? 'prompts'
    : $page.url.hash.startsWith('#talk-')
      ? 'guestbook'
      : $page.url.hash.startsWith('#suggestion-')
        ? 'suggestions'
        : $page.url.hash.startsWith('#drawing-')
          ? 'sketchbook'
          : '';

  // Only react to hash deep-links (e.g. #talk-123); URL tab init is handled by PillTabs onMount
  $: if (hashTab) activeTab = hashTab;
</script>

<section class="interact-shell space-y-8">
  <PillTabs
    bind:activeTab
    {tabs}
    ariaLabel="Interact tabs"
    storageKey="mikeblocky:interact-tab"
    syncUrl
  />
  
  {#key activeTab}
    <div class="interact-tab-panel">
      {#if activeTab === 'guestbook'}
        <TalkBoard bind:isAdminMode bind:passcode />
      {:else if activeTab === 'prompts'}
        <DrawBoard bind:isAdminMode bind:passcode />
      {:else if activeTab === 'suggestions'}
        <SuggestionsBoard bind:isAdminMode bind:passcode />
      {:else if activeTab === 'sketchbook'}
        <SketchbookBoard bind:isAdminMode bind:passcode />
      {/if}
    </div>
  {/key}
</section>
