import { handleJWT } from '$lib';
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(
	handleJWT<App.JwtPayload>({
		issuer: 'issuer',
		audience: 'aud',
		payloadDefault: {
			role: 'guest',
			login: ''
		}
	})
);
