import nodemailer from 'nodemailer';

// ────────────────────────────────────────────────────────────
// SMTP Transport — Singleton
// ────────────────────────────────────────────────────────────

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ────────────────────────────────────────────────────────────
// Branded HTML Template Wrapper
// ────────────────────────────────────────────────────────────

function wrapInTemplate(content: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1a1a1a; padding: 24px; text-align: center; border-bottom: 4px solid #E2B258;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 1px;">GOA STARTUP FESTIVAL <span style="color: #E2B258;">2026</span></h1>
        <p style="color: #999; margin: 6px 0 0 0; font-size: 13px;">Moving ahead of the crowd</p>
      </div>
      <div style="padding: 32px 24px; color: #333333; font-size: 16px; line-height: 1.6;">
        ${content}
      </div>
      <div style="background-color: #f9f9f9; padding: 20px 24px; text-align: center; color: #666666; font-size: 13px; border-top: 1px solid #eaeaea;">
        <p style="margin: 0 0 6px 0;">Goa Startup Festival 2026 &mdash; Parul University Goa Campus</p>
        <p style="margin: 0; font-size: 12px; color: #999;">If you have questions, reply to this email.</p>
      </div>
    </div>
  `;
}

// ────────────────────────────────────────────────────────────
// Base Send Function
// ────────────────────────────────────────────────────────────

export async function sendEmail(
  to: string | string[],
  subject: string,
  html: string,
  bcc?: string[]
): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`⚠️ SMTP credentials not set. Simulated email:`);
    console.warn(`  To: ${Array.isArray(to) ? to.join(', ') : to}`);
    console.warn(`  Subject: ${subject}`);
    if (bcc?.length) console.warn(`  BCC: ${bcc.length} recipients`);
    return false;
  }

  try {
    const fromName = process.env.SMTP_FROM_NAME || 'Goa Startup Festival 2026';
    const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html: wrapInTemplate(html),
    };

    if (bcc && bcc.length > 0) {
      mailOptions.bcc = bcc;
    }

    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Failed to send email:', err);
    return false;
  }
}

// ────────────────────────────────────────────────────────────
// Specific Email Functions
// ────────────────────────────────────────────────────────────

/** Password reset — called by Better Auth's sendResetPassword hook */
export async function sendResetEmail(email: string, url: string): Promise<boolean> {
  const content = `
    <h2 style="margin-top: 0;">Password Reset Request</h2>
    <p>We received a request to reset your password for the Goa Startup Festival 2026 platform.</p>
    <p>Click the button below to set a new password:</p>
    <div style="margin: 30px 0; text-align: center;">
      <a href="${url}" style="background-color: #E2B258; color: #000000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
    </div>
    <p style="font-size: 14px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
  `;
  return sendEmail(email, 'Reset your password — GSF 2026', content);
}

/** Password reset — spec-defined name, delegates to sendResetEmail */
export async function sendPasswordReset(to: string, resetLink: string): Promise<boolean> {
  return sendResetEmail(to, resetLink);
}

/** Sent when a user completes their profile and receives a clearance pass */
export async function sendRegistrationConfirmation(
  email: string,
  name: string,
  passId: string
): Promise<boolean> {
  const content = `
    <h2 style="margin-top: 0;">Welcome to GSF 2026, ${name}!</h2>
    <p>Your profile is complete and you are registered for the Goa Startup Festival.</p>
    <div style="background-color: #f5f5f5; border-left: 4px solid #E2B258; padding: 24px; margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Your Digital Pass</p>
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${passId}" alt="QR Code Pass" style="width: 200px; height: 200px; display: inline-block; background-color: #fff; padding: 10px; border-radius: 8px; border: 1px solid #ddd;" />
      <p style="margin: 16px 0 0 0; font-size: 24px; font-weight: bold; font-family: 'Courier New', monospace; color: #1a1a1a; letter-spacing: 2px;">${passId}</p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">Keep this QR code handy. Volunteers will scan it for entry.</p>
    </div>
    <p><strong>When:</strong> September 2–3, 2026<br>
    <strong>Where:</strong> Parul University Goa Campus, Betul, South Goa</p>
    <p>Check your dashboard regularly for the latest event schedule, masterclass applications, and updates.</p>
  `;
  return sendEmail(email, 'Registration Confirmed — GSF 2026', content);
}

/** Sent when a user applies to a sub-event */
export async function sendApplicationConfirmation(
  email: string,
  name: string,
  eventName: string,
  requiresShortlisting: boolean
): Promise<boolean> {
  const statusMessage = requiresShortlisting
    ? "Your application is under review. We'll notify you once a decision is made."
    : "You're confirmed! See you there.";

  const content = `
    <h2 style="margin-top: 0;">Application Received</h2>
    <p>Hi ${name},</p>
    <p>We've received your application for <strong>${eventName}</strong>.</p>
    <p>${statusMessage}</p>
    <p>You can check the status of all your applications in your dashboard.</p>
  `;
  return sendEmail(email, `Application: ${eventName} — GSF 2026`, content);
}

/** Sent when admin accepts/rejects/waitlists an application */
export async function sendApplicationStatusUpdate(
  email: string,
  name: string,
  eventName: string,
  status: string,
  notes?: string
): Promise<boolean> {
  let statusBlock = '';
  const statusUpper = status.charAt(0).toUpperCase() + status.slice(1);

  if (status === 'accepted') {
    statusBlock = `
      <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; font-weight: bold; color: #166534;">🎉 Congratulations!</p>
        <p style="margin: 8px 0 0 0;">Your application for <strong>${eventName}</strong> has been <strong>accepted</strong>.</p>
      </div>
    `;
  } else if (status === 'rejected') {
    statusBlock = `
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; font-weight: bold; color: #991b1b;">Application Update</p>
        <p style="margin: 8px 0 0 0;">Unfortunately, your application for <strong>${eventName}</strong> was not selected this time.</p>
      </div>
    `;
  } else if (status === 'waitlisted') {
    statusBlock = `
      <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; font-weight: bold; color: #92400e;">You're on the Waitlist</p>
        <p style="margin: 8px 0 0 0;">Your application for <strong>${eventName}</strong> has been waitlisted. We'll notify you if a spot opens up.</p>
      </div>
    `;
  } else {
    statusBlock = `<p>Your application for <strong>${eventName}</strong> has been updated to: <strong>${statusUpper}</strong>.</p>`;
  }

  const notesBlock = notes
    ? `
      <div style="background-color: #f9f9f9; padding: 16px; margin: 16px 0; border-radius: 4px;">
        <p style="margin: 0; font-weight: bold; font-size: 14px;">Notes from the organizing team:</p>
        <p style="margin: 8px 0 0 0; white-space: pre-wrap;">${notes}</p>
      </div>
    `
    : '';

  const content = `
    <h2 style="margin-top: 0;">Application Status Update</h2>
    <p>Hi ${name},</p>
    ${statusBlock}
    ${notesBlock}
  `;
  return sendEmail(email, `Status Update: ${eventName} — GSF 2026`, content);
}

/** Event reminder email */
export async function sendEventReminder(
  email: string,
  name: string,
  eventName: string,
  date: string,
  time: string,
  venue: string
): Promise<boolean> {
  const content = `
    <h2 style="margin-top: 0;">Event Reminder</h2>
    <p>Hi ${name},</p>
    <p>Reminder: <strong>${eventName}</strong> is coming up!</p>
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; width: 80px; color: #666; font-size: 14px;">Date</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; font-weight: bold;">${date}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; color: #666; font-size: 14px;">Time</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; font-weight: bold;">${time}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; color: #666; font-size: 14px;">Venue</td>
        <td style="padding: 10px 0; border-bottom: 1px solid #eaeaea; font-weight: bold;">${venue}</td>
      </tr>
    </table>
    <p>Don't forget to bring your digital pass (available in your dashboard) for check-in.</p>
  `;
  return sendEmail(email, `Reminder: ${eventName} — GSF 2026`, content);
}

// ────────────────────────────────────────────────────────────
// Mass Broadcast (Batched)
// ────────────────────────────────────────────────────────────

/**
 * Send a mass email to a list of recipients in batches of 50.
 * Uses BCC so recipients don't see each other's emails.
 * 1-second delay between batches to avoid SMTP rate limits.
 */
export async function sendBroadcast(
  recipients: string[],
  subject: string,
  htmlBody: string
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  const batchSize = 50;

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    // Send to the SMTP_USER (self) with BCC to the actual recipients
    const success = await sendEmail(
      process.env.SMTP_USER as string,
      subject,
      htmlBody,
      batch
    );

    if (success) {
      sent += batch.length;
    } else {
      failed += batch.length;
    }

    // 1-second delay between batches to avoid rate limits
    if (i + batchSize < recipients.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return { sent, failed };
}
