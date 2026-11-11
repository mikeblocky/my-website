<script lang="ts">
  import { MessageCircle, Heart, Share2, Camera, Download, Trash2, Pencil, X } from '@lucide/svelte';
  import ExpandablePostText from './ExpandablePostText.svelte';
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import ImageGallery from './ImageGallery.svelte';
  import AttachmentUploadButton from './AttachmentUploadButton.svelte';
  import AttachmentPreviewGrid from './AttachmentPreviewGrid.svelte';
  import EmojiPickerButton from './EmojiPickerButton.svelte';
  import { formatBoardDateCompact } from '$lib/boards/board-utils';
  import { feedConfig } from '$lib/boards/interact-feed';
  import type { FeedEntry } from '$lib/boards/interact-feed';
  import { prepareImageForUpload } from '$lib/images/prepare-upload';
  import { MAX_ATTACHMENT_COUNT } from '$lib/images/attachment-limits';
  import { getStatusConfig } from '$lib/utils/suggestion-helper';
  import type { SuggestionStatus } from '$lib/utils/suggestion-helper';

  export let entry: FeedEntry;
  export let isAdminMode = false;
  export let isPending = false;
  export let liked = false;
  export let cooldownLabel = '';
  export let isCooldownActive = false;
  export let buttonFeedback: Record<string, string> = {};
  export let onShare: (id: string) => void;
  export let onSnap: (id: string) => void;
  export let onLike: (id: string, event: MouseEvent) => void;
  export let onDownload: (imageUrl: string, id: string, event: MouseEvent) => void;
  export let onDelete: (id: string, event: MouseEvent) => void;
  export let onRespond: (id: string, body: string, images: string[]) => Promise<void>;
  export let onEdit: (id: string, messageId: string, body: string, images: string[]) => Promise<void>;
  export let onStatus: (id: string, status: string) => void;
  export let showNotification: (message: string) => void;

  let expanded = false;
  let reduceMotion = false;
  onMount(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => reduceMotion = preference.matches;
    update(); preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  });
  let replyBody = '';
  let replyImages: string[] = [];
  let editing: string | null = null;
  let editBody = '';
  let editImages: string[] = [];
  let attaching = false;
  let replyEditor: HTMLTextAreaElement;
  $: post = entry.post;
  $: author = post.author || 'anonymous';
  $: thread = post.thread?.length ? post.thread : post.reply ? [{ id: `legacy-reply-${post.id}`, role: 'admin', body: post.reply, createdAt: post.repliedAt || post.createdAt }] : [];
  $: imageUrls = post.imageUrls?.length ? post.imageUrls : post.imageUrl ? [post.imageUrl] : [];
  $: body = post.body || post.note || post.bestPart || '';
  $: canRespond = entry.kind !== 'sketchbook' || isAdminMode;
  $: referenceUrl = validReference(post.reference?.url);
  const statuses: SuggestionStatus[] = ['planning', 'progressing', 'completed', 'dropped'];

  function validReference(value: unknown) {
    try { const url = new URL(String(value)); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; }
    catch { return ''; }
  }

  async function attach(files: File[], target: 'reply' | 'edit') {
    if (isPending || attaching) return;
    attaching = true;
    try {
      const existing = target === 'reply' ? replyImages : editImages;
      const max = entry.kind === 'sketchbook' ? 1 : MAX_ATTACHMENT_COUNT;
      for (const file of files.slice(0, max - existing.length)) {
        const url = await prepareImageForUpload(file);
        if (target === 'reply') replyImages = [...replyImages, url];
        else editImages = [...editImages, url];
      }
    } catch (error) { showNotification(error instanceof Error ? error.message : 'Could not attach image.'); }
    finally { attaching = false; }
  }

  async function respond() {
    if (!replyBody.trim() || isPending || attaching || (!isAdminMode && isCooldownActive)) return;
    try { await onRespond(post.id, replyBody.trim(), replyImages); replyBody = ''; replyImages = []; }
    catch { /* Keep the reply draft. */ }
  }

  async function saveEdit() {
    if (!editing || !editBody.trim() || isPending || attaching) return;
    try { await onEdit(post.id, editing, editBody.trim(), editImages); editing = null; }
    catch { /* Keep the edit draft. */ }
  }
</script>

<article class="timeline-post" id={`${feedConfig[entry.kind].prefix}-${post.id}`}>
  <img class="timeline-avatar" src={/^mike(blocky)?$/i.test(author) ? '/poster-avatar.webp' : '/poster-avatar.webp'} alt="" width="40" height="40" loading="lazy" />
  <div class="timeline-post-content">
    <header class="timeline-post-header">
      <strong>{author}</strong>
      <span aria-hidden="true">·</span>
      <a class="timeline-time" href={`/interact#${feedConfig[entry.kind].prefix}-${post.id}`}><time datetime={post.createdAt}>{formatBoardDateCompact(post.createdAt)}</time></a>
      {#if entry.kind === 'suggestions' && isAdminMode}
        <select class="site-native-select timeline-status" aria-label="Recommendation status" value={post.status || ''} disabled={isPending} on:change={(event) => onStatus(post.id, event.currentTarget.value)}>
          <option value="" disabled>Set status</option>
          {#each statuses as value}<option value={value}>{getStatusConfig(value, post.category || 'other')?.label || value}</option>{/each}
        </select>
      {:else if post.status}<span class="timeline-tag">{getStatusConfig(post.status, post.category || 'other')?.label || post.status}</span>{/if}
    </header>
    {#if post.title}<h2 class="timeline-post-title">{post.title}</h2>{/if}
    {#if post.character || post.media}<p class="timeline-post-context">{[post.character, post.media].filter(Boolean).join(' · ')}</p>{/if}
    {#if body}<div class="timeline-post-body"><ExpandablePostText text={body} /></div>{/if}
    {#if post.bestPart && post.note}<div class="timeline-post-body"><ExpandablePostText text={post.bestPart} /></div>{/if}
    <div class="timeline-media"><ImageGallery urls={imageUrls} theme="blue" /></div>
    {#if referenceUrl}
      <a class="timeline-link-card" href={referenceUrl} target="_blank" rel="noreferrer">
        {#if post.reference.image}<img src={post.reference.image} alt="" loading="lazy" />{/if}
        <span><small>{post.reference.siteName || new URL(referenceUrl).hostname}</small><strong>{post.reference.title || post.title || referenceUrl}</strong></span>
      </a>
    {/if}
    <div class="timeline-actions talk-actions prompt-actions suggestion-actions drawing-actions">
      <button type="button" class:engaged={expanded} aria-label={canRespond ? 'Reply to post' : 'View replies'} aria-expanded={expanded} aria-controls={`thread-${entry.kind}-${post.id}`} on:click={() => expanded = !expanded}><MessageCircle size={17} /><span>Reply{thread.length ? ` · ${thread.length}` : ''}</span></button>
      {#if entry.kind === 'sketchbook'}<button type="button" class:engaged={liked} aria-label="Like drawing" aria-pressed={liked} disabled={liked || isPending} on:click={(event) => onLike(post.id, event)}><Heart size={17} fill={liked ? 'currentColor' : 'none'} /><span>Like{post.likes ? ` · ${post.likes}` : ''}</span></button>{/if}
      <button type="button" aria-label="Share post" title={buttonFeedback[`share-${post.id}`] || 'Share'} on:click={() => onShare(post.id)}><Share2 size={17} /><span>Share</span></button>
      <button type="button" aria-label="Save post as image" title={buttonFeedback[`snap-${post.id}`] || 'Save image'} on:click={() => onSnap(post.id)}><Camera size={17} /><span>Save</span></button>
      {#if entry.kind === 'sketchbook'}
        <button type="button" aria-label="Download drawing" on:click={(event) => onDownload(post.imageUrl, post.id, event)}><Download size={17} /><span>Download</span></button>
        {#if isAdminMode}<button type="button" aria-label="Delete drawing" disabled={isPending} on:click={(event) => onDelete(post.id, event)}><Trash2 size={17} /></button>{/if}
      {/if}
    </div>
    {#if buttonFeedback[`share-${post.id}`] || buttonFeedback[`snap-${post.id}`]}
      <p class="timeline-action-feedback" role="status">{buttonFeedback[`share-${post.id}`] || buttonFeedback[`snap-${post.id}`]}</p>
    {/if}
    {#if expanded || editing}
      <div class="timeline-conversation" id={`thread-${entry.kind}-${post.id}`} transition:slide={{ duration: reduceMotion ? 0 : 420, easing: cubicOut }}>
        {#each thread as message (message.id)}
          <div class="timeline-thread-item">
            <img class="timeline-avatar" src={message.role === 'admin' ? '/poster-avatar.webp' : '/poster-avatar.webp'} alt="" width="32" height="32" loading="lazy" />
            <div class="timeline-thread-content">
              <header class="timeline-post-header"><strong>{message.role === 'admin' ? 'Mike' : author}</strong>{#if message.role === 'admin'}<span class="timeline-tag">Admin</span>{/if}<time datetime={message.createdAt}>{formatBoardDateCompact(message.createdAt)}</time>
                {#if isAdminMode}<button class="timeline-edit-button" type="button" aria-label="Edit reply" on:click={() => { editing = message.id; editBody = message.body; editImages = message.imageUrls?.length ? [...message.imageUrls] : message.imageUrl ? [message.imageUrl] : []; }}><Pencil size={14} /></button>{/if}
              </header>
              {#if editing === message.id}
                <form class="timeline-reply-editor" on:submit|preventDefault={saveEdit}>
                  <textarea aria-label="Edit reply text" bind:value={editBody} maxlength={800} required readonly={isPending}></textarea>
                  <AttachmentPreviewGrid urls={editImages} onRemove={(index) => editImages = editImages.filter((_, i) => i !== index)} />
                  <div class="timeline-reply-tools"><AttachmentUploadButton onFiles={(files) => attach(files, 'edit')} accent="blue">Images</AttachmentUploadButton><button type="button" aria-label="Cancel editing reply" on:click={() => editing = null}><X size={16} /></button><button class="interact-post-button" type="submit" disabled={isPending || attaching || !editBody.trim()}>Save</button></div>
                </form>
              {:else}
                <ExpandablePostText text={message.body} />
                <ImageGallery urls={message.imageUrls?.length ? message.imageUrls : message.imageUrl ? [message.imageUrl] : []} theme="blue" />
              {/if}
            </div>
          </div>
        {/each}
        {#if canRespond}
          <form class="timeline-reply-editor" on:submit|preventDefault={respond} aria-label="Reply to post">
            {#if isAdminMode}<div class="timeline-reply-identity"><img src="/poster-avatar.webp" alt="Mike" width="24" height="24" /><span>Replying as <strong>Mike</strong></span><span class="timeline-tag">Admin</span></div>{/if}
            <div class="interact-editor"><textarea bind:this={replyEditor} aria-label="Reply text" placeholder={isAdminMode ? "Write an admin reply…" : "Post your reply"} bind:value={replyBody} maxlength={800} rows={2} required readonly={isPending}></textarea><EmojiPickerButton getTarget={() => replyEditor} accent="sky" /></div>
            <AttachmentPreviewGrid urls={replyImages} onRemove={(index) => replyImages = replyImages.filter((_, i) => i !== index)} />
            <div class="timeline-reply-tools"><AttachmentUploadButton onFiles={(files) => attach(files, 'reply')} accent="blue">Images</AttachmentUploadButton><button class="interact-post-button" type="submit" disabled={isPending || attaching || !replyBody.trim() || (!isAdminMode && isCooldownActive)}>{isPending ? 'Posting…' : !isAdminMode && isCooldownActive ? `Wait ${cooldownLabel}` : isAdminMode ? 'Reply as admin' : 'Reply'}</button></div>
          </form>
        {/if}
      </div>
    {/if}
  </div>
</article>
