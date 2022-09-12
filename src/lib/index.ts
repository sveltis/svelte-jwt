import type { Cookies, Handle } from '@sveltejs/kit';
import * as jose from 'jose';

export type JWTGenerate<T> = (payload: T, cookies: Cookies) => Promise<void>;

export interface ISvelteJWTHelper<T> {
	parse(cookies: Cookies): Promise<T>;
	generate: JWTGenerate<T>;
}
export type SvelteKey = jose.KeyLike;

type SvelteHelperProps<T> = {
	issuer: string;
	audience: string;
	expirationTime?: string;
	key: SvelteKey;
	payloadDefault: T;
	cookieName?: string;
};

export class SvelteJWTHelper<T> implements ISvelteJWTHelper<T> {
	private _issuer: string;
	private _audience: string;
	private _key: SvelteKey;
	private _payloadDefault: T;
	private _expirationTime: string;
	private _cookieName = 'session';

	public constructor({
		issuer,
		audience,
		key,
		payloadDefault,
		expirationTime,
		cookieName
	}: SvelteHelperProps<T>) {
		this._issuer = issuer;
		this._audience = audience;
		this._key = key;
		this._payloadDefault = payloadDefault;
		this._expirationTime = expirationTime || '2h';
		if (cookieName) {
			this._cookieName = cookieName;
		}
	}

	public static createKey = async (): Promise<SvelteKey> => {
		return (await jose.generateSecret('HS256')) as SvelteKey;
	};

	public parse = async (cookies: Cookies): Promise<T> => {
		const jwt = cookies.get(this._cookieName);
		try {
			if (!jwt) return this._payloadDefault;
			const { payload } = await jose.jwtDecrypt(jwt, this._key, {
				issuer: this._issuer,
				audience: this._audience
			});
			const result = this._payloadDefault;
			for (const key in this._payloadDefault) {
				if (Object.prototype.hasOwnProperty.call(this._payloadDefault, key) && payload?.[key]) {
					result[key] = (payload as unknown as T)[key];
				}
			}

			return result;
		} catch (error) {
			if (jwt) {
				cookies.delete(this._cookieName);
				return this._payloadDefault;
			} else {
				throw new Error('Parsing JWT error');
			}
		}
	};

	public generate = async (payload: T, cookies: Cookies): Promise<void> => {
		try {
			const jwt = await new jose.EncryptJWT({ ...payload } as jose.JWTPayload)
				.setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
				.setIssuedAt()
				.setIssuer(this._issuer)
				.setAudience(this._audience)
				.setExpirationTime(this._expirationTime)
				.encrypt(this._key);
			cookies.set(this._cookieName, jwt, { httpOnly: true, path: '/' });
		} catch (error) {
			throw new Error('JWT can not be created');
		}
	};
}

const key = await SvelteJWTHelper.createKey();

export type SvelteJWT<T> = {
	payload: T;
	generate: JWTGenerate<T>;
};

type SvelteJWTConfig<T> = {
	issuer: string;
	audience: string;
	payloadDefault: T;
};

export const handleJWT = <T>(config: SvelteJWTConfig<T>): Handle => {
	const { issuer, audience, payloadDefault } = config;

	const { generate, parse } = new SvelteJWTHelper<T>({
		issuer,
		audience,
		key,
		payloadDefault
	});
	return async ({ event, resolve }) => {
		const payload = (await parse(event.cookies)) as unknown as typeof event.locals.jwt.payload;
		const customGenerate = generate as JWTGenerate<typeof event.locals.jwt.payload>;
		event.locals.jwt = { generate: customGenerate, payload };
		return resolve(event);
	};
};
