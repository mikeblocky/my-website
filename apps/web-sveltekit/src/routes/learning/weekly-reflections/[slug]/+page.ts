import { weeks } from '@mikeblocky/site-data/learning';
import { error } from '@sveltejs/kit';

export const prerender = true;

export function entries() {
  return weeks.map((week) => ({ slug: week.href.split('/').pop() ?? '' }));
}

export async function load({ params }) {
  const week = weeks.find((item) => item.href.endsWith(`/${params.slug}`));

  if (!week) {
    throw error(404, 'Week not found');
  }

  // Load the MDX file component dynamically
  try {
    const modules = import.meta.glob('../weeks/*/content.mdx');
    const path = `../weeks/${params.slug}/content.mdx`;
    if (modules[path]) {
      const componentModule: any = await modules[path]();
      return {
        week,
        content: componentModule.default
      };
    }
  } catch (err) {
    console.error('Failed to import MDX:', err);
  }

  throw error(404, 'Reflection content not found');
}
