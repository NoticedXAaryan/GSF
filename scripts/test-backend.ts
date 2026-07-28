/**
 * Backend Test Script — Tests all API endpoints and email sending.
 * Run with: npx tsx scripts/test-backend.ts
 */

const BASE = 'http://localhost:3000';
const ADMIN_EMAIL = 'noticedxaaryan@gmail.com';
const TEST_EMAIL = 'aaryantiwari890@gmail.com';
const SETUP_TOKEN = 'gsf2026-setup-a9f3c7e1b2d4056789abcdef01234567';

// Store session cookie across requests
let sessionCookie = '';

async function api(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<{ status: number; data: any; setCookie?: string }> {
  const headers: Record<string, string> = { 
    'Content-Type': 'application/json',
    'Origin': 'http://localhost:3000',
  };
  if (sessionCookie) {
    headers['Cookie'] = sessionCookie;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  });

  // Capture set-cookie for session
  const setCookieHeader = res.headers.get('set-cookie');
  if (setCookieHeader) {
    // Extract all cookies
    const cookies = setCookieHeader.split(',').map((c) => c.split(';')[0].trim());
    if (cookies.length > 0) {
      sessionCookie = cookies.join('; ');
    }
  }

  let data: any;
  try {
    data = await res.json();
  } catch {
    data = await res.text().catch(() => null);
  }

  return { status: res.status, data, setCookie: setCookieHeader || undefined };
}

function log(label: string, status: number, data: any) {
  const icon = status >= 200 && status < 300 ? '✅' : status < 500 ? '⚠️' : '❌';
  console.log(`\n${icon} [${status}] ${label}`);
  if (typeof data === 'object' && data !== null) {
    console.log(JSON.stringify(data, null, 2).substring(0, 500));
  } else {
    console.log(data);
  }
}

async function run() {
  console.log('═══════════════════════════════════════════');
  console.log('  GSF 2026 — Backend Test Suite');
  console.log('═══════════════════════════════════════════');

  // ── 1. Health Check ──
  console.log('\n── Test 1: Health Check ──');
  const health = await api('GET', '/api/health');
  log('GET /api/health', health.status, health.data);

  // ── 2. Register Admin Account ──
  console.log('\n── Test 2: Register Admin Account ──');
  const signup = await api('POST', '/api/auth/sign-up/email', {
    name: 'Aaryan Tiwari',
    email: ADMIN_EMAIL,
    password: 'TestAdmin2026!',
  });
  log('POST /api/auth/sign-up/email', signup.status, signup.data);

  // If already exists, try signing in instead
  if (signup.status !== 200) {
    console.log('  → Account may already exist, trying sign-in...');
    const signin = await api('POST', '/api/auth/sign-in/email', {
      email: ADMIN_EMAIL,
      password: 'TestAdmin2026!',
    });
    log('POST /api/auth/sign-in/email', signin.status, signin.data);
  }

  // ── 3. Promote to Admin ──
  console.log('\n── Test 3: Admin Setup (Promote to Admin) ──');
  const setup = await api('POST', '/api/admin/setup', {
    email: ADMIN_EMAIL,
    token: SETUP_TOKEN,
  });
  log('POST /api/admin/setup', setup.status, setup.data);

  // ── 4. Sign in to get a fresh session with the Admin role ──
  console.log('\n── Test 4: Sign In (Fresh Session) ──');
  const login = await api('POST', '/api/auth/sign-in/email', {
    email: ADMIN_EMAIL,
    password: 'TestAdmin2026!',
  });
  log('POST /api/auth/sign-in/email', login.status, login.data);

  // ── 5. Register a second test user ──
  console.log('\n── Test 5: Register Test User ──');
  const signup2 = await api('POST', '/api/auth/sign-up/email', {
    name: 'Test User',
    email: TEST_EMAIL,
    password: 'TestUser2026!',
  });
  log('POST /api/auth/sign-up/email (test user)', signup2.status, signup2.data);

  // Sign back in as admin
  sessionCookie = '';
  const adminLogin = await api('POST', '/api/auth/sign-in/email', {
    email: ADMIN_EMAIL,
    password: 'TestAdmin2026!',
  });
  log('Re-login as admin', adminLogin.status, adminLogin.data);

  // ── 6. Get Admin Stats ──
  console.log('\n── Test 6: Admin Stats ──');
  const stats = await api('GET', '/api/admin/stats');
  log('GET /api/admin/stats', stats.status, stats.data);

  // ── 7. List Users ──
  console.log('\n── Test 7: List Users ──');
  const users = await api('GET', '/api/admin/users');
  log('GET /api/admin/users', users.status, users.data);

  // ── 8. Get Events ──
  console.log('\n── Test 8: Get Events ──');
  const events = await api('GET', '/api/events');
  log('GET /api/events', events.status, events.data);

  // ── 9. Create a Test Event ──
  console.log('\n── Test 9: Create Test Event ──');
  const createEvent = await api('POST', '/api/events', {
    name: 'Test Masterclass: From Idea to Startup',
    description: 'A hands-on masterclass about the startup lifecycle.',
    date: '2026-09-02',
    day: 1,
    startTime: '11:45',
    endTime: '13:15',
    venue: 'Room 2 / Classroom 120',
    type: 'registration',
    targetAudience: 'all',
    capacity: 70,
    requiresShortlisting: true,
    coordinatorName: 'Aaryan',
    status: 'published',
  });
  log('POST /api/events', createEvent.status, createEvent.data);

  // ── 10. Send Broadcast Email ──
  console.log('\n── Test 10: Broadcast Email ──');
  const broadcast = await api('POST', '/api/admin/broadcast', {
    subject: '🚀 Welcome to GSF 2026 — Test Broadcast',
    body: `
      <h2>Hello from GSF 2026!</h2>
      <p>This is a test broadcast email sent from the admin panel.</p>
      <p>If you're receiving this, the email system is working perfectly.</p>
      <p><strong>Event Dates:</strong> September 2-3, 2026</p>
      <p><strong>Venue:</strong> Parul University Goa Campus</p>
    `,
    audience: 'all',
  });
  log('POST /api/admin/broadcast', broadcast.status, broadcast.data);

  // ── 11. Get Announcements ──
  console.log('\n── Test 11: Get Announcements ──');
  const announcements = await api('GET', '/api/admin/announcements');
  log('GET /api/admin/announcements', announcements.status, announcements.data);

  // ── 12. User Profile ──
  console.log('\n── Test 12: User Profile ──');
  const profile = await api('GET', '/api/user/profile');
  log('GET /api/user/profile', profile.status, profile.data);

  // ── 13. User Applications ──
  console.log('\n── Test 13: User Applications ──');
  const myApps = await api('GET', '/api/user/applications');
  log('GET /api/user/applications', myApps.status, myApps.data);

  // ── Summary ──
  console.log('\n═══════════════════════════════════════════');
  console.log('  Test Suite Complete');
  console.log('═══════════════════════════════════════════');
}

run().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
