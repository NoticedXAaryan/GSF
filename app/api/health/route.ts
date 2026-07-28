import { jsonResponse } from '@/lib/api-helpers';

/**
 * GET /api/health
 * Simple health check endpoint for monitoring and load balancers.
 * Returns 200 with uptime and timestamp.
 * No authentication required.
 */
export async function GET() {
  return jsonResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
