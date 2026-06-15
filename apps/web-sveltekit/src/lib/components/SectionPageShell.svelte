<script lang="ts">
  import BaseContainer from './BaseContainer.svelte';
  import StackVertical from './StackVertical.svelte';
  import PageIntro from './PageIntro.svelte';
  import SiteFooter from './SiteFooter.svelte';

  export let title: string;
  export let description = '';
  export let currentLabel = '';
  export let containerSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full' = 'lg';
  export let contentGap: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'lg';
  export let footerColor = 'blue';
</script>

<BaseContainer size={containerSize} paddingX="md" paddingY="lg">
  <StackVertical gap={contentGap}>
    <PageIntro
      eyebrow={currentLabel}
      {title}
      {description}
    />

    <slot />
  </StackVertical>

  <SiteFooter color={footerColor} />
</BaseContainer>
