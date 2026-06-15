<script lang="ts">
  export let username: string;
  export let description: string;
  export let tag: string;
</script>

<article class="friend-card pride-soft-card">
  <div class="friend-card-inner">
    <div class="friend-avatar">
      <img src={`https://unavatar.io/twitter/${username}`} alt={username} loading="lazy" />
    </div>

    <div class="friend-body">
      <div class="friend-meta">
        <span>@{username.toLowerCase()}</span>
        <small>{tag.toLowerCase()}</small>
      </div>
      <p>"{description}"</p>
      <a href={`https://twitter.com/${username}`} target="_blank" rel="noopener noreferrer">view profile →</a>
    </div>
  </div>
</article>
