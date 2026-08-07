import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { applications, notifications } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getSession, generateId } from '@/lib/api-helpers';
import { headers } from 'next/headers';
import { Resend } from 'resend';

// Use a mock or real Resend instance.
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession(await headers());
    if (!session || (session.user.role !== 'Admin' && session.user.role !== 'Lead')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    const [updatedApp] = await db.update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();

    if (updatedApp) {
      // Create notification
      await db.insert(notifications).values({
        id: generateId(),
        uid: updatedApp.uid,
        type: 'APPLICATION_STATUS',
        message: `Your application status has been updated to: ${status}`,
        link: '/dashboard/user/applications',
        createdAt: Date.now()
      });

      // Send email if accepted
      if (status === 'accepted' && process.env.RESEND_API_KEY) {
        try {
          await resend.emails.send({
            from: 'GSF 2026 <noreply@goastartupfestival.com>',
            to: updatedApp.userEmail,
            subject: 'Congratulations! Your application is accepted',
            html: `
              <div style="font-family: sans-serif; padding: 20px;">
                <h2>Congratulations ${updatedApp.userName}!</h2>
                <p>We are thrilled to inform you that your application has been <strong>accepted</strong>.</p>
                <p>Log in to your dashboard for further instructions.</p>
                <br/>
                <p>Best regards,</p>
                <p>The GSF Team</p>
              </div>
            `
          });
        } catch (emailErr) {
          console.error('Failed to send email:', emailErr);
          // Don't fail the request if email fails
        }
      }
    }

    return NextResponse.json({ success: true, application: updatedApp });
  } catch (error) {
    console.error('Update application error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
