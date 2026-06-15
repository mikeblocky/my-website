<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Headphones } from '@lucide/svelte';

  const SpotifyIcon = `<svg class="platform-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-.982-.336.075-.668-.135-.744-.47-.077-.337.135-.668.47-.745 3.856-.88 7.15-.506 9.822 1.13.295.178.387.563.205.86zm1.224-2.72c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.076-1.183-.412.125-.845-.107-.97-.52-.124-.412.108-.846.52-.97 3.668-1.112 8.248-.567 11.374 1.354.366.226.486.707.226 1.074zm.107-2.846C14.403 8.8 8.442 8.6 4.992 9.65c-.53.16-1.09-.14-1.25-.67-.16-.53.14-1.09.67-1.25 3.96-1.202 10.55-.974 14.61 1.44.477.284.63.9.347 1.378-.283.477-.9.63-1.377.347z"/></svg>`;

  let activities: any[] = [];
  let currentlyPlaying: any | null = null;
  let isLoading = true;
  let liveProgressMs = 0;
  let activePreviewId: string | null = null;
  let audio: HTMLAudioElement | null = null;
  let fetchInterval: ReturnType<typeof setInterval>;
  let progressInterval: ReturnType<typeof setInterval>;

  function formatDuration(ms: number): string {
    if (!ms) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  function formatTime(isoString: string): string {
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  }

  function formatDateLabel(isoString: string): string {
    try {
      const date = new Date(isoString);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      if (date.toDateString() === today.toDateString()) return 'today';
      if (date.toDateString() === yesterday.toDateString()) return 'yesterday';
      return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return 'earlier'; }
  }

  function groupByDay(items: any[]) {
    const groups: Record<string, any[]> = {};
    items.forEach((item) => {
      const label = formatDateLabel(item.timestamp);
      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });
    return Object.keys(groups).map((dayLabel) => {
      const dayItems = groups[dayLabel];
      const combined: any[] = [];
      dayItems.forEach((item) => {
        const existing = combined.find(
          (c) =>
            c.song.toLowerCase() === item.song.toLowerCase() &&
            c.artist.toLowerCase() === item.artist.toLowerCase() &&
            c.platform === item.platform
        );
        if (existing) {
          existing.timestamps.push(item.timestamp);
          existing.count += 1;
          if (new Date(item.timestamp) > new Date(existing.timestamp)) {
            existing.timestamp = item.timestamp;
            existing.id = item.id;
          }
        } else {
          combined.push({ ...item, timestamps: [item.timestamp], count: 1 });
        }
      });
      combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return { dayLabel, items: combined };
    });
  }

  async function fetchActivities(showLoading = false) {
    if (showLoading) isLoading = true;
    try {
      const res = await fetch('/api/activity');
      const data = await res.json();
      if (data.success) {
        activities = data.activities || [];
        const prev = currentlyPlaying;
        currentlyPlaying = data.currentlyPlaying || null;
        if (currentlyPlaying?.progressMs && currentlyPlaying?.id !== prev?.id) {
          liveProgressMs = currentlyPlaying.progressMs;
        }
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      if (showLoading) isLoading = false;
    }
  }

  function togglePreview(trackId: string, previewUrl: string, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!previewUrl) return;
    if (activePreviewId === trackId) {
      audio?.pause();
      activePreviewId = null;
      return;
    }
    audio?.pause();
    const newAudio = new Audio(previewUrl);
    newAudio.volume = 0.4;
    newAudio.play();
    newAudio.onended = () => { activePreviewId = null; };
    audio = newAudio;
    activePreviewId = trackId;
  }

  onMount(() => {
    fetchActivities(true);
    fetchInterval = setInterval(() => fetchActivities(false), 5000);

    progressInterval = setInterval(() => {
      if (currentlyPlaying?.isPlaying) {
        liveProgressMs = Math.min(liveProgressMs + 1000, currentlyPlaying?.durationMs ?? liveProgressMs);
      }
    }, 1000);
  });

  onDestroy(() => {
    clearInterval(fetchInterval);
    clearInterval(progressInterval);
    audio?.pause();
  });

  $: grouped = groupByDay(activities);
  $: progressPct = currentlyPlaying?.durationMs
    ? Math.min(100, (liveProgressMs / currentlyPlaying.durationMs) * 100)
    : 0;
</script>

<style>
  @keyframes bounce-bar-1 { 0%, 100% { height: 4px; } 50% { height: 16px; } }
  @keyframes bounce-bar-2 { 0%, 100% { height: 12px; } 50% { height: 4px; } }
  @keyframes bounce-bar-3 { 0%, 100% { height: 6px; } 50% { height: 14px; } }
  @keyframes bounce-bar-4 { 0%, 100% { height: 14px; } 50% { height: 8px; } }
  .bar-1 { animation: bounce-bar-1 1.0s ease-in-out infinite; }
  .bar-2 { animation: bounce-bar-2 1.2s ease-in-out infinite; }
  .bar-3 { animation: bounce-bar-3 0.8s ease-in-out infinite; }
  .bar-4 { animation: bounce-bar-4 1.1s ease-in-out infinite; }

  .listen-activity { display: grid; gap: 1.5rem; }

  .listen-header { display: grid; gap: 0.3rem; }
  .listen-header h3 { margin: 0; font-size: 1.05rem; font-weight: 700; color: hsl(var(--foreground)); }
  .listen-header p { margin: 0; font-size: 0.8125rem; color: hsl(var(--muted-foreground)); line-height: 1.55; }

  .now-playing-card {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    overflow: hidden;
    border: 1px solid hsl(220 13% 91% / 0.6);
    border-radius: 0.375rem;
    background: hsl(var(--background) / 0.5);
    padding: 1.25rem;
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease, transform 200ms ease;
    position: relative;
  }
  :global(.dark) .now-playing-card { border-color: hsl(215 28% 17% / 0.6); background: hsl(var(--background) / 0.3); }
  .now-playing-card:hover { background: hsl(var(--background) / 0.65); border-color: hsl(142 71% 45% / 0.3); transform: translateY(-1px); }

  @media (min-width: 640px) { .now-playing-card { flex-direction: row; align-items: center; } }

  .np-art {
    position: relative;
    width: 7rem;
    height: 7rem;
    flex-shrink: 0;
    border-radius: 0.375rem;
    overflow: hidden;
    border: 1px solid hsl(var(--border) / 0.4);
  }
  .np-art img { width: 100%; height: 100%; object-fit: cover; transition: transform 400ms ease; }
  .now-playing-card:hover .np-art img { transform: scale(1.05); }

  .np-details { flex: 1; min-width: 0; display: grid; gap: 0.4rem; }

  .np-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.2rem 0.6rem;
    border-radius: 0.25rem;
    background: hsl(142 71% 45% / 0.1);
    color: hsl(142 71% 35%);
    font-family: var(--font-mono);
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: lowercase;
    width: fit-content;
  }
  :global(.dark) .np-badge { color: hsl(142 71% 55%); }

  .music-bars { display: flex; align-items: flex-end; gap: 2px; height: 14px; }
  .music-bars span { width: 2px; background: hsl(142 71% 45%); border-radius: 1px; height: 4px; }

  .np-title { margin: 0; font-size: 0.9375rem; font-weight: 700; color: hsl(var(--foreground)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: color 150ms ease; }
  .now-playing-card:hover .np-title { color: hsl(142 71% 45%); }
  .np-artist { margin: 0; font-size: 0.75rem; font-weight: 600; color: hsl(var(--muted-foreground)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .np-album { margin: 0; font-family: var(--font-mono); font-size: 0.625rem; color: hsl(var(--muted-foreground)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .np-progress { display: grid; gap: 0.25rem; padding-top: 0.25rem; }
  .np-progress-times { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.5625rem; font-weight: 700; color: hsl(var(--muted-foreground)); }
  .np-bar { height: 3px; width: 100%; background: hsl(var(--border)); border-radius: 99px; overflow: hidden; }
  .np-bar-fill { height: 100%; background: hsl(142 71% 45%); border-radius: 99px; transition: width 1s linear; }

  .np-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; padding-top: 0.5rem; }
  .np-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.75rem;
    border: 1px solid hsl(142 71% 35%);
    border-radius: 0.375rem;
    background: transparent;
    color: hsl(142 71% 35%);
    font-family: var(--font-mono);
    font-size: 0.625rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: background 150ms ease;
  }
  :global(.dark) .np-btn { color: hsl(142 71% 55%); border-color: hsl(142 71% 45%); }
  .np-btn:hover { background: hsl(142 71% 45% / 0.1); }

  .day-group { display: grid; gap: 0.6rem; }
  .day-label { font-family: var(--font-mono); font-size: 0.625rem; font-weight: 700; color: hsl(var(--muted-foreground)); text-transform: lowercase; letter-spacing: 0.08em; }

  .track-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.75rem;
    border: 1px solid hsl(var(--border) / 0.6);
    border-radius: 0.375rem;
    background: hsl(var(--background) / 0.5);
    text-decoration: none;
    transition: background 150ms ease, border-color 150ms ease;
    min-width: 0;
  }
  :global(.dark) .track-card { background: hsl(var(--background) / 0.3); }
  .track-card:hover { background: hsl(var(--background) / 0.7); border-color: hsl(var(--border)); }

  .track-main { display: flex; align-items: center; gap: 0.65rem; min-width: 0; flex: 1; }
  .track-art { width: 2.5rem; height: 2.5rem; border-radius: 0.25rem; object-fit: cover; flex-shrink: 0; transition: transform 300ms ease; }
  .track-card:hover .track-art { transform: scale(1.05); }

  .track-info { min-width: 0; display: grid; gap: 0.2rem; }
  .track-name { margin: 0; font-size: 0.75rem; font-weight: 600; color: hsl(var(--foreground)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: color 150ms ease; }
  .track-card:hover .track-name { color: hsl(var(--pride-glow-val)); }
  .track-artist { margin: 0; font-size: 0.6875rem; color: hsl(var(--muted-foreground)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .track-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem 0.4rem; font-family: var(--font-mono); font-size: 0.5625rem; color: hsl(var(--muted-foreground)); margin-top: 0.1rem; }

  .platform-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.15rem;
    border-radius: 0.2rem;
    border: 1px solid;
  }
  .platform-badge.spotify { background: hsl(142 71% 45% / 0.05); border-color: hsl(142 71% 45% / 0.15); color: hsl(142 71% 40%); }
  .platform-badge.apple-music { background: hsl(340 82% 52% / 0.05); border-color: hsl(340 82% 52% / 0.15); color: hsl(340 82% 50%); }
  .platform-badge.youtube { background: hsl(0 72% 51% / 0.05); border-color: hsl(0 72% 51% / 0.15); color: hsl(0 72% 50%); }

  :global(.platform-icon) { width: 0.875rem; height: 0.875rem; display: block; }

  .play-count {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.15rem 0.4rem;
    border-radius: 0.2rem;
    background: hsl(var(--muted) / 0.4);
    border: 1px solid hsl(var(--border) / 0.3);
    color: hsl(var(--muted-foreground));
    font-size: 0.5625rem;
  }

  .track-times { display: flex; flex-wrap: wrap; gap: 0.2rem; align-items: center; margin-top: 0.25rem; font-family: var(--font-mono); font-size: 0.5625rem; color: hsl(var(--muted-foreground)); }
  .track-times-label { font-size: 0.5625rem; color: hsl(var(--muted-foreground)); margin-right: 0.1rem; }
  .time-chip { padding: 0.1rem 0.25rem; background: hsl(var(--muted) / 0.4); border: 1px solid hsl(var(--border) / 0.3); border-radius: 0.2rem; color: hsl(var(--muted-foreground)); }

  .preview-btn {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border: 1px solid hsl(var(--border));
    border-radius: 0.25rem;
    background: none;
    cursor: pointer;
    font-size: 0.625rem;
    color: hsl(var(--muted-foreground));
    transition: border-color 150ms ease, color 150ms ease, background 150ms ease;
  }
  .preview-btn:hover { border-color: hsl(142 71% 45% / 0.5); color: hsl(142 71% 45%); }
  .preview-btn.active { background: hsl(142 71% 45% / 0.1); border-color: hsl(142 71% 45% / 0.35); color: hsl(142 71% 45%); }

  .skeleton { display: grid; gap: 1.25rem; }
  .skeleton-group { display: grid; gap: 0.5rem; }
  .skeleton-label { height: 0.625rem; width: 5rem; background: hsl(var(--muted)); border-radius: 0.25rem; animation: pulse 1.5s ease-in-out infinite; }
  .skeleton-item { height: 3.5rem; background: hsl(var(--muted) / 0.5); border-radius: 0.375rem; animation: pulse 1.5s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

  .empty-state { font-size: 0.75rem; color: hsl(var(--muted-foreground)); }
</style>

<div class="listen-activity">
  <div class="listen-header">
    <h3>Listening activity</h3>
    <p>A live log of the music and tracks I am hearing on Spotify.</p>
  </div>

  {#if currentlyPlaying}
    <a href={currentlyPlaying.songUrl} target="_blank" rel="noopener noreferrer" class="now-playing-card">
      <div class="np-art">
        <img src={currentlyPlaying.artworkUrl} alt={currentlyPlaying.album} />
      </div>

      <div class="np-details">
        <span class="np-badge">
          <span class="music-bars">
            <span class="bar-1"></span>
            <span class="bar-2"></span>
            <span class="bar-3"></span>
            <span class="bar-4"></span>
          </span>
          now playing
        </span>

        <p class="np-title">{currentlyPlaying.song}</p>
        <p class="np-artist">by {currentlyPlaying.artist}</p>
        <p class="np-album">album: {currentlyPlaying.album.toLowerCase()}</p>

        {#if currentlyPlaying.durationMs}
          <div class="np-progress">
            <div class="np-progress-times">
              <span>{formatDuration(liveProgressMs)}</span>
              <span>{formatDuration(currentlyPlaying.durationMs)}</span>
            </div>
            <div class="np-bar">
              <div class="np-bar-fill" style="width: {progressPct}%"></div>
            </div>
          </div>
        {/if}

        <div class="np-actions">
          <button
            type="button"
            class="np-btn"
            on:click|stopPropagation={() => window.open(currentlyPlaying.songUrl, '_blank')}
          >
            {@html SpotifyIcon}
            listen along
          </button>
          {#if currentlyPlaying.previewUrl}
            <button
              type="button"
              class="np-btn"
              class:active={activePreviewId === currentlyPlaying.id}
              on:click={(e) => togglePreview(currentlyPlaying.id, currentlyPlaying.previewUrl, e)}
            >
              {activePreviewId === currentlyPlaying.id ? '⏸ pause preview' : '▶ play preview'}
            </button>
          {/if}
        </div>
      </div>
    </a>
  {/if}

  {#if isLoading}
    <div class="skeleton">
      {#each [1, 2, 3] as _}
        <div class="skeleton-group">
          <div class="skeleton-label"></div>
          <div class="skeleton-item"></div>
          <div class="skeleton-item"></div>
        </div>
      {/each}
    </div>
  {:else if grouped.length > 0}
    {#each grouped as group}
      <div class="day-group">
        <p class="day-label">{group.dayLabel}</p>
        <div style="display:grid;gap:0.5rem;">
          {#each group.items as item (item.id)}
            <a
              href={item.songUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="track-card"
            >
              <div class="track-main">
                <img src={item.artworkUrl} alt={item.album} class="track-art" />
                <div class="track-info">
                  <p class="track-name">{item.song}</p>
                  <p class="track-artist">{item.artist} — <em>{item.album}</em></p>
                  <div class="track-meta">
                    <span class="platform-badge {item.platform}">
                      {@html SpotifyIcon}
                    </span>
                    <span>via {item.platform === 'spotify' ? 'Spotify' : item.platform === 'apple-music' ? 'Apple Music' : 'YouTube'}</span>
                    <span>•</span>
                    <span>{formatTime(item.timestamp)}</span>
                    {#if item.count > 1}
                      <span>•</span>
                      <span class="play-count">
                        <Headphones size={10} strokeWidth={1.8} />
                        {item.count} plays
                      </span>
                    {/if}
                  </div>
                  {#if item.count > 1}
                    <div class="track-times">
                      <span class="track-times-label">times:</span>
                      {#each [...item.timestamps].reverse().slice(0, 5) as t}
                        <span class="time-chip">{formatTime(t)}</span>
                      {/each}
                      {#if item.timestamps.length > 5}
                        <span class="time-chip">+{item.timestamps.length - 5} more</span>
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>
              {#if item.previewUrl}
                <button
                  type="button"
                  class="preview-btn"
                  class:active={activePreviewId === item.id}
                  aria-label={activePreviewId === item.id ? 'Pause preview' : 'Play preview'}
                  on:click={(e) => togglePreview(item.id, item.previewUrl, e)}
                >
                  {activePreviewId === item.id ? '⏸' : '▶'}
                </button>
              {/if}
            </a>
          {/each}
        </div>
      </div>
    {/each}
  {:else}
    <p class="empty-state">No recent music activities found.</p>
  {/if}
</div>
