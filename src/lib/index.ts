import type { Handle } from '@sveltejs/kit';
import { SvelteJWTHelper, type JWTGenerate } from '../classes';

const key = await SvelteJWTHelper.createKey();

export type SvelteJWT = {
	payload: App.JWTPayload;
	generate: JWTGenerate;
};

type SvelteJWTConfig = {
	issuer: string;
	audience: string;
};

export const handleJWT =
	(config: SvelteJWTConfig): Handle =>
	async ({ event, resolve }) => {
		const { issuer, audience } = config;
		const { generate, parse, attachBearer } = new SvelteJWTHelper<App.JWTPayload>({
			issuer,
			audience,
			key,
			payloadDefault: {
				id: '',
				secret: ''
			}
		});

		const auth = event.request.headers.get('Authorization');
		if (auth && auth.includes('Bearer')) {
			const [, jwt] = auth.split(' ');
			attachBearer(jwt);
		}
		const payload = await parse();
		event.locals.jwt = { generate, payload };
		return resolve(event);
	};
