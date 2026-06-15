<script lang="ts">
  import { onMount } from 'svelte';

  let isSending = false;
  let lastGif: string | null = null;
  let giftCount = 0;
  let status = '';

  async function loadLastGif() {
    try {
      const response = await fetch('/api/annoy');
      if (!response.ok) return;
      const data = await response.json();
      if (data.gif) lastGif = data.gif;
      if (typeof data.total === 'number') giftCount = data.total;
    } catch {
      status = 'pet room api will reconnect during server migration';
    }
  }

  async function sendGift() {
    isSending = true;
    status = '';
    try {
      const response = await fetch('/api/annoy', { method: 'POST' });
      if (!response.ok) {
        status = 'pet room api will reconnect during server migration';
        return;
      }

      const data = await response.json();
      if (data.gif) lastGif = data.gif;
      if (typeof data.total === 'number') giftCount = data.total;
    } catch {
      status = 'pet room api will reconnect during server migration';
    } finally {
      isSending = false;
    }
  }

  onMount(loadLastGif);
</script>

<section class="pet-room">
  <div class="pet-actions">
    <button type="button" class="pride-button" disabled={isSending} on:click={sendGift}>
      {isSending ? 'sending...' : 'send'}
    </button>

    {#if giftCount > 0}
      <p>{giftCount} {giftCount === 1 ? 'gift' : 'gifts'} shared in total</p>
    {:else if status}
      <p>{status}</p>
    {/if}
  </div>

  {#if lastGif}
    <div class="pet-gift-panel">
      <div class="pet-divider">
        <i></i>
        <span>recently shared</span>
        <i></i>
      </div>

      <figure>
        <img src={lastGif} alt="Pet gift" />
      </figure>
    </div>
  {:else}
    <div class="pet-empty-panel">
      <img src="/dog-face-fluent-512.png" alt="A soft dog face icon" />
    </div>
  {/if}
</section>
