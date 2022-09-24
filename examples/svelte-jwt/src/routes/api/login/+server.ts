import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals, cookies, request }) => {
	const { jwt } = locals;
	const { login } = await request.json();
	if (!login) {
		return new Response('empty login');
	}

	const payload: App.JwtPayload = {
		login,
		role: 'user'
	};
	await jwt.generate(payload, cookies);
	return new Response(JSON.stringify(payload));
};
