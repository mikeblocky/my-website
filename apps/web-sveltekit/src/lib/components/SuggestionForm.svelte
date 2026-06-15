<script lang="ts">
  import { onMount } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import { Info, Link as LinkIcon, Loader2, ChevronDown } from '@lucide/svelte';
  import AttachmentPreviewGrid from './AttachmentPreviewGrid.svelte';
  import AttachmentUploadButton from './AttachmentUploadButton.svelte';
  import { MAX_ATTACHMENT_COUNT } from '$lib/images/attachment-limits';
  import { prepareImageForUpload } from '$lib/images/prepare-upload';
  import { categories, getAutomaticReference } from '$lib/utils/suggestion-helper';
  import ReferencePreview from './ReferencePreview.svelte';

  export let onSubmit: (payload: {
    title: string;
    category: any;
    reference?: any;
    author: string;
    bestPart: string;
    note: string;
    imageUrls: string[];
  }) => Promise<void>;
  export let isPending = false;
  export let isCooldownActive = false;
  export let cooldownLabel = '';
  export let showNotification: (msg: string) => void;

  let author = '';
  let title = '';
  let category: any = 'manga';
  let referenceUrl = '';
  let note = '';

  let reference: any = undefined;
  let imageUrls: string[] = [];
  let isDropdownOpen = false;
  let isReferenceLoading = false;
  let errorMessage: string | null = null;

  // Debounced automatic URL reference fetching
  let debouncedTimer: any;
  $: {
    const url = referenceUrl.trim();
    if (!url) {
      reference = undefined;
    } else {
      let formattedUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        if (url.includes('.') && !url.includes(' ')) {
          formattedUrl = `https://${url}`;
        } else {
          const autoRef = getAutomaticReference(url, category);
          formattedUrl = autoRef.url || '';
        }
      }

      // Basic URL validation check
      let isValidUrl = false;
      try {
        new URL(formattedUrl);
        isValidUrl = true;
      } catch (_error) {}

      if (isValidUrl) {
        if (debouncedTimer) clearTimeout(debouncedTimer);
        debouncedTimer = setTimeout(() => {
          loadReferenceForUrl(formattedUrl);
        }, 600);
      }
    }
  }

  $: autoReference = (() => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || referenceUrl.trim() || reference) return null;
    return getAutomaticReference(trimmedTitle, category);
  })();

  async function loadReferenceForUrl(url: string) {
    if (!url) return;

    isReferenceLoading = true;
    errorMessage = null;
    try {
      const response = await fetch(`/api/suggestions/reference?url=${encodeURIComponent(url)}`);
      const payload = await response.json();
      if (!response.ok || !payload.reference) {
        throw new Error(payload.error || 'Could not load reference details.');
      }

      reference = payload.reference;
      if (payload.reference.title && !title.trim()) {
        title = payload.reference.title;
      }
      showNotification('Reference details loaded.');
    } catch (error) {
      reference = { url };
      showNotification(error instanceof Error ? error.message : 'Could not load reference details.');
    } finally {
      isReferenceLoading = false;
    }
  }

  async function loadReference() {
    const url = referenceUrl.trim();
    if (!url) return;

    let formattedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      if (url.includes('.') && !url.includes(' ')) {
        formattedUrl = `https://${url}`;
      } else {
        const autoRef = getAutomaticReference(url, category);
        formattedUrl = autoRef.url || '';
      }
    }
    loadReferenceForUrl(formattedUrl);
  }

  async function handleImageUpload(file: File) {
    try {
      const url = await prepareImageForUpload(file);
      imageUrls = imageUrls.length >= MAX_ATTACHMENT_COUNT ? imageUrls : [...imageUrls, url];
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Could not attach image.');
    }
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || isCooldownActive) return;

    const referencePayload = reference || (referenceUrl.trim() ? { url: referenceUrl.trim() } : autoReference || undefined);

    try {
      errorMessage = null;
      await onSubmit({
        title: trimmedTitle,
        category,
        reference: referencePayload,
        author: author.trim(),
        bestPart: '',
        note: note.trim(),
        imageUrls
      });
      author = '';
      title = '';
      category = 'manga';
      referenceUrl = '';
      note = '';
      reference = undefined;
      imageUrls = [];
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unable to send your suggestion.';
    }
  }

  function handleDropdownClick(e: MouseEvent) {
    e.stopPropagation();
    isDropdownOpen = !isDropdownOpen;
  }

  function closeDropdown() {
    isDropdownOpen = false;
  }

  onMount(() => {
    window.addEventListener('click', closeDropdown);
    return () => {
      window.removeEventListener('click', closeDropdown);
      if (debouncedTimer) clearTimeout(debouncedTimer);
    };
  });
</script>

<form
  class="bg-white/40 dark:bg-slate-950/20 rounded-xl border border-slate-200/50 dark:border-slate-850/50 shadow-sm flex flex-col text-left font-sans overflow-hidden pride-focus-within-glow"
  on:submit={handleSubmit}
>
  <div class="grid grid-cols-1 border-b border-slate-100 dark:border-slate-900 bg-slate-50/20 dark:bg-slate-950/20 sm:grid-cols-[1fr_150px] overflow-hidden rounded-t-xl">
    <input
      type="text"
      bind:value={title}
      placeholder="Title of the book, manga, film, anime, album, song..."
      class="min-w-0 border-b border-slate-100 dark:border-slate-900 bg-transparent px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-100 sm:border-b-0 sm:border-r"
      required
    />
    <div class="relative category-dropdown-container w-full sm:w-[150px]">
      <button
        type="button"
        on:click={handleDropdownClick}
        class="flex w-full items-center justify-between bg-transparent px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-355 focus:outline-none cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors h-full border-0"
      >
        <span>{categories.find(c => c.value === category)?.label || category}</span>
        <div
          class="text-slate-500 dark:text-slate-400 shrink-0 transition-transform duration-150 {isDropdownOpen ? 'rotate-180' : ''}"
        >
          <ChevronDown size={14} />
        </div>
      </button>

      {#if isDropdownOpen}
        <div
          transition:slide={{ duration: 150 }}
          class="absolute top-full right-0 z-50 mt-1 w-full sm:w-[180px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-100/40 dark:shadow-none overflow-hidden py-1"
        >
          {#each categories as item}
            <button
              type="button"
              on:click={() => {
                category = item.value;
                isDropdownOpen = false;
              }}
              class="flex w-full items-center px-4 py-2 text-left text-sm font-semibold transition-colors duration-150 cursor-pointer border-0 bg-transparent {category === item.value ? 'bg-slate-50 text-slate-800 dark:bg-slate-950/40 dark:text-slate-200' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-55 dark:hover:bg-slate-800/50'}"
            >
              {item.label}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="grid grid-cols-1 border-b border-slate-100 dark:border-slate-900 sm:grid-cols-[1fr_auto]">
    <input
      type="url"
      bind:value={referenceUrl}
      placeholder="Reference URL (optional, auto-generates if empty)"
      class="min-w-0 bg-transparent px-4 py-3 text-sm text-slate-800 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-100"
    />
    <button
      type="button"
      on:click={loadReference}
      disabled={!referenceUrl.trim() || isReferenceLoading}
      class="flex items-center justify-center gap-2 border-t border-slate-100 dark:border-slate-900 px-4 py-3 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-350 dark:hover:bg-slate-955/30 sm:border-l sm:border-t-0 cursor-pointer border-0 bg-transparent"
    >
      {#if isReferenceLoading}
        <Loader2 size={14} class="animate-spin" />
      {:else}
        <LinkIcon size={14} />
      {/if}
      Load info
    </button>
  </div>

  {#if autoReference}
    <div class="border-b border-slate-100 dark:border-slate-900 px-4 py-2.5 bg-slate-50/10 dark:bg-slate-950/5 flex items-center gap-2 text-xs text-slate-505" transition:fade>
      <Info size={14} class="text-slate-500 shrink-0" />
      <span>Smart link enabled: Will automatically search <strong>{autoReference.siteName}</strong> for <em>"{title}"</em>.</span>
    </div>
  {/if}

  {#if reference}
    <div class="border-b border-slate-100 dark:border-slate-900 px-4 py-3" transition:slide>
      <ReferencePreview {reference} />
    </div>
  {/if}

  <input
    type="text"
    bind:value={author}
    placeholder="Your alias (optional)"
    class="w-full border-b border-slate-100 dark:border-slate-900 bg-transparent px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-100"
  />

  <textarea
    bind:value={note}
    placeholder="Why do you recommend it? (your thoughts, best parts, favorite tracks...)"
    rows={4}
    class="min-h-[120px] w-full resize-none bg-transparent px-4 py-3 text-sm text-slate-850 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-100"
  />

  {#if imageUrls.length > 0}
    <div class="border-t border-slate-100 dark:border-slate-900 px-4 py-3">
      <AttachmentPreviewGrid
        urls={imageUrls}
        onRemove={(index) => (imageUrls = imageUrls.filter((_, itemIndex) => itemIndex !== index))}
        alt="Suggestion attachment"
        compact
      />
    </div>
  {/if}

  <div class="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-900 px-4 py-3 bg-slate-50/20 dark:bg-slate-950/20 sm:flex-row sm:items-center sm:justify-between overflow-hidden rounded-b-xl">
    <AttachmentUploadButton
      onFiles={(files) => files.forEach(handleImageUpload)}
      iconSize={13}
      className="gap-2"
      accent="teal"
    />

    <div class="flex items-center gap-3">
      {#if errorMessage}
        <span class="text-xs text-rose-550">{errorMessage}</span>
      {/if}
      <button
        type="submit"
        disabled={isPending || !title.trim() || isCooldownActive}
        class="rounded-md pride-button h-9 px-4.5 text-xs font-semibold cursor-pointer disabled:opacity-50"
        title={isCooldownActive ? `You can send another suggestion in ${cooldownLabel}` : undefined}
      >
        {isCooldownActive ? cooldownLabel : isPending ? 'Sending...' : 'Send suggestion'}
      </button>
    </div>
  </div>
</form>
