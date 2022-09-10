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
	key: SvelteKey;
	payloadDefault: T;
};

export class SvelteJWTHelper<T> implements ISvelteJWTHelper<T> {
	private _issuer: string;
	private _audience: string;
	private _key: SvelteKey;
	private _payloadDefault: T;
	private _bearer: string | undefined;

	public constructor({ issuer, audience, key, payloadDefault }: SvelteHelperProps<T>) {
		this._issuer = issuer;
		this._audience = audience;
		this._key = key;
		this._payloadDefault = payloadDefault;
	}

	public static createKey = async (): Promise<SvelteKey> => {
		return (await jose.generateSecret('HS256')) as SvelteKey;
	};

	public attachBearer = (jwt: string): void => {
		this._bearer = jwt;
	};

	public parse = async (): Promise<T> => {
		console.log('bearer', this._bearer);
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
	};

	public generate = async <T>(payload: T): Promise<string> => {
		const jwt = await new jose.EncryptJWT({ ...payload } as jose.JWTPayload)
			.setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
			.setIssuedAt()
			.setIssuer(this._issuer)
			.setAudience(this._audience)
			.setExpirationTime('2h')
			.encrypt(this._key);
		return jwt;
	};
}