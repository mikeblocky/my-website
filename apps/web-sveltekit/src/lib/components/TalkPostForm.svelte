<script lang="ts">
  import { Bell } from '@lucide/svelte';
  import AttachmentPreviewGrid from './AttachmentPreviewGrid.svelte';
  import AttachmentUploadButton from './AttachmentUploadButton.svelte';
  import EmojiSuggestions from './EmojiSuggestions.svelte';
  import EmojiPickerButton from './EmojiPickerButton.svelte';
  import { emojiAutocomplete } from '$lib/actions/emojiAutocomplete';
  import type { EmojiMatch, EmojiAutocompleteState } from '$lib/actions/emojiAutocomplete';
  import { MAX_ATTACHMENT_COUNT } from '$lib/images/attachment-limits';
  import { prepareImageForUpload } from '$lib/images/prepare-upload';

  export let onSubmit: (payload: { author: string; body: string; imageUrls: string[] }) => Promise<void>;
  export let isPending = false;
  export let isCooldownActive = false;
  export let cooldownLabel = '';
  export let pushSupported = false;
  export let wantNotification = false;
  export let showNotification: (msg: string) => void;

  let author = '';
  let body = '';
  let imageUrls: string[] = [];

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
    const trimmedBody = body.trim();
    if (!trimmedBody || isCooldownActive) return;

    try {
      await onSubmit({ author: author.trim(), body: trimmedBody, imageUrls });
      body = '';
      imageUrls = [];
    } catch (e) {
      // The parent handles error display
    }
  }

  function handleInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  let emojiOpen = false;
  let emojiResults: EmojiMatch[] = [];
  let emojiSelectedIndex = 0;
  let emojiQuery = '';
  let emojiTarget: HTMLTextAreaElement | null = null;

  function onEmojiOpen(e: CustomEvent<EmojiAutocompleteState>) {
    emojiOpen = true;
    emojiResults = e.detail.results;
    emojiSelectedIndex = e.detail.selectedIndex;
    emojiQuery = e.detail.query;
  }
  function onEmojiClose() { emojiOpen = false; emojiResults = []; }
  function onEmojiSelect(match: EmojiMatch) {
    if (emojiTarget) (emojiTarget as any).__emojiSelect(match);
  }
</script>

<form 
  class="bg-white/40 dark:bg-slate-950/20 rounded-xl border border-slate-200/50 dark:border-slate-850/50 shadow-sm flex flex-col text-left overflow-hidden pride-focus-within-glow" 
  on:submit={handleSubmit}
>
  <!-- Top: Alias Field -->
  <div class="border-b border-slate-100 dark:border-slate-900 px-4 py-4 bg-slate-50/20 dark:bg-slate-950/20 rounded-t-xl">
    <input
      type="text"
      bind:value={author}
      placeholder="Your alias (optional)"
      class="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-100 font-sans"
    />
  </div>

  <!-- Middle: Message Field -->
  <div class="px-4 py-4 relative">
    <textarea
      bind:this={emojiTarget}
      bind:value={body}
      on:input={handleInput}
      use:emojiAutocomplete
      on:emoji:open={onEmojiOpen}
      on:emoji:close={onEmojiClose}
      placeholder="Let's talk about anything... (ask questions, ask for suggestions, casual chat)"
      rows={1}
      class="w-full bg-transparent py-2 text-sm text-slate-900 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-600 resize-none overflow-hidden min-h-[100px] font-sans"
    />
    {#if emojiOpen}
      <EmojiSuggestions
        results={emojiResults}
        selectedIndex={emojiSelectedIndex}
        query={emojiQuery}
        onSelect={onEmojiSelect}
      />
    {/if}
  </div>

  <AttachmentPreviewGrid
    urls={imageUrls}
    onRemove={(index) => (imageUrls = imageUrls.filter((_, itemIndex) => itemIndex !== index))}
    className="px-4 pb-3"
  />

  <!-- Bottom: Action Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-100 dark:border-slate-900 px-4 py-4 bg-slate-50/20 dark:bg-slate-950/20 rounded-b-xl">
    <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
      {#if pushSupported}
        <label class="flex items-center gap-2.5 cursor-pointer group/notify select-none">
          <input
            type="checkbox"
            bind:checked={wantNotification}
            class="h-4 w-4 rounded border-slate-350 text-[hsl(var(--pride-glow-val))] focus:ring-0 accent-[hsl(var(--pride-glow-val))] cursor-pointer dark:border-slate-700"
          />
          <span class="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 group-hover/notify:text-[hsl(var(--pride-glow-val))] transition-colors font-sans">
            <Bell size={13} />
            Notify me
          </span>
        </label>
      {/if}

      <EmojiPickerButton getTarget={() => emojiTarget} accent="indigo" />
      <AttachmentUploadButton
        onFiles={(files) => files.forEach(handleImageUpload)}
        iconSize={13}
        className="gap-1.5 text-sm font-semibold font-sans"
        accent="indigo"
      >
        Add images
      </AttachmentUploadButton>
    </div>
    
    <button 
      type="submit" 
      disabled={!body.trim() || isPending || isCooldownActive}
      class="w-full sm:w-auto h-9 px-4.5 text-sm font-semibold rounded-md pride-button cursor-pointer disabled:opacity-50 font-sans"
      title={isCooldownActive ? `You can send another message in ${cooldownLabel}` : undefined}
    >
      {isCooldownActive ? cooldownLabel : 'Post message'}
    </button>
  </div>
</form>
