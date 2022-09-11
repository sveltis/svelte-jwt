import type { Handle } from '@sveltejs/kit';
import * as jose from 'jose';

export type JWTGenerate = <T>(payload: T) => Promise<string>;

export interface ISvelteJWTHelper<T> {
	parse(jwt: string): Promise<T>;
	generate: JWTGenerate;
	attachBearer(jwt: string): void;
}
export type SvelteKey = jose.KeyLike;

type SvelteHelperProps<T> = {
	issuer: string;
	audience: string;
	expirationTime?: string;
	key: SvelteKey;
	payloadDefault: T;
};

export class SvelteJWTHelper<T> implements ISvelteJWTHelper<T> {
	private _issuer: string;
	private _audience: string;
	private _key: SvelteKey;
	private _payloadDefault: T;
	private _bearer: string | undefined;
	private _expirationTime: string;

	public constructor({
		issuer,
		audience,
		key,
		payloadDefault,
		expirationTime
	}: SvelteHelperProps<T>) {
		this._issuer = issuer;
		this._audience = audience;
		this._key = key;
		this._payloadDefault = payloadDefault;
		this._expirationTime = expirationTime || '2h';
	}

	public static createKey = async (): Promise<SvelteKey> => {
		return (await jose.generateSecret('HS256')) as SvelteKey;
	};

	public attachBearer = (jwt: string): void => {
		this._bearer = jwt;
	};

	public parse = async (): Promise<T> => {
		try {
			if (!this._bearer) return this._payloadDefault;
			const { payload } = await jose.jwtDecrypt(this._bearer, this._key, {
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
			throw new Error('Parsing JWT error');
		}
	};

	public generate = async <T>(payload: T): Promise<string> => {
		try {
			const jwt = await new jose.EncryptJWT({ ...payload } as jose.JWTPayload)
				.setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
				.setIssuedAt()
				.setIssuer(this._issuer)
				.setAudience(this._audience)
				.setExpirationTime(this._expirationTime)
				.encrypt(this._key);
			return jwt;
		} catch (error) {
			throw new Error('JWT can not be created');
		}
	};
}

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
