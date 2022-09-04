import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	const { jwt } = locals;
	return new Response(JSON.stringify(jwt.payload));
};
