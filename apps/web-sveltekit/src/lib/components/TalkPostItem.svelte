<script lang="ts">
  import { Camera, CornerDownRight, MessageSquareReply, Bell, Share2 } from '@lucide/svelte';
  import RichText from './RichText.svelte';
  import ImageGallery from './ImageGallery.svelte';
  import AttachmentPreviewGrid from './AttachmentPreviewGrid.svelte';
  import AttachmentUploadButton from './AttachmentUploadButton.svelte';
  import BoardThreadBubble from './BoardThreadBubble.svelte';
  import { MAX_ATTACHMENT_COUNT } from '$lib/images/attachment-limits';
  import { prepareImageForUpload } from '$lib/images/prepare-upload';
  import { formatBoardDate as formatDate, formatBoardDateCompact as formatDateCompact } from '$lib/boards/board-utils';

  export let talk: any;
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
  export let onEditSubmit: (talkId: string, messageId: string, body: string, imageUrls: string[]) => Promise<void>;
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
      await onReplySubmit(talk.id, replyBody, replyImageUrls);
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
      await onFollowUpSubmit(talk.id, followUpBody, followUpImageUrls);
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
      await onEditSubmit(talk.id, messageId, editBody, editImageUrls);
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

  $: thread = talk.thread || [];
</script>

<article 
  id={`talk-${talk.id}`} 
  class="group relative rounded-xl border border-slate-200/50 dark:border-slate-850/50 bg-white/40 dark:bg-slate-950/20 p-4 sm:p-6 transition-all duration-200 hover:bg-white/65 dark:hover:bg-slate-950/35 shadow-none text-left"
>
  <div class="flex flex-col gap-4">
    <div class="flex gap-3 sm:gap-4">
      <!-- Left Column: Avatar & Thread Line -->
      <div class="flex flex-col items-center shrink-0">
        <div class="w-9 sm:w-12 flex justify-center">
          <div class="w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-blue-200/30 dark:border-blue-900/30 overflow-hidden select-none">
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
          <span class="text-sm font-bold tracking-wider text-slate-850 dark:text-slate-100 truncate font-sans">
            {talk.author || 'anonymous'}
          </span>
          <div class="flex items-center gap-1">
            {#if talk.notifying}
              <Bell size={13} class="text-blue-650 dark:text-blue-450 fill-blue-500/10 mr-1 shrink-0" />
            {/if}
            <span class="text-xs text-muted-foreground whitespace-nowrap shrink-0 font-sans">
              <span class="hidden sm:inline">{formatDate(talk.createdAt)}</span>
              <span class="inline sm:hidden">{formatDateCompact(talk.createdAt)}</span>
            </span>
          </div>
        </div>
        
        <div class="text-base md:text-[17px] text-slate-850 dark:text-slate-200 leading-relaxed font-medium mb-3 break-words font-sans">
          <RichText text={talk.body} theme="blue" />
        </div>

        <ImageGallery 
          urls={talk.imageUrls?.length ? talk.imageUrls : (talk.imageUrl ? [talk.imageUrl] : [])} 
          theme="blue"
        />

        {#if thread.length === 0}
          <div class="talk-actions mt-3 flex flex-wrap gap-4 opacity-100 transition-all">
            <button
              on:click={() => onShare(talk.id)}
              class="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150 cursor-pointer border-0 bg-transparent"
            >
              <Share2 size={13} />
              <span>{buttonFeedback[`share-${talk.id}`] || 'Share'}</span>
            </button>
            <button
              on:click={() => onSnap(talk.id)}
              class="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150 cursor-pointer border-0 bg-transparent"
            >
              <Camera size={13} />
              <span>{buttonFeedback[`snap-${talk.id}`] || 'Snap'}</span>
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
                class="flex items-center gap-1.5 text-xs font-mono font-medium text-blue-600 dark:text-blue-450 hover:underline transition-colors duration-150 cursor-pointer border-0 bg-transparent"
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
            author={talk.author}
            isEditing={editingMessageId === msg.id}
            bind:editBody
            bind:editImageUrls
            onEditClick={() => {
              editingMessageId = msg.id;
              editBody = msg.body;
              editImageUrls = msg.imageUrls?.length 
                ? msg.imageUrls 
                : (msg.imageUrl ? [msg.imageUrl] : []);
              isReplying = false;
              isFollowingUp = false;
            }}
            onCancel={() => (editingMessageId = null)}
            onSave={() => handleEditFormSubmit(msg.id)}
            bind:passcode
            {isPending}
            isLast={i === thread.length - 1 && !isReplying && !isFollowingUp}
            theme="blue"
            {isAdminMode}
          >
            <div slot="actions" class="talk-actions mt-3 flex flex-wrap gap-4 opacity-100 transition-all">
              <button
                on:click={() => onShare(talk.id)}
                class="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150 cursor-pointer border-0 bg-transparent"
              >
                <Share2 size={13} />
                <span>{buttonFeedback[`share-${talk.id}`] || 'Share'}</span>
              </button>
              <button
                on:click={() => onSnap(talk.id)}
                class="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-150 cursor-pointer border-0 bg-transparent"
              >
                <Camera size={13} />
                <span>{buttonFeedback[`snap-${talk.id}`] || 'Snap'}</span>
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
                  class="flex items-center gap-1.5 text-xs font-mono font-medium text-blue-600 dark:text-blue-450 hover:underline transition-colors duration-150 cursor-pointer border-0 bg-transparent"
                >
                  <MessageSquareReply size={13} />
                  <span>Reply (Admin)</span>
                </button>
              {/if}
            </div>
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
        <div class="flex-grow min-w-0">
          <textarea
            bind:value={replyBody}
            on:input={handleInput}
            placeholder="Write your response..."
            rows={1}
            class="min-h-[44px] w-full resize-none overflow-hidden rounded-md border border-border bg-background px-4 py-3 text-base md:text-[17px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-350 dark:text-slate-100 font-sans"
          />
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
                class="w-24 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-350 dark:text-slate-100 font-sans"
              />
              <AttachmentUploadButton
                onFiles={(files) => files.forEach(file => {
                  handleImageUpload(file, (url) => (replyImageUrls = replyImageUrls.length >= MAX_ATTACHMENT_COUNT ? replyImageUrls : [...replyImageUrls, url]));
                })}
                accent="blue"
              />
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                on:click={() => (isReplying = false)}
                class="text-xs h-8 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-500 border border-slate-200/50 dark:border-slate-800/40 font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending || !replyBody.trim()}
                on:click={handleReplyFormSubmit}
                class="h-8 rounded px-4 text-xs font-semibold cursor-pointer disabled:opacity-50 pride-button font-sans"
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
        <div class="flex-grow min-w-0">
          <textarea
            bind:value={followUpBody}
            on:input={handleInput}
            placeholder="Add to this discussion..."
            rows={1}
            class="min-h-[44px] w-full resize-none overflow-hidden rounded-md border border-emerald-200 bg-background px-4 py-3 text-base md:text-[17px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-300 dark:border-emerald-500/30 dark:text-slate-100 font-sans"
          />
          <AttachmentPreviewGrid
            urls={followUpImageUrls}
            onRemove={(index) => (followUpImageUrls = followUpImageUrls.filter((_, itemIndex) => itemIndex !== index))}
            alt="Follow-up attachment"
            className="mt-2.5"
            compact
          />
          <div class="mt-2 flex justify-between items-center gap-2">
            <AttachmentUploadButton
              onFiles={(files) => files.forEach(file => {
                handleImageUpload(file, (url) => (followUpImageUrls = followUpImageUrls.length >= MAX_ATTACHMENT_COUNT ? followUpImageUrls : [...followUpImageUrls, url]));
              })}
              accent="emerald"
            />
            <div class="flex gap-2">
              <button
                type="button"
                on:click={() => (isFollowingUp = false)}
                class="text-xs h-8 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-500 border border-slate-200/50 dark:border-slate-800/40 font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending || !followUpBody.trim() || isCooldownActive}
                on:click={handleFollowUpFormSubmit}
                class="h-8 rounded px-4 text-xs font-semibold cursor-pointer disabled:opacity-50 bg-emerald-600 hover:bg-emerald-700 text-white font-sans"
                title={isCooldownActive ? `You can send another message in ${cooldownLabel}` : undefined}
              >
                {isCooldownActive ? cooldownLabel : 'Send follow-up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</article>
