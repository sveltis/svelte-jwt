import * as jose from 'jose';

export type JWTGenerate = <T>(payload: T) => Promise<string>;

export interface ISvelteJWTHelper<T> {
	parse(jwt: string): Promise<T>;
	generate: JWTGenerate;
}

export class SvelteJWTHelper<T> implements ISvelteJWTHelper<T> {
	public constructor(
		private _issuer: string,
		private _audience: string,
		private _key: jose.KeyLike
	) {}

	public static createKey = async (): Promise<jose.KeyLike> => {
		return (await jose.generateSecret('HS256')) as jose.KeyLike;
	};

	public parse = async (jwt: string): Promise<T> => {
		const { payload } = await jose.jwtDecrypt(jwt, this._key, {
			issuer: this._issuer,
			audience: this._audience
		});

		return payload as unknown as T;
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
