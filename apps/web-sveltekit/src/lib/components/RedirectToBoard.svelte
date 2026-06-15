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
    ? 'text-sky-600 dark:text-sky-400 bg-sky-50/20 dark:bg-sky-900/10 border-sky-100 dark:border-sky-900/20'
    : isTalk
      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/20 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/20'
      : isSketchbook
        ? 'text-amber-700 dark:text-amber-300 bg-amber-50/25 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20'
        : 'text-violet-650 dark:text-violet-400 bg-violet-50/20 dark:bg-violet-900/10 border-violet-100 dark:border-violet-900/20';

  const loaderColor = isSuggestion ? 'border-sky-500' : isTalk ? 'border-indigo-500' : isSketchbook ? 'border-amber-500' : 'border-violet-500';
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
        class="block w-full py-2.5 px-5 text-sm font-semibold rounded-md text-center transition-all duration-200 border border-transparent hover:-translate-y-0.5 active:scale-[0.98] {isSuggestion ? 'bg-sky-600 text-white hover:bg-sky-700' : isTalk ? 'bg-indigo-600 text-white hover:bg-indigo-700' : isSketchbook ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-violet-600 text-white hover:bg-violet-700'}"
      >
        Press to enter board
      </a>
    </div>
  </div>
</div>
