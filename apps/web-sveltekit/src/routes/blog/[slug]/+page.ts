import { error } from '@sveltejs/kit';
import { getBlogPostBySlug } from '@mikeblocky/site-data';

export async function load({ params }) {
  const { slug } = params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    throw error(404, 'Post not found');
  }

  // Use Vite's import.meta.glob to dynamically import post contents
  const mdxModules = import.meta.glob('../posts/*/content.mdx');
  const svelteModules = import.meta.glob('../posts/*/page.svelte');

  const mdxPath = `../posts/${slug}/content.mdx`;
  const sveltePath = `../posts/${slug}/page.svelte`;

  if (mdxModules[mdxPath]) {
    const mod: any = await mdxModules[mdxPath]();
    return {
      post,
      content: mod.default,
      type: 'mdx'
    };
  } else if (svelteModules[sveltePath]) {
    const mod: any = await svelteModules[sveltePath]();
    return {
      post,
      content: mod.default,
      type: 'svelte'
    };
  }

  throw error(404, 'Content not found');
}
