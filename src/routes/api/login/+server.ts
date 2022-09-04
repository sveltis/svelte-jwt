import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals }) => {
	const { jwt } = locals;
	const token = await jwt.generate({
		id: 'sample-id',
		secret: 'secret'
	});
	return new Response(JSON.stringify({ token }));
};
