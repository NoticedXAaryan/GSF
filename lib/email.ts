import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendResetEmail = async (email: string, url: string) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP credentials not set. Simulated password reset email:');
    console.warn(`To: ${email}`);
    console.warn(`Reset URL: ${url}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Goa Startup Festival" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset your password — GSF 2026',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password for the Goa Startup Festival 2026 platform.</p>
          <p>Click the button below to set a new password:</p>
          <div style="margin: 30px 0;">
            <a href="${url}" style="background-color: #E2B258; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Failed to send reset email:', err);
  }
};
