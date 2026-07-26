import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { nextCookies } from 'better-auth/next-js';
import { db } from './db';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),

  // ── Email/Password & Password Reset ──
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data, request) {
      const { sendResetEmail } = await import('./email');
      await sendResetEmail(data.user.email, data.url);
    },
  },

  // ── Google OAuth ──
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // Restrict to Parul University Goa campus domain
      hd: 'goa.paruluniversity.ac.in',
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
        fieldName: 'college_dept',
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
        fieldName: 'pass_id',
      },
      profileComplete: {
        type: 'boolean',
        required: false,
        defaultValue: false,
        input: false, // Server-controlled
        fieldName: 'profile_complete',
      },
    },
  },

  // ── Session configuration ──
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh session every 24 hours
  },

  // ── Plugins ──
  plugins: [
    nextCookies(), // Must be last — handles Next.js cookie forwarding
  ],
});

export type Session = typeof auth.$Infer.Session;
