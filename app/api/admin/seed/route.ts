import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/schema';
import { generateId } from '@/lib/api-helpers';

export async function GET() {
  const festivalEvents = [
    // DAY 1
    {
      name: 'Registration',
      date: '2026-09-02',
      day: 1,
      startTime: '09:00',
      endTime: '10:00',
      venue: 'Registration Desk',
      type: 'open' as const,
    },
    {
      name: 'Inaugural Ceremony',
      date: '2026-09-02',
      day: 1,
      startTime: '10:00',
      endTime: '11:00',
      venue: 'Seminar Hall',
      type: 'open' as const,
    },
    {
      name: 'Signature Talk 1 (Chief Guest Address)',
      date: '2026-09-02',
      day: 1,
      startTime: '11:00',
      endTime: '11:45',
      venue: 'Seminar Hall',
      type: 'open' as const,
    },
    {
      name: 'Startup Ecosystem Connect',
      date: '2026-09-02',
      day: 1,
      startTime: '11:45',
      endTime: '13:15',
      venue: 'Seminar Hall',
      type: 'restricted' as const,
    },
    {
      name: 'Masterclass Session 1: From Idea to Startup',
      date: '2026-09-02',
      day: 1,
      startTime: '11:45',
      endTime: '13:15',
      venue: 'Classroom 120',
      type: 'registration' as const,
      capacity: 70,
    },
    {
      name: 'Lunch Break',
      date: '2026-09-02',
      day: 1,
      startTime: '13:15',
      endTime: '14:15',
      venue: 'Food Court',
      type: 'open' as const,
    },
    {
      name: 'Fireside Chat with Investors and Industry',
      date: '2026-09-02',
      day: 1,
      startTime: '14:15',
      endTime: '15:45',
      venue: 'Seminar Hall',
      type: 'registration' as const,
      capacity: 200,
    },
    {
      name: 'Masterclass Session 2: Discover Opportunities',
      date: '2026-09-02',
      day: 1,
      startTime: '14:15',
      endTime: '15:45',
      venue: 'Classroom 120',
      type: 'registration' as const,
      capacity: 70,
    },
    {
      name: 'Startup Expo (Day 1)',
      date: '2026-09-02',
      day: 1,
      startTime: '09:30',
      endTime: '16:30',
      venue: 'Exhibition Area',
      type: 'open' as const,
    },
  
    // DAY 2
    {
      name: 'Signature Talk 2',
      date: '2026-09-03',
      day: 2,
      startTime: '10:00',
      endTime: '10:45',
      venue: 'Seminar Hall',
      type: 'open' as const,
    },
    {
      name: 'Masterclass Session 3: Think Like an Innovator',
      date: '2026-09-03',
      day: 2,
      startTime: '10:00',
      endTime: '10:45',
      venue: 'Classroom 120',
      type: 'registration' as const,
      capacity: 70,
    },
    {
      name: 'Signature Talk 3',
      date: '2026-09-03',
      day: 2,
      startTime: '10:45',
      endTime: '11:30',
      venue: 'Seminar Hall',
      type: 'open' as const,
    },
    {
      name: 'Startup Idea Competition – Final Pitching',
      date: '2026-09-03',
      day: 2,
      startTime: '11:30',
      endTime: '13:15',
      venue: 'Seminar Hall',
      type: 'shortlisted' as const,
      requiresShortlisting: true,
    },
    {
      name: 'Masterclass Session 4: Build a Winning Business Model',
      date: '2026-09-03',
      day: 2,
      startTime: '11:30',
      endTime: '13:15',
      venue: 'Classroom 120',
      type: 'registration' as const,
      capacity: 70,
    },
    {
      name: 'Lunch Break',
      date: '2026-09-03',
      day: 2,
      startTime: '13:15',
      endTime: '14:15',
      venue: 'Food Court',
      type: 'open' as const,
    },
    {
      name: 'Fireside Chat with Investors and Industry',
      date: '2026-09-03',
      day: 2,
      startTime: '14:00',
      endTime: '14:45',
      venue: 'Seminar Hall',
      type: 'registration' as const,
      capacity: 200,
    },
    {
      name: 'Signature Talk 4 (Guest of Honor)',
      date: '2026-09-03',
      day: 2,
      startTime: '14:45',
      endTime: '15:30',
      venue: 'Seminar Hall',
      type: 'open' as const,
    },
    {
      name: 'Valedictory & Prize Distribution Ceremony',
      date: '2026-09-03',
      day: 2,
      startTime: '15:30',
      endTime: '16:30',
      venue: 'Seminar Hall',
      type: 'open' as const,
    },
  ];

  try {
    await db.delete(events);

    for (const ev of festivalEvents) {
      const newEvent = {
        id: generateId(),
        ...ev,
        status: 'published' as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await db.insert(events).values(newEvent);
    }
    
    return NextResponse.json({ success: true, count: festivalEvents.length });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
