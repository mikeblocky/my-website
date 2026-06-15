import { error } from '@sveltejs/kit';
import { readingSeries, dailyNotes } from '@mikeblocky/site-data';

const allEntries = [...readingSeries, ...dailyNotes];

export const prerender = true;

export function entries() {
  return allEntries.map((n) => ({ slug: n.slug }));
}

export function load({ params }: { params: { slug: string } }) {
  const note = allEntries.find((n) => n.slug === params.slug);
  if (!note) throw error(404, 'Note not found');
  return { note };
}
