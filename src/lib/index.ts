import type { Handle } from '@sveltejs/kit';
import { SvelteJWTHelper, type JWTGenerate } from '../classes';

const key = await SvelteJWTHelper.createKey();

export type SvelteJWT<T> = {
	payload: T;
	generate: JWTGenerate;
};

type SvelteJWTConfig<T> = {
	issuer: string;
	audience: string;
	payloadDefault: T;
};

export const handleJWT = <T>(config: SvelteJWTConfig<T>): Handle => {
	const { issuer, audience, payloadDefault } = config;

	const { generate, parse, attachBearer } = new SvelteJWTHelper<T>({
		issuer,
		audience,
		key,
		payloadDefault
	});

	return async ({ event, resolve }) => {
		const auth = event.request.headers.get('Authorization');
		if (auth && auth.includes('Bearer')) {
			const [, jwt] = auth.split(' ');
			attachBearer(jwt);
		}
		const payload = (await parse()) as unknown as typeof event.locals.jwt.payload;
		event.locals.jwt = { generate, payload };
		return resolve(event);
	};
};
