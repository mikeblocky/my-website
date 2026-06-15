import { error } from '@sveltejs/kit';
import { getTalkById } from '$lib/kv/talk';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const talk = await getTalkById(id);

	if (!talk) {
		throw error(404, 'Post not found');
	}

	return {
		id,
		talk
	};
};
