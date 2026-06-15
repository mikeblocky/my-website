import { error } from '@sveltejs/kit';
import { getDrawingById } from '$lib/kv/sketchbook';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const drawing = await getDrawingById(id);

	if (!drawing) {
		throw error(404, 'Drawing not found');
	}

	return {
		id,
		drawing
	};
};
