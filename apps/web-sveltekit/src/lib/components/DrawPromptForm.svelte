<script lang="ts">
  import AttachmentPreviewGrid from './AttachmentPreviewGrid.svelte';
  import AttachmentUploadButton from './AttachmentUploadButton.svelte';
  import EmojiSuggestions from './EmojiSuggestions.svelte';
  import EmojiPickerButton from './EmojiPickerButton.svelte';
  import { emojiAutocomplete } from '$lib/actions/emojiAutocomplete';
  import type { EmojiMatch, EmojiAutocompleteState } from '$lib/actions/emojiAutocomplete';
  import { MAX_ATTACHMENT_COUNT } from '$lib/images/attachment-limits';
  import { prepareImageForUpload } from '$lib/images/prepare-upload';

  export let onSubmit: (payload: { author: string; body: string; character: string; media: string; imageUrls: string[] }) => Promise<void>;
  export let isPending = false;
  export let isCooldownActive = false;
  export let cooldownLabel = '';
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
      await onSubmit({
        author: author.trim(),
        body: trimmedBody,
        character: '',
        media: '',
        imageUrls
      });
      body = '';
      imageUrls = [];
    } catch (e) {
      // Parent handles showing error
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
  let bodyTextareaEl: HTMLTextAreaElement;

  function onEmojiOpen(e: CustomEvent<EmojiAutocompleteState>) {
    emojiOpen = true;
    emojiResults = e.detail.results;
    emojiSelectedIndex = e.detail.selectedIndex;
    emojiQuery = e.detail.query;
  }
  function onEmojiClose() { emojiOpen = false; emojiResults = []; }
  function onEmojiSelect(match: EmojiMatch) {
    if (bodyTextareaEl) (bodyTextareaEl as any).__emojiSelect(match);
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

  <!-- Middle: Prompt Field -->
  <div class="px-4 py-4 relative">
    <textarea
      bind:this={bodyTextareaEl}
      bind:value={body}
      on:input={handleInput}
      use:emojiAutocomplete
      on:emoji:open={onEmojiOpen}
      on:emoji:close={onEmojiClose}
      placeholder="Suggest a drawing prompt... (describe characters, actions, or series here)"
      rows={1}
      class="w-full bg-transparent py-2 text-sm text-slate-900 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-600 resize-none overflow-hidden min-h-[100px] font-sans"
    />
    {#if emojiOpen}
      <EmojiSuggestions results={emojiResults} selectedIndex={emojiSelectedIndex} query={emojiQuery} onSelect={onEmojiSelect} anchorEl={bodyTextareaEl} />
    {/if}
  </div>

  <!-- Attachment thumbnails -->
  <AttachmentPreviewGrid
    urls={imageUrls}
    onRemove={(index) => (imageUrls = imageUrls.filter((_, itemIndex) => itemIndex !== index))}
    className="px-4 pb-3"
  />

  <!-- Bottom: Action Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-100 dark:border-slate-900 px-4 py-4 bg-slate-50/20 dark:bg-slate-950/20 rounded-b-xl">
    <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
      <EmojiPickerButton getTarget={() => bodyTextareaEl} accent="violet" />
      <AttachmentUploadButton
        onFiles={(files) => files.forEach(handleImageUpload)}
        iconSize={13}
        className="gap-1.5 text-sm font-semibold font-sans"
        accent="violet"
      >
        Add images
      </AttachmentUploadButton>
    </div>
    
    <button 
      type="submit" 
      disabled={!body.trim() || isPending || isCooldownActive}
      class="w-full sm:w-auto h-9 px-4.5 text-sm font-semibold rounded-md pride-button cursor-pointer disabled:opacity-50 font-sans"
      title={isCooldownActive ? `You can send another prompt in ${cooldownLabel}` : undefined}
    >
      {isCooldownActive ? cooldownLabel : 'Send prompt'}
    </button>
  </div>
</form>
