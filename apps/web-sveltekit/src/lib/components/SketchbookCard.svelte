<script lang="ts">
  import { Heart, Share2, Camera, Download, MessageSquareReply, Trash2, CornerDownRight } from '@lucide/svelte';
  import ImageGallery from './ImageGallery.svelte';
  import { formatBoardDate as formatDate } from '$lib/boards/board-utils';

  export let drawing: any;
  export let isAdminMode = false;
  export let likedList: string[] = [];
  export let passcode = '';
  export let isPending = false;
  export let buttonFeedback: Record<string, string> = {};
  export let onLike: (id: string, e: MouseEvent) => void;
  export let onShare: (id: string, e: MouseEvent) => void;
  export let onSnap: (id: string, e: MouseEvent) => void;
  export let onDownload: (imageUrl: string, id: string, e: MouseEvent) => void;
  export let onReplySubmit: (id: string, body: string) => Promise<void>;
  export let onDeleteDrawing: (id: string, e: MouseEvent) => void;

  let isReplying = false;
  let replyBody = '';

  $: hasLiked = likedList.includes(drawing.id);

  async function handleReplyFormSubmit() {
    if (!replyBody.trim()) return;
    try {
      await onReplySubmit(drawing.id, replyBody);
      isReplying = false;
      replyBody = '';
    } catch (e) {
      // Handled in parent
    }
  }
</script>

<article
  id={`drawing-${drawing.id}`}
  class="group flex flex-col sm:flex-row min-h-[220px] overflow-hidden rounded-md border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100/40 dark:hover:bg-slate-900/50 transition-colors duration-150 shadow-none text-left"
>
  <!-- Drawing Image on the Left -->
  <div 
    class="relative bg-white dark:bg-slate-950 shrink-0 border-slate-200/60 dark:border-slate-800/60 h-64 sm:h-auto w-full sm:w-64 md:w-80 border-b sm:border-b-0 sm:border-r flex flex-col justify-center overflow-hidden" 
    on:click|stopPropagation
  >
    <div class="w-full p-3 flex justify-center">
      <ImageGallery urls={[drawing.imageUrl]} theme="amber" />
    </div>
  </div>

  <!-- Right Column details -->
  <div class="p-5 sm:p-6 flex flex-col justify-between flex-1 min-w-0 font-sans">
    <div class="min-w-0 max-w-full space-y-3">
      <div class="min-w-0 max-w-full">
        <h2 class="max-w-full break-words [overflow-wrap:anywhere] text-lg font-bold text-slate-955 dark:text-slate-50 font-sans">
          {drawing.author}
        </h2>
        <p class="text-xs text-muted-foreground font-mono">
          {formatDate(drawing.createdAt).split(',')[0]}
        </p>
      </div>

      {#if drawing.body}
        <p class="max-w-full break-words [overflow-wrap:anywhere] text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
          {drawing.body}
        </p>
      {/if}

      <!-- Render mini replies thread (Admin replies) -->
      {#if drawing.thread && drawing.thread.length > 0}
        <div class="space-y-2 border-t border-slate-200/45 dark:border-slate-850/45 pt-3">
          {#each drawing.thread as reply (reply.id)}
            <div class="flex min-w-0 gap-2 items-start rounded-md border border-slate-200/30 bg-slate-100/30 p-2.5 text-xs dark:border-slate-800/30 dark:bg-slate-900/20">
              <CornerDownRight size={13} class="text-amber-600 shrink-0 mt-0.5" />
              <div class="min-w-0 max-w-full space-y-0.5">
                <span class="font-semibold text-amber-700 dark:text-amber-300">mikeblocky</span>
                <p class="max-w-full text-slate-655 dark:text-slate-300 break-words [overflow-wrap:anywhere] leading-relaxed">{reply.body}</p>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div class="mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800/40 space-y-3">
      <!-- Utility actions: Like / Share / Snap / Download / Moderation -->
      <div class="flex items-center justify-between gap-3">
        <div class="drawing-actions flex items-center gap-4">
          <button
            type="button"
            on:click={(e) => onLike(drawing.id, e)}
            class="flex items-center gap-1.5 text-xs font-mono font-medium transition-colors duration-150 cursor-pointer border-0 bg-transparent {hasLiked ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground hover:text-red-500 dark:hover:text-red-400'}"
            title="Like Artwork"
          >
            <Heart size={13} class={hasLiked ? "fill-red-500 text-red-500" : ""} />
            <span>{drawing.likes || 0}</span>
          </button>

          <button
            type="button"
            on:click={(e) => onShare(drawing.id, e)}
            class="flex items-center justify-center text-muted-foreground hover:text-amber-700 dark:hover:text-amber-300 transition-colors duration-150 cursor-pointer border-0 bg-transparent"
            title={buttonFeedback[`share-${drawing.id}`] || "Share link"}
          >
            <Share2 size={13} />
          </button>

          <button
            type="button"
            on:click={(e) => onSnap(drawing.id, e)}
            class="flex items-center justify-center text-muted-foreground hover:text-amber-700 dark:hover:text-amber-300 transition-colors duration-150 cursor-pointer border-0 bg-transparent"
            title={buttonFeedback[`snap-${drawing.id}`] || "Snap card to clipboard"}
          >
            <Camera size={13} />
          </button>

          <button
            type="button"
            on:click={(e) => onDownload(drawing.imageUrl, drawing.id, e)}
            class="flex items-center justify-center text-muted-foreground hover:text-amber-700 dark:hover:text-amber-300 transition-colors duration-150 cursor-pointer border-0 bg-transparent"
            title="Download"
          >
            <Download size={13} />
          </button>
        </div>

        <!-- Admin moderation controls -->
        {#if isAdminMode}
          <div class="flex items-center gap-2.5" on:click|stopPropagation>
            <button
              type="button"
              on:click={() => {
                isReplying = !isReplying;
                replyBody = '';
              }}
              class="flex items-center justify-center text-muted-foreground hover:text-amber-700 dark:hover:text-amber-300 transition-colors duration-150 cursor-pointer border-0 bg-transparent"
              title="Reply to drawing"
            >
              <MessageSquareReply size={13} />
            </button>
            <button
              type="button"
              on:click={(e) => onDeleteDrawing(drawing.id, e)}
              class="flex items-center justify-center text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors duration-150 cursor-pointer border-0 bg-transparent"
              title="Delete Artwork"
            >
              <Trash2 size={13} />
            </button>
          </div>
        {/if}
      </div>

      <!-- Admin inline reply form in gallery card -->
      {#if isReplying && isAdminMode}
        <div class="flex flex-col gap-2 pt-2 border-t border-slate-200/30 dark:border-slate-800/30" on:click|stopPropagation>
          <textarea
            placeholder="Mike, write feedback..."
            bind:value={replyBody}
            class="w-full bg-background border border-slate-200 dark:border-slate-850 p-2 text-xs rounded-lg focus:outline-none resize-none h-12 focus:ring-1 focus:ring-amber-300 dark:text-slate-100 font-sans"
          />
          <div class="flex justify-end gap-1.5">
            <button
              type="button"
              class="h-6 text-[10px] px-2 font-mono rounded border border-transparent bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              on:click={() => (isReplying = false)}
            >
              Cancel
            </button>
            <button
              type="button"
              class="h-6 text-[10px] px-3 bg-amber-600 hover:bg-amber-700 text-white rounded border-0 font-mono cursor-pointer disabled:opacity-50"
              disabled={!replyBody.trim()}
              on:click={handleReplyFormSubmit}
            >
              Send
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>
</article>
