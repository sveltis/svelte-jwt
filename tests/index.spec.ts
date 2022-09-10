import { assert, describe, expect, it } from 'vitest';
import { SvelteJWTHelper } from '../src/classes/index';
import * as jose from 'jose';

const key = await SvelteJWTHelper.createKey();

type JWTPayload = {
	id: string;
};

describe('SvelteJWTHelper', () => {
	it('shoud create a JWT token', async () => {
		const [issuer, audience] = ['iss', 'aud'];
		const instance = new SvelteJWTHelper<JWTPayload>({
			issuer,
			audience,
			key,
			payloadDefault: { id: 'unknown' }
		});
		const token = instance.generate({ id: 123 });
		expect(token).toBeTruthy();
	});
});