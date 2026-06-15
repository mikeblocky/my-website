import { error } from '@sveltejs/kit';
import { getPromptById } from '$lib/kv/draw';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const prompt = await getPromptById(id);

	if (!prompt) {
		throw error(404, 'Prompt not found');
	}

	return {
		id,
		prompt
	};
};
