declare module '*.mdx' {
	import type { ComponentType } from 'svelte';
	const component: ComponentType;
	export default component;
}

declare namespace svelteHTML {
	interface HTMLAttributes<T> {
		'on:emoji:open'?: (
			event: CustomEvent<import('$lib/actions/emojiAutocomplete').EmojiAutocompleteState>
		) => void;
		'on:emoji:close'?: (event: CustomEvent<void>) => void;
	}
}
