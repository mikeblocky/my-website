import adapterNode from '@sveltejs/adapter-node';
import adapterVercel from '@sveltejs/adapter-vercel';
import { mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import rehypeSlug from 'rehype-slug';

const adapter =
  process.platform === 'win32' && !process.env.VERCEL ? adapterNode() : adapterVercel();

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.svx', '.md', '.mdx'],
  preprocess: [vitePreprocess(), mdsvex({ extensions: ['.svx', '.md', '.mdx'], rehypePlugins: [rehypeSlug] })],
  kit: {
    adapter,
    env: {
      publicPrefix: 'NEXT_PUBLIC_'
    },
    alias: {
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
