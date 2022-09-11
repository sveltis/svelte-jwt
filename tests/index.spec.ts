import { describe, expect, it } from 'vitest';
import { SvelteJWTHelper } from '../src/lib/';

const key = await SvelteJWTHelper.createKey();

type SimplePayload = {
	id: string;
};

type ComplexPayload = {
	id: number;
	str: string;
	bool: boolean;
};

const [issuer, audience] = ['iss', 'aud'];

describe('SvelteJWTHelper', () => {
	it('shoud create a JWT token', async () => {
		const instance = new SvelteJWTHelper<SimplePayload>({
			issuer,
			audience,
			key,
			payloadDefault: { id: 'unknown' }
		});
		const token = await instance.generate({ id: 123 });
		expect(typeof token).toBe('string');
	});

	it('should return default payload if token is not defined', async () => {
		const id = 'unknown';
		const instance = new SvelteJWTHelper<SimplePayload>({
			issuer,
			audience,
			key,
			payloadDefault: { id }
		});

		const result = await instance.parse();
		expect(result.id).toBe(id);
	});

	it('should parse object', async () => {
		const payload = {
			id: 123,
			str: 'string',
			bool: true
		};

		const instance = new SvelteJWTHelper<ComplexPayload>({
			issuer,
			audience,
			key,
			payloadDefault: { id: 0, str: '', bool: false }
		});
		const token = await instance.generate(payload);

		instance.attachBearer(token);

		const object = await instance.parse();
		expect(object.id).toBe(payload.id);
		expect(object.bool).toBe(payload.bool);
		expect(object.str).toBe(payload.str);
	});

	it('should not contain other data', async () => {
		const payload: ComplexPayload = {
			id: 123,
			str: 'string',
			bool: true
		};

		const instance = new SvelteJWTHelper<ComplexPayload>({
			issuer,
			audience,
			key,
			payloadDefault: { id: 0, str: '', bool: false }
		});
		const token = await instance.generate(payload);
		instance.attachBearer(token);
		const result = await instance.parse();
		Object.keys(result).forEach((el) => {
			expect(Object.keys(payload)).includes(el);
		});
	});
});
