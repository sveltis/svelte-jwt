import type { Handle } from '@sveltejs/kit';
import * as jose from 'jose';

const key = await jose.generateSecret('HS256');

type SvelteJWTConfig = {
	issuer: string;
	audience: string;
	jwt: string;
};

type JWTGenerate = (payload: App.JWTPayload) => Promise<string>;

export interface ISvelteJWTHelper {
	parse(jwt: string): Promise<App.JWTPayload>;
	generate: JWTGenerate;
}

export type SvelteJWT = {
	payload: App.JWTPayload | undefined;
	generate: JWTGenerate;
};

class SvelteJWTHelper implements ISvelteJWTHelper {
	public constructor(private _issuer: string, private _audience: string) {}

	public parse = async (jwt: string): Promise<App.JWTPayload> => {
		const { payload } = await jose.jwtDecrypt(jwt, key, {
			issuer: this._issuer,
			audience: this._audience
		});

		return payload as unknown as App.JWTPayload;
	};

	public generate = async (payload: App.JWTPayload): Promise<string> => {
		const jwt = await new jose.EncryptJWT({ ...payload } as jose.JWTPayload)
			.setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
			.setIssuedAt()
			.setIssuer(this._issuer)
			.setAudience(this._audience)
			.setExpirationTime('2h')
			.encrypt(key);
		return jwt;
	};
}

export const handleJWT =
	(config: SvelteJWTConfig): Handle =>
	async ({ event, resolve }) => {
		const auth = event.request.headers.get('Authorization');
		const { generate, parse } = new SvelteJWTHelper(config.issuer, config.audience);
		let payload;
		if (auth && auth.includes('Bearer')) {
			const [, jwt] = auth.split(' ');
			payload = await parse(jwt);
		}
		event.locals.jwt = {
			generate,
			payload
		};
		return resolve(event);
	};
