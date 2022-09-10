import { handleJWT } from '$lib';
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(handleJWT({ issuer: 'issuer', audience: 'aud' }));
