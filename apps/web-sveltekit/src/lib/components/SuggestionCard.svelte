<script lang="ts">
  import { Camera, ChevronDown, CornerDownRight, MessageSquareReply, Share2, Star } from '@lucide/svelte';
  import ReferencePreview from './ReferencePreview.svelte';
  import ImageGallery from './ImageGallery.svelte';
  import RichText from './RichText.svelte';
  import AttachmentPreviewGrid from './AttachmentPreviewGrid.svelte';
  import AttachmentUploadButton from './AttachmentUploadButton.svelte';
  import BoardThreadBubble from './BoardThreadBubble.svelte';
  import { MAX_ATTACHMENT_COUNT } from '$lib/images/attachment-limits';
  import { prepareImageForUpload } from '$lib/images/prepare-upload';
  import { formatBoardDate as formatDate, formatBoardDateCompact as formatDateCompact } from '$lib/boards/board-utils';
  import { getStatusConfig, getHighQualitySuggestionImageUrl } from '$lib/utils/suggestion-helper';

  export let suggestion: any;
  export let isAdminMode = false;
  export let activeStatusDropdown: string | null = null;
  export let setActiveStatusDropdown: (id: string | null) => void;
  export let onStatusChange: (id: string, status: string) => void;
  export let passcode = '';
  export let isPending = false;
  export let buttonFeedback: Record<string, string> = {};
  export let onShare: (id: string) => void;
  export let onSnap: (id: string) => void;
  export let onReplySubmit: (id: string, body: string, imageUrls: string[]) => Promise<void>;
  export let onFollowUpSubmit: (id: string, body: string, imageUrls: string[]) => Promise<void>;
  export let onEditSubmit: (suggestionId: string, messageId: string, body: string, imageUrls: string[]) => Promise<void>;
  export let isCooldownActive = false;
  export let cooldownLabel = '';
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

  $: thread = suggestion.thread || [];
  $: canReply = isAdminMode;
  $: cardImageUrl = getHighQualitySuggestionImageUrl(suggestion.reference?.image);
  $: hasCardImage = !!cardImageUrl;

  function getCardBgStyles(status: string | undefined) {
    if (status === 'planning') {
      return 'bg-blue-50/30 dark:bg-blue-950/10 border border-blue-200/50 dark:border-blue-900/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/15';
    }
    if (status === 'progressing') {
      return 'bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/40 hover:bg-amber-50/50 dark:hover:bg-amber-950/15';
    }
    if (status === 'completed') {
      return 'bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-900/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/15';
    }
    if (status === 'dropped') {
      return 'bg-rose-50/20 dark:bg-rose-950/5 border border-rose-200/40 dark:border-rose-900/30 hover:bg-rose-50/30 dark:hover:bg-rose-950/10';
    }
    return 'bg-white/40 dark:bg-slate-950/20 hover:bg-white/65 dark:hover:bg-slate-950/35 border border-slate-200/50 dark:border-slate-850/50';
  }

  async function handleImageUpload(file: File, callback: (url: string) => void) {
    try {
      callback(await prepareImageForUpload(file));
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Could not attach image.');
    }
  }

  function handleInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  async function handleReplyFormSubmit() {
    if (!replyBody.trim()) return;
    try {
      await onReplySubmit(suggestion.id, replyBody, replyImageUrls);
      isReplying = false;
      replyBody = '';
      replyImageUrls = [];
    } catch (e) {}
  }

  async function handleFollowUpFormSubmit() {
    if (!followUpBody.trim() || isCooldownActive) return;
    try {
      await onFollowUpSubmit(suggestion.id, followUpBody, followUpImageUrls);
      isFollowingUp = false;
      followUpBody = '';
      followUpImageUrls = [];
    } catch (e) {}
  }

  async function handleEditFormSubmit(messageId: string) {
    if (!editBody.trim()) return;
    try {
      await onEditSubmit(suggestion.id, messageId, editBody, editImageUrls);
      editingMessageId = null;
      editBody = '';
      editImageUrls = [];
    } catch (e) {}
  }

  $: config = getStatusConfig(suggestion.status, suggestion.category);
</script>

<article
  id={`suggestion-${suggestion.id}`}
  class="group relative overflow-hidden rounded-xl text-left shadow-none transition-all duration-200 {getCardBgStyles(suggestion.status)}"
>
  {#if hasCardImage}
    <div class="relative h-48 w-full bg-slate-100 sm:h-64 dark:bg-slate-900">
      <img
        src={cardImageUrl}
        alt=""
        class="h-full w-full object-cover object-center"
      />
    </div>
  {/if}

  <div class="min-w-0 flex-1 flex flex-col gap-4 p-4 sm:p-6">
    <!-- Original Post -->
    <div class="flex gap-3 sm:gap-4">
      <!-- Left Column: Avatar & Thread Line -->
      <div class="flex flex-col items-center shrink-0">
        <div class="w-9 sm:w-12 flex justify-center">
          <div class="w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-sky-200/30 dark:border-sky-900/30 overflow-hidden select-none">
            <img src="/q.jpg" alt="Question Avatar" class="w-full h-full object-cover" />
          </div>
        </div>
        {#if thread.length > 0 || isReplying || isFollowingUp}
          <div class="w-0.5 bg-slate-200 dark:bg-slate-800 flex-grow mt-2 -mb-8 rounded-full"></div>
        {/if}
      </div>

      <!-- Right Column: Content -->
      <div class="flex-1 min-w-0 space-y-3">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/20 px-1.5 py-0.5 rounded font-mono">
              {suggestion.category}
            </span>
            <span class="text-[10px] sm:text-[11px] text-muted-foreground whitespace-nowrap shrink-0 font-mono">
              <span class="hidden sm:inline">{formatDate(suggestion.createdAt)}</span>
              <span class="inline sm:hidden">{formatDateCompact(suggestion.createdAt)}</span>
            </span>

            {#if config || isAdminMode}
              <div class="relative status-dropdown-container">
                <button
                  type="button"
                  disabled={!isAdminMode}
                  on:click={() => setActiveStatusDropdown(activeStatusDropdown === suggestion.id ? null : suggestion.id)}
                  class="flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold transition-all select-none font-mono {config ? `${config.color} border-slate-200/50 dark:border-slate-880/50` : 'border-dashed border-slate-350 dark:border-slate-700 bg-transparent text-slate-400 hover:text-slate-550 dark:hover:text-slate-355 hover:bg-slate-100/50 dark:hover:bg-slate-900/50'} {isAdminMode ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800' : ''}"
                >
                  <span>{config ? config.label : 'Add Level'}</span>
                  {#if isAdminMode}
                    <ChevronDown size={10} class="text-slate-400" />
                  {/if}
                </button>

                {#if activeStatusDropdown === suggestion.id}
                  <div
                    class="absolute left-0 z-50 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-950"
                  >
                    {#each ['planning', 'progressing', 'completed', 'dropped'] as status}
                      {@const statusConfig = getStatusConfig(status as any, suggestion.category)}
                      <button
                        type="button"
                        on:click={() => {
                          onStatusChange(suggestion.id, status);
                          setActiveStatusDropdown(null);
                        }}
                        class="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-colors cursor-pointer border-0 {suggestion.status === status ? 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200' : 'text-slate-655 hover:bg-slate-55 dark:text-slate-350 dark:hover:bg-slate-900/50 bg-transparent'}"
                      >
                        <span>{statusConfig?.label}</span>
                      </button>
                    {/each}
                  </div>
                {/if}
              </div>
            {/if}
          </div>
          <h3 class="break-words text-lg font-bold text-slate-955 dark:text-slate-50 font-sans">
            {suggestion.title}
          </h3>
          <p class="text-xs text-muted-foreground font-sans">
            suggested by <span class="font-semibold text-sky-700 dark:text-sky-300">{suggestion.author || 'anonymous'}</span>
          </p>
        </div>

        {#if suggestion.reference}
          <ReferencePreview reference={suggestion.reference} compact />
        {/if}

        {#if suggestion.bestPart}
          <div class="rounded-md border border-amber-150/70 bg-amber-50/30 px-3 py-2 dark:border-amber-950/30 dark:bg-amber-950/10 text-left font-sans">
            <div class="mb-1 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
              <Star size={13} class="fill-amber-500/20 text-amber-600 dark:text-amber-400" />
              Best part
            </div>
            <div class="text-base md:text-[17px] leading-relaxed text-slate-700 dark:text-slate-300">
              <RichText text={suggestion.bestPart} theme="sky" />
            </div>
          </div>
        {/if}

        {#if suggestion.note}
          <div class="text-base md:text-[17px] leading-relaxed text-slate-700 dark:text-slate-300 font-sans text-left">
            <RichText text={suggestion.note} theme="sky" />
          </div>
        {/if}

        <ImageGallery
          urls={suggestion.imageUrls?.length ? suggestion.imageUrls : (suggestion.imageUrl ? [suggestion.imageUrl] : [])}
          theme="sky"
        />

        {#if thread.length === 0}
          <div class="suggestion-actions mt-3 flex flex-wrap gap-4 opacity-100 transition-all">
            <button
              type="button"
              on:click={() => onShare(suggestion.id)}
              class="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400 transition-colors duration-150 cursor-pointer border-0 bg-transparent"
            >
              <Share2 size={13} />
              <span>{buttonFeedback[`share-${suggestion.id}`] || 'Share'}</span>
            </button>
            <button
              type="button"
              on:click={() => onSnap(suggestion.id)}
              class="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400 transition-colors duration-150 cursor-pointer border-0 bg-transparent"
            >
              <Camera size={13} />
              <span>{buttonFeedback[`snap-${suggestion.id}`] || 'Snap'}</span>
            </button>
            <button
              type="button"
              on:click={() => {
                isFollowingUp = !isFollowingUp;
                followUpBody = '';
                followUpImageUrls = [];
                isReplying = false;
              }}
              class="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-450 hover:underline transition-all cursor-pointer border-0 bg-transparent"
            >
              <CornerDownRight size={13} />
              <span>Follow up</span>
            </button>
            {#if canReply}
              <button
                type="button"
                on:click={() => {
                  isReplying = !isReplying;
                  replyBody = '';
                  replyImageUrls = [];
                  isFollowingUp = false;
                }}
                class="flex items-center gap-1.5 text-xs font-mono font-medium text-sky-600 dark:text-sky-400 hover:underline transition-colors duration-150 cursor-pointer border-0 bg-transparent"
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
        {#each thread as message, index (message.id)}
          <BoardThreadBubble
            {message}
            depth={index}
            author={suggestion.author}
            theme="sky"
            isEditing={editingMessageId === message.id}
            bind:editBody
            bind:editImageUrls
            onEditClick={() => {
              editingMessageId = message.id;
              editBody = message.body;
              editImageUrls = message.imageUrls || (message.imageUrl ? [message.imageUrl] : []);
              isReplying = false;
              isFollowingUp = false;
            }}
            onCancel={() => {
              editingMessageId = null;
              editBody = '';
              editImageUrls = [];
            }}
            onSave={() => handleEditFormSubmit(message.id)}
            bind:passcode
            {isPending}
            isLast={index === thread.length - 1 && !isReplying && !isFollowingUp}
            {isAdminMode}
          >
            <svelte:fragment slot="actions">
              {#if index === thread.length - 1}
                <div class="suggestion-actions mt-3 flex flex-wrap gap-4 opacity-100 transition-all">
                  <button
                    type="button"
                    on:click={() => onShare(suggestion.id)}
                    class="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400 transition-colors duration-150 cursor-pointer border-0 bg-transparent"
                  >
                    <Share2 size={13} />
                    <span>{buttonFeedback[`share-${suggestion.id}`] || 'Share'}</span>
                  </button>
                  <button
                    type="button"
                    on:click={() => onSnap(suggestion.id)}
                    class="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400 transition-colors duration-150 cursor-pointer border-0 bg-transparent"
                  >
                    <Camera size={13} />
                    <span>{buttonFeedback[`snap-${suggestion.id}`] || 'Snap'}</span>
                  </button>
                  <button
                    type="button"
                    on:click={() => {
                      isFollowingUp = !isFollowingUp;
                      followUpBody = '';
                      followUpImageUrls = [];
                      isReplying = false;
                    }}
                    class="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-450 hover:underline transition-all cursor-pointer border-0 bg-transparent"
                  >
                    <CornerDownRight size={13} />
                    <span>Follow up</span>
                  </button>
                  {#if canReply}
                    <button
                      type="button"
                      on:click={() => {
                        isReplying = !isReplying;
                        replyBody = '';
                        replyImageUrls = [];
                        isFollowingUp = false;
                      }}
                      class="flex items-center gap-1.5 text-xs font-mono font-medium text-sky-600 dark:text-sky-400 hover:underline transition-colors duration-150 cursor-pointer border-0 bg-transparent"
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
        <div class="flex-1 min-w-0 font-sans">
          <textarea
            bind:value={replyBody}
            on:input={handleInput}
            placeholder="Write your response..."
            class="min-h-[44px] w-full resize-none overflow-hidden rounded-md border border-sky-200/70 bg-background px-4 py-3 text-base md:text-[17px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-300 dark:border-sky-500/30 dark:text-slate-100"
          />
          <AttachmentPreviewGrid
            urls={replyImageUrls}
            onRemove={(index) => (replyImageUrls = replyImageUrls.filter((_, itemIndex) => itemIndex !== index))}
            className="mt-2"
            compact
          />
          <div class="flex justify-between items-center gap-2 mt-3.5">
            <div class="flex items-center gap-3">
              <input 
                type="password"
                bind:value={passcode}
                placeholder="Passcode"
                class="w-24 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:text-slate-100"
              />
              <AttachmentUploadButton
                onFiles={(files) => files.forEach(file => {
                  handleImageUpload(file, (url) => (replyImageUrls = replyImageUrls.length >= MAX_ATTACHMENT_COUNT ? replyImageUrls : [...replyImageUrls, url]));
                })}
                accent="sky"
              />
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                on:click={() => {
                  isReplying = false;
                  replyBody = '';
                  replyImageUrls = [];
                }}
                class="text-xs h-8 px-3 rounded border border-transparent bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending || !replyBody.trim()}
                on:click={handleReplyFormSubmit}
                class="h-8 rounded px-4 text-xs bg-sky-600 text-white hover:bg-sky-700 cursor-pointer disabled:opacity-50"
              >
                Send
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
        <div class="flex-1 min-w-0 font-sans">
          <textarea
            bind:value={followUpBody}
            on:input={handleInput}
            placeholder="Write your follow-up message..."
            class="min-h-[44px] w-full resize-none overflow-hidden rounded-md border border-emerald-250 bg-background px-4 py-3 text-base md:text-[17px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-300 dark:border-emerald-500/30 dark:text-slate-100"
          />
          <AttachmentPreviewGrid
            urls={followUpImageUrls}
            onRemove={(index) => (followUpImageUrls = followUpImageUrls.filter((_, itemIndex) => itemIndex !== index))}
            className="mt-2"
            compact
          />
          <div class="flex justify-between items-center gap-2 mt-3.5">
            <AttachmentUploadButton
              onFiles={(files) => files.forEach(file => {
                handleImageUpload(file, (url) => (followUpImageUrls = followUpImageUrls.length >= MAX_ATTACHMENT_COUNT ? followUpImageUrls : [...followUpImageUrls, url]));
              })}
              accent="emerald"
            />
            <div class="flex gap-2">
              <button
                type="button"
                on:click={() => {
                  isFollowingUp = false;
                  followUpBody = '';
                  followUpImageUrls = [];
                }}
                class="text-xs h-8 px-3 rounded border border-transparent bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending || !followUpBody.trim() || isCooldownActive}
                on:click={handleFollowUpFormSubmit}
                class="h-8 rounded px-4 text-xs bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
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
