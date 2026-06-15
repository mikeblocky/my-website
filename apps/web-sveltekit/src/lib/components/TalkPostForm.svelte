<script lang="ts">
  import { Bell } from '@lucide/svelte';
  import AttachmentPreviewGrid from './AttachmentPreviewGrid.svelte';
  import AttachmentUploadButton from './AttachmentUploadButton.svelte';
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
</script>

<form 
  class="bg-white/40 dark:bg-slate-950/20 rounded-xl border border-slate-200/50 dark:border-slate-850/50 shadow-sm flex flex-col text-left overflow-hidden pride-focus-within-glow" 
  on:submit={handleSubmit}
>
  <!-- Top: Alias Field -->
  <div class="border-b border-slate-100 dark:border-slate-900 px-4 py-3 bg-slate-50/20 dark:bg-slate-950/20 rounded-t-xl">
    <input
      type="text"
      bind:value={author}
      placeholder="Your alias (optional)"
      class="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder:text-muted-foreground/60 focus:outline-none dark:text-slate-100 font-sans"
    />
  </div>

  <!-- Middle: Message Field -->
  <div class="px-4 py-2">
    <textarea
      bind:value={body}
      on:input={handleInput}
      placeholder="Let's talk about anything... (ask questions, ask for suggestions, casual chat)"
      rows={1}
      class="w-full bg-transparent py-2 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder:text-slate-600 resize-none overflow-hidden min-h-[100px] font-sans"
    />
  </div>

  <AttachmentPreviewGrid
    urls={imageUrls}
    onRemove={(index) => (imageUrls = imageUrls.filter((_, itemIndex) => itemIndex !== index))}
    className="px-4 pb-3"
  />

  <!-- Bottom: Action Bar -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-slate-100 dark:border-slate-900 px-4 py-3.5 bg-slate-50/20 dark:bg-slate-950/20 rounded-b-xl">
    <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
      {#if pushSupported}
        <label class="flex items-center gap-2.5 cursor-pointer group/notify select-none">
          <input
            type="checkbox"
            bind:checked={wantNotification}
            class="h-4 w-4 rounded border-slate-350 text-[hsl(var(--pride-glow-val))] focus:ring-0 accent-[hsl(var(--pride-glow-val))] cursor-pointer dark:border-slate-700"
          />
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 group-hover/notify:text-[hsl(var(--pride-glow-val))] transition-colors font-sans">
            <Bell size={13} />
            Notify me
          </span>
        </label>
      {/if}

      <AttachmentUploadButton
        onFiles={(files) => files.forEach(handleImageUpload)}
        iconSize={13}
        className="gap-1.5 text-xs font-semibold font-sans"
        accent="blue"
      >
        Add images
      </AttachmentUploadButton>
    </div>
    
    <button 
      type="submit" 
      disabled={!body.trim() || isPending || isCooldownActive}
      class="w-full sm:w-auto h-9 px-4.5 text-xs font-semibold rounded-md pride-button cursor-pointer disabled:opacity-50 font-sans"
      title={isCooldownActive ? `You can send another message in ${cooldownLabel}` : undefined}
    >
      {isCooldownActive ? cooldownLabel : 'Post message'}
    </button>
  </div>
</form>
