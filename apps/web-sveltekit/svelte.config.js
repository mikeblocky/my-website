import adapterNode from '@sveltejs/adapter-node';
import adapterVercel from '@sveltejs/adapter-vercel';
import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import { mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import rehypeSlug from 'rehype-slug';

const adapter =
  process.env.CLOUDFLARE_BUILD ? adapterCloudflare() : process.platform === 'win32' && !process.env.VERCEL ? adapterNode() : adapterVercel();

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.svx', '.md', '.mdx'],
  preprocess: [vitePreprocess(), mdsvex({ extensions: ['.svx', '.md', '.mdx'], rehypePlugins: [rehypeSlug] })],
  kit: {
    adapter,
    csp: { mode: 'auto', directives: { 'script-src': ['self'], 'object-src': ['none'], 'base-uri': ['self'], 'frame-ancestors': ['none'], 'form-action': ['self'] } },
    env: {
      publicPrefix: 'NEXT_PUBLIC_'
    },
    alias: {
      $ogRenderer: './src/lib/og/renderer.node.ts',
      $ogGenerate: process.env.CLOUDFLARE_BUILD ? './src/lib/og/generate.cloudflare.ts' : './src/lib/og/generate.ts',
      $lib: './src/lib',
      '@': '../../src',
      $siteData: '../../packages/site-data/src'
    },
    files: {
      assets: '../../public'
    }
  }
};

export default config;
