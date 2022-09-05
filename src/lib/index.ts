import type { Handle } from '@sveltejs/kit';
import { SvelteJWTHelper, type JWTGenerate } from '../classes';

const key = await SvelteJWTHelper.createKey();

export type SvelteJWT = {
	payload: App.JWTPayload | undefined;
	generate: JWTGenerate;
};

type SvelteJWTConfig = {
	issuer: string;
	audience: string;
};

export const handleJWT =
	(config: SvelteJWTConfig): Handle =>
	async ({ event, resolve }) => {
		const { generate, parse } = new SvelteJWTHelper<App.JWTPayload>(
			config.issuer,
			config.audience,
			key
		);
		let payload;
		const auth = event.request.headers.get('Authorization');
		if (auth && auth.includes('Bearer')) {
			const [, jwt] = auth.split(' ');
			payload = await parse(jwt);
		}
		event.locals.jwt = { generate, payload };
		return resolve(event);
	};
