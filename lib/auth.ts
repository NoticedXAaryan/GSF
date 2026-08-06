import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { nextCookies } from 'better-auth/next-js';
import { db } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),

  // Enable account linking so Google auth doesn't fail if the email is already in the database
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  // ── Email/Password & Password Reset ──
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data, request) {
      const { sendResetEmail } = await import('./email');
      await sendResetEmail(data.user.email, data.url);
    },
  },

  // ── Google OAuth ──
  // Domain restriction is controlled by GOOGLE_OAUTH_RESTRICT_DOMAIN env var.
  // When empty/absent: any Google account can sign in (for testing).
  // When set to e.g. 'goa.paruluniversity.ac.in': only that domain is allowed.
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      ...(process.env.GOOGLE_OAUTH_RESTRICT_DOMAIN
        ? { hd: process.env.GOOGLE_OAUTH_RESTRICT_DOMAIN }
        : {}),
      prompt: 'select_account',
    },
  },

  // ── Extended User Schema ──
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'Attendee',
        input: false, // Server-owned — cannot be set via API/OAuth
      },
      phone: {
        type: 'string',
        required: false,
        defaultValue: '',
      },
      collegeDept: {
        type: 'string',
        required: false,
        defaultValue: '',
      },
      year: {
        type: 'string',
        required: false,
        defaultValue: '',
      },
      organization: {
        type: 'string',
        required: false,
        defaultValue: '',
      },
      passId: {
        type: 'string',
        required: false,
        defaultValue: '',
        input: false, // Server-generated
      },
      profileComplete: {
        type: 'boolean',
        required: false,
        defaultValue: false,
        input: false, // Server-controlled
      },
    },
  },

  // ── Session configuration ──
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh session every 24 hours
  },

  // ── Rate Limiting ──
  rateLimit: {
    window: 60, // 60 seconds
    max: 100, // 100 requests per 60 seconds
  },

  // ── Plugins ──
  plugins: [
    nextCookies(), // Must be last — handles Next.js cookie forwarding
  ],
});

export type Session = typeof auth.$Infer.Session;
