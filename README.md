# Goa Startup Festival 2026

The festival platform for [Goa Startup Festival 2026](https://gsf.goa.paruluniversity.ac.in): a two-day entrepreneurship gathering hosted at Parul University’s Goa campus in Betul, and organized with PIERC and Parul University Vadodara.

Students, founders, mentors, and investors land on one site, register, collect a digital pass, and move through the programme. Organizers run events, applications, jury review, and door check-in from the same codebase.

**2–3 September 2026 · Parul University Goa Campus, Betul**

## Highlights

- **Public festival site.** Hero, about, programme highlights, audience, live schedule, partners, FAQ, and registration calls to action.
- **Accounts that match the room.** Email and password, Google sign-in, password reset, and roles for attendees, volunteers, faculty, leads, and admins.
- **A pass people can actually use.** Profile completion, festival registration, and a QR pass for the door.
- **Programme operations.** Published events, applications with drafts, teams, idea-pitch and masterclass review, jury scoring, announcements, and task checklists.
- **Check-in.** Volunteer and admin scanners with a second confirmation step, plus attendance export.
- **Hard edges covered.** Route protection, server-side session checks, rate limiting, and a 535-test suite across unit, component, accessibility, property, and server-render checks.

## Tech stack

| Layer | Choice |
| --- | --- |
| App | Next.js 15 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4, Motion |
| Auth | Better Auth (email/password and Google) |
| Data | PostgreSQL, Drizzle ORM |
| Validation | Zod |
| Mail | Nodemailer (SMTP) and Resend (acceptance mail) |
| Uploads | Vercel Blob |
| Tests | Vitest, Testing Library, jest-axe, fast-check, Playwright |
| Ship | Docker standalone image, or any Node host |

## Setup

Requirements: Node.js 20+, npm, and a PostgreSQL database.

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Fill `.env.local` from `.env.example`. The app boots for local UI work with a database URL and `BETTER_AUTH_SECRET`. Google, SMTP, Resend, and Vercel Blob stay quiet until their keys are set.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Typecheck |
| `npm test` | Vitest projects (unit, component, accessibility, property, SSR) |
| `npm run test:browser` | Playwright smoke check |
| `npm run validate` | Typecheck, tests, and production build |
| `npm run db:migrate` | Apply Drizzle migrations |
| `npm run db:studio` | Open Drizzle Studio |

Docker Compose brings up Postgres and the app. Set `DB_PASSWORD` and the auth variables from `.env.example`, then:

```bash
docker compose up --build
```

## Status

The landing page, authentication, attendee dashboard, volunteer scanner, and admin tools are implemented and covered by the test suite. Typecheck, lint, Vitest, and `next build` pass on the current tree.

A few things are deliberately unfinished or need the owner:

- The speaker section and the old region tabs are not mounted on the landing page. Speaker content still lives in `lib/landing/content` for a later pass.
- `npm run check:governed-styles` reports landing classes outside the design-token allow-list. The pages render; the checker is stricter than the current visual design.
- There is no automated browser walkthrough of signup or check-in. `npm run test:browser` checks an in-memory accessible page, not the live routes.
- Database migrations, Google OAuth, SMTP, Resend, and Blob uploads need real credentials. Nothing in the repo is a secret.

This repository is the original project, not a fork.
