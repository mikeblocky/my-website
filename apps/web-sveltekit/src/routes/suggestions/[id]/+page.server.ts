import { error } from '@sveltejs/kit';
import { getSuggestionById } from '$lib/kv/suggestions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const suggestion = await getSuggestionById(id);

	if (!suggestion) {
		throw error(404, 'Suggestion not found');
	}

	return {
		id,
		suggestion
	};
};
