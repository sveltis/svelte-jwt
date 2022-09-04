import type { Handle } from '@sveltejs/kit';
import * as jose from 'jose';

const key = await jose.generateSecret('HS256');

export type SvelteJWT = {
	parse(jwt: string): Promise<App.JWTPayload>;
	generate(payload: App.JWTPayload): Promise<string>;
};

type SvelteJWTConfig = {
	issuer: string;
	audience: string;
};

class SvelteJWTHelper implements SvelteJWT {
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
	({ event, resolve }) => {
		event.locals.jwt = new SvelteJWTHelper(config.issuer, config.audience);
		return resolve(event);
	};
