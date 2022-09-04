import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals, request }) => {
	const { jwt } = locals;
	const { token } = await request.json();
	const obj = await jwt.parse(token);
	return new Response(JSON.stringify(obj));
};
