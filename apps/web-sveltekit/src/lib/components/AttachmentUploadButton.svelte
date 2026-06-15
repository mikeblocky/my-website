<script lang="ts">
  import { Image as ImageIcon } from '@lucide/svelte';

  type AttachmentAccent = 'blue' | 'violet' | 'teal' | 'emerald' | 'indigo' | 'sky';

  export let onFiles: (files: File[]) => void;
  export let iconSize = 12;
  export let className = '';
  export let accent: AttachmentAccent = 'blue';

  const accentClasses: Record<AttachmentAccent, string> = {
    blue: 'hover:text-blue-500',
    violet: 'hover:text-violet-500',
    teal: 'hover:text-teal-650 dark:hover:text-teal-300',
    indigo: 'hover:text-indigo-500',
    sky: 'hover:text-sky-500',
    emerald: 'hover:text-emerald-500',
  };

  function handleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
      onFiles(Array.from(files));
    }
    input.value = '';
  }
</script>

<label
  class="flex cursor-pointer items-center gap-1 font-semibold text-slate-500 transition-colors select-none {accentClasses[accent]} {!className.includes('text-') ? 'text-xs' : ''} {className}"
>
  <input
    type="file"
    accept="image/*"
    multiple
    on:change={handleChange}
    class="hidden"
  />
  <ImageIcon size={iconSize} />
  <span><slot>Attach images</slot></span>
</label>
