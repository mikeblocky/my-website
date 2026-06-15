<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  export let id: string;
  export let type: 'talk' | 'question' | 'prompt' | 'suggestion' | 'sketchbook';

  const destination = type === 'suggestion'
    ? `/interact?tab=suggestions#suggestion-${id}`
    : type === 'talk' || type === 'question'
      ? `/interact?tab=guestbook#talk-${id}`
      : type === 'sketchbook'
        ? `/interact?tab=sketchbook#drawing-${id}`
        : `/interact?tab=prompts#prompt-${id}`;

  onMount(() => {
    goto(destination, { replaceState: true });
  });

  const isTalk = type === 'talk' || type === 'question';
  const isSuggestion = type === 'suggestion';
  const isSketchbook = type === 'sketchbook';

  const accentColor = isSuggestion
    ? 'text-teal-650 dark:text-teal-400 bg-teal-50/20 dark:bg-teal-900/10 border-teal-100 dark:border-teal-900/20'
    : isTalk
      ? 'text-blue-650 dark:text-blue-400 bg-blue-50/20 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20'
      : 'text-violet-650 dark:text-violet-400 bg-violet-50/20 dark:bg-violet-900/10 border-violet-100 dark:border-violet-900/20';

  const loaderColor = isSuggestion ? 'border-teal-500' : isTalk ? 'border-blue-500' : 'border-violet-500';
  const boardLabel = isSuggestion 
    ? 'Media suggestions' 
    : isTalk 
      ? 'Talk board' 
      : isSketchbook 
        ? 'Sketchbook board' 
        : 'Draw prompts';
</script>

<div class="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
  <div class="rounded-md border p-8 max-w-sm w-full space-y-5 bg-slate-50/70 dark:bg-slate-900/60 {accentColor}">
    <div class="flex justify-center">
      <div class="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin {loaderColor}"></div>
    </div>
    
    <div class="space-y-1">
      <h3 class="text-sm font-semibold">
        Entering {boardLabel}
      </h3>
      <p class="text-xs opacity-75">
        Locating your shared item...
      </p>
    </div>

    <div class="pt-2">
      <a
        href={destination}
        class="block w-full py-2.5 px-5 text-sm font-semibold rounded-md text-center transition-all duration-200 border border-transparent hover:-translate-y-0.5 active:scale-[0.98] {isSuggestion ? 'bg-teal-600 text-white hover:bg-teal-700' : isTalk ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-violet-600 text-white hover:bg-violet-700'}"
      >
        Press to enter board
      </a>
    </div>
  </div>
</div>
