<script lang="ts">
  import { CornerDownRight } from '@lucide/svelte';
  import ImageGallery from './ImageGallery.svelte';
  import RichText from './RichText.svelte';
  import AttachmentPreviewGrid from './AttachmentPreviewGrid.svelte';
  import AttachmentUploadButton from './AttachmentUploadButton.svelte';
  import { MAX_ATTACHMENT_COUNT } from '$lib/images/attachment-limits';
  import { prepareImageForUpload } from '$lib/images/prepare-upload';
  import { formatBoardDate as formatDate, formatBoardDateCompact as formatDateCompact } from '$lib/boards/board-utils';

  type ThreadTheme = 'blue' | 'violet';
  
  export let message: {
    id: string;
    role: 'asker' | 'admin';
    body: string;
    createdAt: string;
    imageUrl?: string;
    imageUrls?: string[];
  };
  export let depth: number;
  export let author = 'anonymous';
  export let isEditing = false;
  export let editBody = '';
  export let editImageUrls: string[] = [];
  export let onEditClick: () => void = () => {};
  export let onCancel: () => void = () => {};
  export let onSave: () => void = () => {};
  export let passcode = '';
  export let isPending = false;
  export let theme: ThreadTheme = 'violet';
  export let isLast = false;
  export let isAdminMode = false;

  const isAdmin = message.role === 'admin';

  const themeClasses = {
    blue: {
      adminAccent: 'text-blue-400',
      adminText: 'text-blue-600 dark:text-blue-400',
      adminBg: 'bg-blue-50/45 dark:bg-blue-950/20',
      adminBorder: 'border-blue-200/70 dark:border-blue-500/20',
      ring: 'ring-blue-500/20',
      editButton: 'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
      textarea: 'border-blue-200 focus:ring-blue-300 dark:border-blue-500/30',
      saveButton: 'bg-blue-600 text-white hover:bg-blue-700'
    },
    violet: {
      adminAccent: 'text-violet-400',
      adminText: 'text-violet-600 dark:text-violet-400',
      adminBg: 'bg-violet-50/45 dark:bg-violet-950/20',
      adminBorder: 'border-violet-200/70 dark:border-violet-500/20',
      ring: 'ring-violet-500/20',
      editButton: 'text-violet-500 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300',
      textarea: 'border-violet-200 focus:ring-violet-300 dark:border-violet-500/30',
      saveButton: 'bg-violet-600 hover:bg-violet-700 text-white'
    }
  }[theme];

  async function handleImageUpload(file: File) {
    try {
      const url = await prepareImageForUpload(file);
      editImageUrls = editImageUrls.length >= MAX_ATTACHMENT_COUNT ? editImageUrls : [...editImageUrls, url];
    } catch (error) {
      console.error('Could not attach image', error);
    }
  }

  function handleInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
</script>

<div
  class="group/bubble relative flex gap-3 sm:gap-4 text-base text-left transition-all duration-300 pl-0 pr-1 py-1 rounded-xl {isEditing ? `ring-1.5 ${themeClasses.ring} bg-slate-500/5 dark:bg-stone-500/5 p-4` : ''}"
>
  {#if !isEditing}
    <div class="flex flex-col items-center shrink-0">
      <div class="w-9 sm:w-12 flex justify-center">
        <div class="w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-black/[0.04] dark:border-white/[0.04] overflow-hidden select-none">
          <img 
            src={isAdmin ? "/a.jpg" : "/q.jpg"} 
            alt={isAdmin ? "Response Avatar" : "Question Avatar"} 
            class="w-full h-full object-cover" 
          />
        </div>
      </div>
      {#if !isLast}
        <div class="w-0.5 bg-slate-200 dark:bg-slate-800 flex-grow mt-2 -mb-8 rounded-full"></div>
      {/if}
    </div>
  {/if}

  <!-- Right Column: Message Content -->
  <div class="flex-grow min-w-0">
    {#if !isEditing}
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1.5 gap-1 sm:gap-2">
        <span class="text-[11px] font-bold tracking-wider truncate font-mono {isAdmin ? themeClasses.adminText : 'text-emerald-650 dark:text-emerald-400'}">
          {isAdmin ? 'Response' : (author || 'anonymous')}
        </span>
        <div class="flex items-center gap-2">
          {#if isAdmin && isAdminMode}
            <button
              on:click={onEditClick}
              class="text-[10px] font-bold opacity-0 group-hover/bubble:opacity-100 transition-opacity cursor-pointer mr-1 shrink-0 font-mono {themeClasses.editButton}"
            >
              Edit
            </button>
          {/if}
          <span class="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 font-mono">
            <span class="hidden sm:inline">{formatDate(message.createdAt)}</span>
            <span class="inline sm:hidden">{formatDateCompact(message.createdAt)}</span>
          </span>
        </div>
      </div>
    {/if}

    {#if isEditing}
      <div class="space-y-3">
        <textarea
          bind:value={editBody}
          on:input={handleInput}
          rows={Math.max(3, message.body.split('\n').length)}
          class="min-h-[100px] w-full resize-none overflow-hidden rounded-lg border bg-background px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 dark:text-slate-100 font-sans {themeClasses.textarea}"
        />
        <AttachmentPreviewGrid
          urls={editImageUrls}
          onRemove={(index) => (editImageUrls = editImageUrls.filter((_, itemIndex) => itemIndex !== index))}
          alt="Edit attachment"
          className="mt-2.5"
          compact
        />
        <div class="flex justify-between items-center gap-2">
          <div class="flex items-center gap-3">
            <input
              type="password"
              bind:value={passcode}
              placeholder="Passcode"
              class="w-24 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 dark:text-slate-100 {theme === 'violet' ? 'focus:ring-violet-300' : 'focus:ring-blue-300'}"
            />
            <AttachmentUploadButton
              onFiles={(files) => files.forEach(handleImageUpload)}
              accent={theme}
            />
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              on:click={onCancel}
              class="text-xs h-8 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-500 border border-slate-200/50 dark:border-slate-800/40"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending || !editBody.trim()}
              on:click={onSave}
              class="h-8 rounded-full px-4 text-xs font-semibold cursor-pointer disabled:opacity-50 {themeClasses.saveButton}"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    {:else}
      <div>
        <div class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed break-words font-sans">
          <RichText text={message.body} {theme} />
        </div>
        <ImageGallery
          urls={message.imageUrls?.length ? message.imageUrls : (message.imageUrl ? [message.imageUrl] : [])}
          {theme}
        />
        {#if isLast}
          <slot name="actions" />
        {/if}
      </div>
    {/if}
  </div>
</div>
