<script lang="ts">
  import { Lock, Unlock } from '@lucide/svelte';

  type AdminAccent = 'blue' | 'violet' | 'teal';

  export let isAdminMode = false;
  export let passcode = '';
  export let showPasscodeInput = false;
  export let onEnabled: () => void = () => {};
  export let accent: AdminAccent = 'blue';

  const accentStyles: Record<AdminAccent, { hover: string; active: string; ring: string }> = {
    blue: {
      hover: 'hover:text-blue-700 dark:hover:text-blue-300',
      active: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400',
      ring: 'focus:ring-blue-500',
    },
    violet: {
      hover: 'hover:text-violet-700 dark:hover:text-violet-300',
      active: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400',
      ring: 'focus:ring-violet-500',
    },
    teal: {
      hover: 'hover:text-teal-700 dark:hover:text-teal-350',
      active: 'text-teal-600 bg-teal-50 dark:bg-teal-950/20 dark:text-teal-400',
      ring: 'focus:ring-teal-500',
    },
  };

  $: styles = accentStyles[accent];

  function enableAdmin() {
    isAdminMode = true;
    showPasscodeInput = false;
    onEnabled();
  }

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    passcode = input.value;
    if (passcode.length >= 4) {
      enableAdmin();
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      enableAdmin();
    }
  }

  function toggleInput() {
    if (isAdminMode) {
      isAdminMode = false;
      passcode = '';
    } else {
      showPasscodeInput = !showPasscodeInput;
    }
  }
</script>

<div class="ml-2 flex items-center gap-1.5">
  <button
    type="button"
    on:click={toggleInput}
    class="flex items-center justify-center rounded-full p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-200/50 dark:hover:bg-slate-800/40 {styles.hover} {isAdminMode ? styles.active : ''}"
    title={isAdminMode ? 'Disable Admin Mode' : 'Enable Admin Mode'}
  >
    <svelte:component this={isAdminMode ? Unlock : Lock} size={14} strokeWidth={1.8} />
  </button>

  {#if showPasscodeInput && !isAdminMode}
    <div class="flex w-[110px] items-center overflow-hidden">
      <input
        type="password"
        value={passcode}
        on:input={handleInput}
        on:keydown={handleKeyDown}
        placeholder="Passcode"
        class="w-full rounded-md border border-slate-200 bg-background px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:ring-1 dark:border-slate-800 dark:text-slate-100 {styles.ring}"
      />
    </div>
  {/if}
</div>
