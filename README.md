# Work In Progress...

## Quick start

### Extend App.Locals and add JwtPayload interface in `app.d.ts`

```ts
declare namespace App {
  // ...
  interface Locals {
    jwt: import('@sveltis/jwt').SvelteJWT<JwtPayload>;
  }

  interface JwtPayload {
    login: string;
    role: 'user' | 'guest' | 'admin';
  }
  // ...
}
```

### Update `hooks.server.ts`

```ts
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
```

### Generating token in endpoint

```ts
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals }) => {
  const { jwt } = locals;
  const token = await jwt.generate({
    role: 'user',
    login: 'max'
  });
  return new Response(JSON.stringify({ token }));
};
```

## Reading JWT payload in endpoint

```ts
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
  const { jwt } = locals;
  return new Response(JSON.stringify(jwt.payload));
};
```
