<script lang="ts">
  import { MessageSquare, Palette } from '@lucide/svelte';
  import AttachmentUploadButton from './AttachmentUploadButton.svelte';
  import AttachmentPreviewGrid from './AttachmentPreviewGrid.svelte';
  import EmojiPickerButton from './EmojiPickerButton.svelte';
  import SketchbookCanvas from './SketchbookCanvas.svelte';
  import { prepareImageForUpload } from '$lib/images/prepare-upload';
  import { MAX_ATTACHMENT_COUNT } from '$lib/images/attachment-limits';
  import type { FeedKind } from '$lib/boards/interact-feed';

  export let kind: FeedKind = 'talk';
  export let isPending = false;
  export let isCooldownActive = false;
  export let cooldownLabel = '';
  export let pushSupported = false;
  export let wantNotification = false;
  export let onSubmit: (kind: FeedKind, payload: Record<string, any>) => Promise<void>;
  export let showNotification: (message: string) => void;

  let author = '';
  let body = '';
  let images: string[] = [];
  let uploading = false;
  let submitting = false;
  $: busy = isPending || submitting;
  let editor: HTMLTextAreaElement;
  let drawingCanvas: SketchbookCanvas;
  $: limit = kind === 'sketchbook' ? 300 : 800;

  async function attach(files: File[]) {
    if (uploading || busy) return;
    uploading = true;
    try {
      for (const file of files.slice(0, MAX_ATTACHMENT_COUNT - images.length)) {
        images = [...images, await prepareImageForUpload(file)];
      }
    } catch (error) { showNotification(error instanceof Error ? error.message : 'Could not attach image.'); }
    finally { uploading = false; }
  }

  async function submit() {
    if (busy || uploading || isCooldownActive) return;
    const drawing = kind === 'sketchbook' ? drawingCanvas?.getDrawingImage() : null;
    if (kind === 'sketchbook' && !drawing) { showNotification('Draw something before posting.'); return; }
    if (kind !== 'sketchbook' && !body.trim()) return;
    if (body.length > limit) { showNotification('Please shorten your post.'); return; }
    submitting = true;
    try {
      await onSubmit(kind === 'sketchbook' ? 'sketchbook' : 'talk', { author: author.trim(), body: body.trim(), ...(drawing ? { imageUrl: drawing } : { imageUrls: images }) });
      if (drawing) drawingCanvas.resetDrawing();
      body = ''; images = [];
    } catch { /* Keep the draft when posting fails. */ }
    finally { submitting = false; }
  }
</script>

<section class="interact-composer" aria-label="Create a post">
  <div class="interact-compose-modes" role="group" aria-label="Composer tools">
    <button type="button" class:chosen={kind !== 'sketchbook'} aria-pressed={kind !== 'sketchbook'}
      disabled={busy || uploading} on:click={() => kind = 'talk'}><MessageSquare size={17} strokeWidth={1.6} /><span>Post</span></button>
    <button type="button" class:chosen={kind === 'sketchbook'} aria-pressed={kind === 'sketchbook'}
      disabled={busy || uploading} on:click={() => kind = 'sketchbook'}><Palette size={17} strokeWidth={1.6} /><span>Draw</span></button>
  </div>
  <form class:drawing-mode={kind === 'sketchbook'} on:submit|preventDefault={submit} aria-label="Write a post">
    <input class="interact-alias" aria-label="Your name (optional)" placeholder="Your name (optional)" bind:value={author} maxlength={80} readonly={busy} />
    <div class="interact-editor">
      <textarea bind:this={editor} bind:value={body} maxlength={limit} rows={kind === 'sketchbook' ? 1 : 3} readonly={busy}
        aria-label="Post text" placeholder={kind === 'sketchbook' ? 'A little caption… (optional)' : 'What’s on your mind?'} required={kind !== 'sketchbook'}></textarea>
      <EmojiPickerButton getTarget={() => editor} accent="sky" />
    </div>
    <div hidden={kind !== 'sketchbook'} class="interact-drawing-attachment">
      <SketchbookCanvas bind:this={drawingCanvas} embedded active={kind === 'sketchbook' && !busy} isPending={busy} onSubmit={async () => {}} {showNotification} />
    </div>
    <div hidden={kind === 'sketchbook'}><AttachmentPreviewGrid urls={images} onRemove={(index) => { if (!busy) images = images.filter((_, i) => i !== index); }} /></div>
    <div class="interact-compose-actions">
      {#if kind !== 'sketchbook'}<AttachmentUploadButton onFiles={attach} iconSize={16} accent="blue">Images</AttachmentUploadButton>{/if}
      {#if pushSupported && kind !== 'sketchbook'}<label class="interact-notify"><input type="checkbox" bind:checked={wantNotification} />Notify me</label>{/if}
      <small aria-live="polite">{uploading ? 'Attaching…' : `${body.length}/${limit}`}</small>
      <button class="interact-post-button" type="submit" disabled={busy || uploading || isCooldownActive || (kind !== 'sketchbook' && !body.trim()) || body.length > limit}>
        {busy ? 'Posting…' : isCooldownActive ? `Wait ${cooldownLabel}` : 'Post'}
      </button>
    </div>
  </form>
</section>
