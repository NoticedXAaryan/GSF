import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields } from 'better-auth/client/plugins';
import type { auth } from './auth';

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;

/**
 * Full document navigation after sign-out. A client-side transition can
 * render the next page before the cleared session cookie is visible.
 */
export function redirectAfterSignOut(path: '/' | '/login') {
  window.location.assign(path);
}
