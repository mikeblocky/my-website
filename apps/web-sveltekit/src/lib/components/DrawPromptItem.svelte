<script lang="ts">
  import { Camera, CornerDownRight, MessageSquareReply, Bell, Share2 } from '@lucide/svelte';
  import RichText from './RichText.svelte';
  import ImageGallery from './ImageGallery.svelte';
  import AttachmentPreviewGrid from './AttachmentPreviewGrid.svelte';
  import AttachmentUploadButton from './AttachmentUploadButton.svelte';
  import BoardThreadBubble from './BoardThreadBubble.svelte';
  import EmojiSuggestions from './EmojiSuggestions.svelte';
  import EmojiPickerButton from './EmojiPickerButton.svelte';
  import { emojiAutocomplete } from '$lib/actions/emojiAutocomplete';
  import type { EmojiMatch, EmojiAutocompleteState } from '$lib/actions/emojiAutocomplete';
  import { MAX_ATTACHMENT_COUNT } from '$lib/images/attachment-limits';
  import { prepareImageForUpload } from '$lib/images/prepare-upload';
  import { formatBoardDate as formatDate, formatBoardDateCompact as formatDateCompact } from '$lib/boards/board-utils';

  export let prompt: any;
  export let isAdminMode = false;
  export let passcode = '';
  export let isPending = false;
  export let buttonFeedback: Record<string, string> = {};
  export let isCooldownActive = false;
  export let cooldownLabel = '';
  export let onShare: (id: string) => void;
  export let onSnap: (id: string) => void;
  export let onReplySubmit: (id: string, body: string, imageUrls: string[]) => Promise<void>;
  export let onFollowUpSubmit: (id: string, body: string, imageUrls: string[]) => Promise<void>;
  export let onEditSubmit: (promptId: string, messageId: string, body: string, imageUrls: string[]) => Promise<void>;
  export let showNotification: (msg: string) => void;

  let editingMessageId: string | null = null;
  let editBody = '';
  let editImageUrls: string[] = [];
  
  let isReplying = false;
  let replyBody = '';
  let replyImageUrls: string[] = [];

  let isFollowingUp = false;
  let followUpBody = '';
  let followUpImageUrls: string[] = [];

  async function handleImageUpload(file: File, callback: (url: string) => void) {
    try {
      callback(await prepareImageForUpload(file));
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Could not attach image.');
    }
  }

  function handleReplyClick() {
    isReplying = !isReplying;
    replyBody = '';
    replyImageUrls = [];
    isFollowingUp = false;
  }

  function handleFollowUpClick() {
    isFollowingUp = !isFollowingUp;
    followUpBody = '';
    followUpImageUrls = [];
    isReplying = false;
  }

  async function handleReplyFormSubmit() {
    if (!replyBody.trim()) return;
    try {
      await onReplySubmit(prompt.id, replyBody, replyImageUrls);
      isReplying = false;
      replyBody = '';
      replyImageUrls = [];
    } catch (e) {
      // Handled in parent
    }
  }

  async function handleFollowUpFormSubmit() {
    if (!followUpBody.trim() || isCooldownActive) return;
    try {
      await onFollowUpSubmit(prompt.id, followUpBody, followUpImageUrls);
      isFollowingUp = false;
      followUpBody = '';
      followUpImageUrls = [];
    } catch (e) {
      // Handled in parent
    }
  }

  async function handleEditFormSubmit(messageId: string) {
    if (!editBody.trim()) return;
    try {
      await onEditSubmit(prompt.id, messageId, editBody, editImageUrls);
      editingMessageId = null;
      editBody = '';
      editImageUrls = [];
    } catch (e) {
      // Handled in parent
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
  let replyTextareaEl: HTMLTextAreaElement;
  let followUpTextareaEl: HTMLTextAreaElement;

  function onEmojiOpen(e: CustomEvent<EmojiAutocompleteState>, el: HTMLTextAreaElement) {
    emojiTarget = el;
    emojiOpen = true;
    emojiResults = e.detail.results;
    emojiSelectedIndex = e.detail.selectedIndex;
    emojiQuery = e.detail.query;
  }
  function onEmojiClose() { emojiOpen = false; emojiResults = []; }
  function onEmojiSelect(match: EmojiMatch) {
    if (emojiTarget) (emojiTarget as any).__emojiSelect(match);
  }

  $: thread = prompt.thread || [];
</script>

<article 
  id={`prompt-${prompt.id}`} 
  class="group relative rounded-xl border border-slate-200/50 dark:border-slate-850/50 bg-white/40 dark:bg-slate-950/20 p-4 sm:p-6 transition-all duration-200 hover:bg-white/65 dark:hover:bg-slate-950/35 shadow-none text-left"
>
  <div class="flex flex-col gap-4">
    <!-- Original prompt -->
    <div class="flex gap-3 sm:gap-4">
      <!-- Left Column: Avatar & Thread Line -->
      <div class="flex flex-col items-center shrink-0">
        <div class="w-9 sm:w-12 flex justify-center">
          <div class="w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-violet-200/30 dark:border-violet-900/30 overflow-hidden select-none">
            <img src="/q.jpg" alt="Question Avatar" class="w-full h-full object-cover" />
          </div>
        </div>
        {#if thread.length > 0 || isReplying || isFollowingUp}
          <div class="w-0.5 bg-slate-200 dark:bg-slate-800 flex-grow mt-2 -mb-8 rounded-full"></div>
        {/if}
      </div>

      <!-- Right Column: Content -->
      <div class="flex-1 min-w-0">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1.5 gap-1 sm:gap-2">
          <span class="text-sm font-bold tracking-wider text-violet-600 dark:text-violet-300 truncate font-sans">
            {prompt.author || 'anonymous'}
          </span>
          <div class="flex items-center gap-1">
            <div class="flex items-center mr-1 shrink-0" title="Notifications active (strict)">
              <div class="relative flex items-center justify-center w-6 h-6 rounded-full bg-violet-50 dark:bg-violet-500/10">
                <Bell size={14} class="text-violet-600 dark:text-violet-400 fill-violet-600/10" />
                <span class="absolute top-0 right-0 h-2 w-2 rounded-full bg-violet-600 border-2 border-white dark:border-slate-900 animate-pulse"></span>
              </div>
            </div>
            <span class="text-xs text-muted-foreground whitespace-nowrap shrink-0 font-sans">
              <span class="hidden sm:inline">{formatDate(prompt.createdAt)}</span>
              <span class="inline sm:hidden">{formatDateCompact(prompt.createdAt)}</span>
            </span>
          </div>
        </div>

        <!-- Tags for Character and Media -->
        {#if prompt.character || prompt.media}
          <div class="flex flex-wrap gap-2 mb-2">
            {#if prompt.character}
              <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-50/50 text-violet-750 border border-violet-200/55 dark:bg-violet-900/10 dark:text-violet-300 dark:border-violet-800/40 font-mono">
                👤 {prompt.character}
              </span>
            {/if}
            {#if prompt.media}
              <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50/50 text-indigo-750 border border-indigo-200/55 dark:bg-indigo-900/10 dark:text-indigo-300 dark:border-indigo-800/40 font-mono">
                🎬 {prompt.media}
              </span>
            {/if}
          </div>
        {/if}
        
        <div class="text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-medium mb-3 break-words font-sans">
          <RichText text={prompt.body} theme="violet" />
        </div>

        <!-- Image Attachment -->
        <ImageGallery 
          urls={prompt.imageUrls?.length ? prompt.imageUrls : (prompt.imageUrl ? [prompt.imageUrl] : [])} 
          theme="violet"
        />

        {#if thread.length === 0}
          <div class="prompt-actions mt-3 flex flex-wrap gap-4 opacity-100 transition-all">
            <button
              on:click={() => onShare(prompt.id)}
              class="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-150 cursor-pointer border-0 bg-transparent"
            >
              <Share2 size={13} />
              <span>{buttonFeedback[`share-${prompt.id}`] || 'Share'}</span>
            </button>
            <button
              on:click={() => onSnap(prompt.id)}
              class="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-150 cursor-pointer border-0 bg-transparent"
            >
              <Camera size={13} />
              <span>{buttonFeedback[`snap-${prompt.id}`] || 'Snap'}</span>
            </button>
            <button
              on:click={handleFollowUpClick}
              class="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-450 hover:underline transition-all cursor-pointer border-0 bg-transparent"
            >
              <CornerDownRight size={13} />
              <span>Follow up</span>
            </button>
            {#if isAdminMode}
              <button
                on:click={handleReplyClick}
                class="flex items-center gap-1.5 text-xs font-mono font-medium text-violet-655 dark:text-violet-455 hover:underline transition-colors duration-150 cursor-pointer border-0 bg-transparent"
              >
                <MessageSquareReply size={13} />
                <span>Reply (Admin)</span>
              </button>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- Thread messages -->
    {#if thread.length > 0}
      <div class="space-y-4">
        {#each thread as msg, i (msg.id)}
          <BoardThreadBubble
            message={msg} 
            depth={i} 
            author={prompt.author}
            theme="violet"
            isEditing={editingMessageId === msg.id}
            bind:editBody
            bind:editImageUrls
            onEditClick={() => {
              editingMessageId = msg.id;
              editBody = msg.body;
              const mergedUrls = msg.imageUrls?.length 
                ? msg.imageUrls 
                : (msg.imageUrl ? [msg.imageUrl] : []);
              editImageUrls = mergedUrls;
              isReplying = false;
              isFollowingUp = false;
            }}
            onCancel={() => (editingMessageId = null)}
            onSave={() => handleEditFormSubmit(msg.id)}
            bind:passcode
            {isPending}
            isLast={i === thread.length - 1 && !isReplying && !isFollowingUp}
            {isAdminMode}
          >
            <svelte:fragment slot="actions">
              {#if i === thread.length - 1}
                <div class="prompt-actions mt-3 flex flex-wrap gap-4 opacity-100 transition-all">
                  <button
                    on:click={() => onShare(prompt.id)}
                    class="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-150 cursor-pointer border-0 bg-transparent"
                  >
                    <Share2 size={13} />
                    <span>{buttonFeedback[`share-${prompt.id}`] || 'Share'}</span>
                  </button>
                  <button
                    on:click={() => onSnap(prompt.id)}
                    class="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-150 cursor-pointer border-0 bg-transparent"
                  >
                    <Camera size={13} />
                    <span>{buttonFeedback[`snap-${prompt.id}`] || 'Snap'}</span>
                  </button>
                  <button
                    on:click={handleFollowUpClick}
                    class="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-450 hover:underline transition-all cursor-pointer border-0 bg-transparent"
                  >
                    <CornerDownRight size={13} />
                    <span>Follow up</span>
                  </button>
                  {#if isAdminMode}
                    <button
                      on:click={handleReplyClick}
                      class="flex items-center gap-1.5 text-xs font-mono font-medium text-violet-655 dark:text-violet-455 hover:underline transition-colors duration-150 cursor-pointer border-0 bg-transparent"
                    >
                      <MessageSquareReply size={13} />
                      <span>Reply (Admin)</span>
                    </button>
                  {/if}
                </div>
              {/if}
            </svelte:fragment>
          </BoardThreadBubble>
        {/each}
      </div>
    {/if}

    <!-- Admin reply form -->
    {#if isReplying}
      <div class="flex gap-3 sm:gap-4 border-t border-slate-100/50 dark:border-slate-800/50 pt-3">
        <div class="flex flex-col items-center shrink-0">
          <div class="w-9 sm:w-12 flex justify-center">
            <div class="w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-black/[0.04] overflow-hidden select-none">
              <img src="/a.jpg" alt="Response Avatar" class="w-full h-full object-cover" />
            </div>
          </div>
          {#if !isFollowingUp}
            <div class="w-0.5 bg-slate-200 dark:bg-slate-800 flex-grow mt-2 -mb-8 rounded-full"></div>
          {/if}
        </div>
        <div class="flex-1 min-w-0">
          <div class="relative">
            <textarea
              bind:this={replyTextareaEl}
              bind:value={replyBody}
              on:input={handleInput}
              use:emojiAutocomplete
              on:emoji:open={(e) => onEmojiOpen(e, replyTextareaEl)}
              on:emoji:close={onEmojiClose}
              placeholder="Write your answer..."
              rows={1}
              class="min-h-[44px] w-full resize-none overflow-hidden rounded-md border border-border bg-background pl-4 pr-11 py-3 text-base md:text-[17px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-350 dark:text-slate-100 font-sans"
            />
            <div class="absolute right-2 top-1/2 -translate-y-1/2">
              <EmojiPickerButton getTarget={() => replyTextareaEl} accent="violet" />
            </div>
            {#if emojiOpen && emojiTarget === replyTextareaEl}
              <EmojiSuggestions results={emojiResults} selectedIndex={emojiSelectedIndex} query={emojiQuery} onSelect={onEmojiSelect} anchorEl={replyTextareaEl} />
            {/if}
          </div>
          <AttachmentPreviewGrid
            urls={replyImageUrls}
            onRemove={(index) => (replyImageUrls = replyImageUrls.filter((_, itemIndex) => itemIndex !== index))}
            alt="Reply attachment"
            className="mt-2.5"
            compact
          />
          <div class="mt-2 flex justify-between items-center gap-2">
            <div class="flex items-center gap-3">
              <input 
                type="password"
                bind:value={passcode}
                placeholder="Passcode"
                class="w-24 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-300 dark:text-slate-100"
              />
              <AttachmentUploadButton
                onFiles={(files) => files.forEach(file => {
                  handleImageUpload(file, (url) => (replyImageUrls = replyImageUrls.length >= MAX_ATTACHMENT_COUNT ? replyImageUrls : [...replyImageUrls, url]));
                })}
                accent="violet"
              />
            </div>
            <div class="flex gap-2">
              <button 
                type="button" 
                on:click={() => (isReplying = false)} 
                class="text-xs h-8 px-3 rounded border border-transparent bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                disabled={isPending || !replyBody.trim()} 
                on:click={handleReplyFormSubmit} 
                class="h-8 rounded px-4 text-xs bg-violet-600 hover:bg-violet-700 text-white cursor-pointer disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Visitor follow-up form -->
    {#if isFollowingUp}
      <div class="flex gap-3 sm:gap-4 border-t border-slate-100/50 dark:border-slate-800/50 pt-3">
        <div class="flex flex-col items-center shrink-0">
          <div class="w-9 sm:w-12 flex justify-center">
            <div class="w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-black/[0.04] overflow-hidden select-none">
              <img src="/q.jpg" alt="Question Avatar" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="relative">
            <textarea
              bind:this={followUpTextareaEl}
              bind:value={followUpBody}
              on:input={handleInput}
              use:emojiAutocomplete
              on:emoji:open={(e) => onEmojiOpen(e, followUpTextareaEl)}
              on:emoji:close={onEmojiClose}
              placeholder="Ask a follow-up..."
              rows={1}
              class="min-h-[44px] w-full resize-none overflow-hidden rounded-md border border-emerald-250 bg-background pl-4 pr-11 py-3 text-base md:text-[17px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-350 dark:border-emerald-500/30 dark:text-slate-100 font-sans"
            />
            <div class="absolute right-2 top-1/2 -translate-y-1/2">
              <EmojiPickerButton getTarget={() => followUpTextareaEl} accent="emerald" />
            </div>
            {#if emojiOpen && emojiTarget === followUpTextareaEl}
              <EmojiSuggestions results={emojiResults} selectedIndex={emojiSelectedIndex} query={emojiQuery} onSelect={onEmojiSelect} anchorEl={followUpTextareaEl} />
            {/if}
          </div>
          <AttachmentPreviewGrid
            urls={followUpImageUrls}
            onRemove={(index) => (followUpImageUrls = followUpImageUrls.filter((_, itemIndex) => itemIndex !== index))}
            alt="Follow-up attachment"
            className="mt-2.5"
            compact
          />
          <div class="mt-2 flex justify-between items-center gap-2">
            <div class="flex items-center gap-3">
              <AttachmentUploadButton
                onFiles={(files) => files.forEach(file => {
                  handleImageUpload(file, (url) => (followUpImageUrls = followUpImageUrls.length >= MAX_ATTACHMENT_COUNT ? followUpImageUrls : [...followUpImageUrls, url]));
                })}
                accent="emerald"
              />
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                on:click={() => (isFollowingUp = false)} 
                class="text-xs h-8 px-3 rounded border border-transparent bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button" 
                disabled={isPending || !followUpBody.trim() || isCooldownActive} 
                on:click={handleFollowUpFormSubmit} 
                class="h-8 rounded px-4 text-xs bg-emerald-650 hover:bg-emerald-750 text-white cursor-pointer disabled:opacity-50"
                title={isCooldownActive ? `You can send another prompt in ${cooldownLabel}` : undefined}
              >
                {isCooldownActive ? cooldownLabel : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</article>
