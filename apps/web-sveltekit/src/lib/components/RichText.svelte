<script lang="ts">
  export let text = '';
  export let theme: 'blue' | 'violet' | 'indigo' | 'sky' = 'violet';
  export let className = '';

  const linkColors = {
    blue: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
    violet: 'text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300',
    indigo: 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300',
    sky: 'text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300',
  };

  $: linkColor = linkColors[theme];

  function parseText(inputText: string) {
    if (!inputText) return [];
    const lines = inputText.split('\n');
    return lines.map((line) => {
      if (line === '') return { type: 'empty' };

      const regex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|((?:https?):\/\/[^\s/$.?#].[^\s<>]*)|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)/g;
      const tokens = [];
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          tokens.push({ type: 'text', content: line.substring(lastIndex, match.index) });
        }
        if (match[1]) {
          // Markdown link
          tokens.push({ type: 'link', text: match[2], url: match[3] });
        } else if (match[4]) {
          // Raw URL
          tokens.push({ type: 'link', text: match[4], url: match[4] });
        } else if (match[5]) {
          // Bold
          tokens.push({ type: 'bold', content: match[6] });
        } else if (match[7]) {
          // Italic
          tokens.push({ type: 'italic', content: match[8] });
        } else if (match[9]) {
          // Inline code
          tokens.push({ type: 'code', content: match[10] });
        }
        lastIndex = regex.lastIndex;
      }
      if (lastIndex < line.length) {
        tokens.push({ type: 'text', content: line.substring(lastIndex) });
      }
      return { type: 'line', tokens };
    });
  }

  $: parsedLines = parseText(text);
</script>

<span class="block space-y-1 {className}">
  {#each parsedLines as line}
    {#if line.type === 'empty'}
      <span class="block h-2"></span>
    {:else}
      <span class="block leading-relaxed break-words text-gray-700 dark:text-gray-300">
        {#each line.tokens as token}
          {#if token.type === 'text'}
            {token.content}
          {:else}
            {#if token.type === 'link'}
              <a
                href={token.url}
                target="_blank"
                rel="noopener noreferrer"
                class="{linkColor} hover:underline break-all font-medium transition-colors"
              >
                {token.text}
              </a>
            {:else if token.type === 'bold'}
              <strong class="font-bold text-gray-900 dark:text-gray-100">{token.content}</strong>
            {:else if token.type === 'italic'}
              <em class="italic text-gray-800 dark:text-gray-200">{token.content}</em>
            {:else if token.type === 'code'}
              <code class="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800/80 font-mono text-sm text-pink-600 dark:text-pink-400 border border-gray-200/80 dark:border-gray-700/80">{token.content}</code>
            {/if}
          {/if}
        {/each}
      </span>
    {/if}
  {/each}
</span>
