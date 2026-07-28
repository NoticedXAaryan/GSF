import { config } from 'dotenv';
config({ path: '.env' });

import {
  sendResetEmail,
  sendRegistrationConfirmation,
  sendApplicationConfirmation,
  sendApplicationStatusUpdate,
  sendEventReminder
} from './lib/email';

async function testEmails() {
  const testEmail = 'aaryantiwari890@gmail.com';
  console.log(`Starting email tests to: ${testEmail}`);

  console.log('1. Sending Reset Email...');
  await sendResetEmail(testEmail, 'https://localhost:3000/reset-password?token=123');

  console.log('2. Sending Registration Confirmation (Digital Pass)...');
  await sendRegistrationConfirmation(testEmail, 'Aaryan Tiwari', 'GSF-2026-ABC123');

  console.log('3. Sending Application Confirmation...');
  await sendApplicationConfirmation(testEmail, 'Aaryan', 'Startup Pitch Deck Masterclass', true);

  console.log('4. Sending Application Status Update (Accepted)...');
  await sendApplicationStatusUpdate(
    testEmail,
    'Aaryan',
    'Startup Pitch Deck Masterclass',
    'accepted',
    'We loved your idea. Please bring your laptop.'
  );

  console.log('5. Sending Event Reminder...');
  await sendEventReminder(
    testEmail,
    'Aaryan',
    'Goa Startup Festival 2026 - Day 1',
    'September 2, 2026',
    '09:00 AM',
    'Parul University Goa Campus, Main Auditorium'
  );

  console.log('All test emails have been dispatched successfully!');
}

testEmails().catch(console.error);
