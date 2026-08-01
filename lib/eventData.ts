// =============================================================================
// eventData.ts — Single source of truth for all GSF 2026 event data
// =============================================================================
// Every component that displays event information should import from here.
// If the event sheet changes, update THIS file and all components stay in sync.
// =============================================================================

export interface Speaker {
  name: string;
  designation: string;
  organization: string;
}

export interface EventItem {
  id: number;
  name: string;
  date: string;           // "02/09/2026" or "03/09/2026" or "Online"
  day: 1 | 2 | 'online';
  timeStart: string;      // "10:00 AM"
  timeEnd: string;        // "11:00 AM"
  venue: string;
  speakers: Speaker[];
  judges?: Speaker[];     // For competitions
  facultyCoordinators: string[];
  studentCoordinator: string;
  registrationLink: string | null; // null = no registration needed / NA
  brochureLink: string | null;
  isRegisterable: boolean;
  description: string;
  invitationStatus?: string;
}

// ---------------------------------------------------------------------------
// SPEAKERS — Deduplicated so they can be referenced across events
// ---------------------------------------------------------------------------

export const speakers = {
  pratimaDhond: {
    name: 'Ms. Pratima Dhond',
    designation: 'President',
    organization: 'Goa Chamber of Commerce and Industry',
  },
  dsPrashant: {
    name: 'Mr. D.S Prashant',
    designation: 'CEO',
    organization: 'SITPC',
  },
  kiraanMehta: {
    name: 'Mr. Kiraan Mehta',
    designation: 'CEO',
    organization: 'Fiire, Goa',
  },
  nikhilDesai: {
    name: 'Mr. Nikhil Desai',
    designation: 'CEO & Co-founder',
    organization: 'Vindaloo Entertainment Pvt. Ltd.',
  },
  pallaviSalgaonkar: {
    name: 'Ms. Pallavi Salgaonkar',
    designation: 'CA-Executive, Geno Pharmaceuticals Pvt. Ltd.; Founder, Desserts N More',
    organization: 'Geno Pharmaceuticals / Desserts N More',
  },
  rafinaShaikh: {
    name: 'Ms. Rafina Shaikh',
    designation: 'Founder',
    organization: 'GoWomania, WEBN and GoenKart',
  },
  sairajDhond: {
    name: 'Mr. Sairaj Dhond',
    designation: 'Founder',
    organization: 'Wakao Foods',
  },
  komalKaparde: {
    name: 'Ms. Komal Kaparde Pritto',
    designation: 'Founder',
    organization: 'Diakon Coir',
  },
  prashantKhanna: {
    name: 'Mr. Prashant Khanna',
    designation: 'Senior Manager & Lead-Incubation, Fablab Incharge',
    organization: 'PIERC',
  },
  hardikKharva: {
    name: 'Mr. Hardik Kharva',
    designation: 'Deputy Manager',
    organization: 'PIERC',
  },
  tusharThakur: {
    name: 'Mr. Tushar Thakur',
    designation: 'Assistant Manager',
    organization: 'PIERC',
  },
  apurvaKedia: {
    name: 'Mr. Apurva Kedia',
    designation: 'Investment Associate & EA',
    organization: 'Sangam',
  },
  michaelFerrao: {
    name: 'Mr. Michael Ferrao',
    designation: 'Managing Director',
    organization: 'Grappa Ventures Pvt. Ltd.',
  },
  rohiniGonsalves: {
    name: 'Ms. Rohini Gonsalves',
    designation: 'Founder',
    organization: 'Sevarat Healthcare and Nursing Pvt. Ltd.',
  },
  mangirishSalelkar: {
    name: 'Mr. Mangirish Salelkar',
    designation: 'CEO & Co-founder',
    organization: 'Umang Software Technologies Pvt. Ltd.',
  },
  sonalSudani: {
    name: 'Mrs. Sonal Sudani',
    designation: 'Incubation Manager',
    organization: 'PIERC',
  },
  junedSheikh: {
    name: 'Mr. Juned Sheikh',
    designation: 'Centre Head',
    organization: 'Ahmedabad Startup Studio',
  },
  divyanshThakur: {
    name: 'Mr. Divyansh Thakur',
    designation: 'Fablab Engineer',
    organization: 'PU Vadodara',
  },
  panchamBaraiya: {
    name: 'Mr. Pancham Baraiya',
    designation: 'Centre Head',
    organization: 'Surat Startup Studio',
  },
  shlokSolanki: {
    name: 'Shlok Solanki',
    designation: 'Assistant Social Media Manager',
    organization: 'PIERC',
  },
  soorSolanki: {
    name: 'Soor Solanki',
    designation: 'Facility Manager',
    organization: 'Vadodara Startup Studio',
  },
} as const;

// ---------------------------------------------------------------------------
// ALL EVENTS — Ordered by Sr. No. from the event sheet
// ---------------------------------------------------------------------------

export const allEvents: EventItem[] = [
  // ─── Sr. 9: Inaugural Function ────────────────────────────────────────────
  {
    id: 9,
    name: 'Inaugural Function',
    date: '02/09/2026',
    day: 1,
    timeStart: '10:00 AM',
    timeEnd: '11:00 AM',
    venue: '1st Floor Seminar Hall',
    speakers: [speakers.pratimaDhond],
    facultyCoordinators: ['Dr. Amiya Dessai', 'Dr. Manasi Pawaskar', 'Dr. Monalisa Chowdhary', 'Ms. Vinitha Dsouza'],
    studentCoordinator: 'Ms. Pranjali Naik (PCAHS)',
    registrationLink: null,
    brochureLink: null,
    isRegisterable: false,
    description: 'Grand opening of the Goa Startup Festival 2026 with the Chief Guest Ms. Pratima Dhond, President, Goa Chamber of Commerce and Industry.',
    invitationStatus: 'Confirmed',
  },

  // ─── Sr. 1: Signature Talk 1 ──────────────────────────────────────────────
  {
    id: 1,
    name: 'Signature Talk 1',
    date: '02/09/2026',
    day: 1,
    timeStart: '11:00 AM',
    timeEnd: '11:45 AM',
    venue: '1st Floor Seminar Hall',
    speakers: [speakers.pratimaDhond],
    facultyCoordinators: ['Dr. Monalisa Chowdhary', 'Ms. Vinitha Dsouza'],
    studentCoordinator: 'Ms. Nidhi Gaonkar (PCPT)',
    registrationLink: null,
    brochureLink: null,
    isRegisterable: false,
    description: 'Keynote address by Ms. Pratima Dhond, President of Goa Chamber of Commerce and Industry, on the Goan startup ecosystem and opportunities for aspiring entrepreneurs.',
    invitationStatus: 'Confirmed',
  },

  // ─── Sr. 2: Startup Ecosystem Connect ─────────────────────────────────────
  {
    id: 2,
    name: 'Startup Ecosystem Connect',
    date: '02/09/2026',
    day: 1,
    timeStart: '11:45 AM',
    timeEnd: '1:15 PM',
    venue: '1st Floor Conference Room',
    speakers: [
      speakers.pratimaDhond,
      speakers.dsPrashant,
      speakers.kiraanMehta,
      speakers.nikhilDesai,
      speakers.pallaviSalgaonkar,
      speakers.rafinaShaikh,
    ],
    facultyCoordinators: ['Ms. Hencia Gomes', 'Ms. Meegal Fernandes'],
    studentCoordinator: 'Mr. Vivek Bobade (PCM)',
    registrationLink: null,
    brochureLink: null,
    isRegisterable: false,
    description: 'A dynamic panel discussion connecting startup ecosystem enablers, industry leaders, investors, and aspiring entrepreneurs. Panelists share insights on building and scaling startups in Goa.',
    invitationStatus: 'Pratima Dhond, D.S. Prashant, Pallavi Salgaonkar, Kiraan Mehta confirmed. Rafina Shaikh pending.',
  },

  // ─── Sr. 3: Signature Talk 2 ──────────────────────────────────────────────
  {
    id: 3,
    name: 'Signature Talk 2',
    date: '02/09/2026',
    day: 1,
    timeStart: '2:15 PM',
    timeEnd: '3:00 PM',
    venue: '1st Floor Seminar Hall',
    speakers: [speakers.nikhilDesai],
    facultyCoordinators: ['Dr. Monalisa Chowdhary', 'Ms. Vinitha Dsouza'],
    studentCoordinator: 'Ms. Nidhi Gaonkar (PCPT)',
    registrationLink: null,
    brochureLink: null,
    isRegisterable: false,
    description: 'An inspiring talk by Mr. Nikhil Desai, CEO & Co-founder of Vindaloo Entertainment Pvt. Ltd., on building a creative venture from the ground up.',
  },

  // ─── Sr. 4: MasterClass (2-day event) ─────────────────────────────────────
  {
    id: 4,
    name: 'MasterClass',
    date: '02/09/2026',
    day: 1,
    timeStart: '11:45 AM',
    timeEnd: '3:00 PM',
    venue: 'Ground Floor Seminar Hall',
    speakers: [speakers.prashantKhanna, speakers.hardikKharva, speakers.tusharThakur],
    facultyCoordinators: ['Dr. Amiya Dessai'],
    studentCoordinator: 'Mr. Rajat Naik (PCM)',
    registrationLink: 'https://forms.gle/yipaKg2o5YpeWzoj6',
    brochureLink: null,
    isRegisterable: true,
    description: 'An intensive two-day masterclass covering ideation, validation, design thinking, and business model development. Conducted by PIERC experts. Open to all students.',
  },

  // ─── Sr. 12: Startup Expo ─────────────────────────────────────────────────
  {
    id: 12,
    name: 'Startup Expo',
    date: '02/09/2026',
    day: 1,
    timeStart: '10:00 AM',
    timeEnd: '4:30 PM',
    venue: 'Outside PU Goa Campus',
    speakers: [],
    facultyCoordinators: ['Ms. Meegal Fernandes', 'Ms. Hencia Gomes', 'Dr. Amiya Dessai'],
    studentCoordinator: 'Mr. Sameer Rawlani',
    registrationLink: null,
    brochureLink: null,
    isRegisterable: false,
    description: 'A full-day exhibition showcasing innovative startups, products, and technologies. Open to all students and visitors.',
  },

  // ─── Sr. 5: Signature Talk 3 ──────────────────────────────────────────────
  {
    id: 5,
    name: 'Signature Talk 3',
    date: '03/09/2026',
    day: 2,
    timeStart: '10:00 AM',
    timeEnd: '10:45 AM',
    venue: '1st Floor Seminar Hall',
    speakers: [speakers.sairajDhond],
    facultyCoordinators: ['Dr. Monalisa Chowdhary', 'Ms. Vinitha Dsouza'],
    studentCoordinator: 'Ms. Nidhi Gaonkar (PCPT)',
    registrationLink: null,
    brochureLink: null,
    isRegisterable: false,
    description: 'An inspiring session with Mr. Sairaj Dhond, Founder of Wakao Foods, on building a purpose-driven food-tech startup.',
    invitationStatus: 'Confirmed',
  },

  // ─── Sr. 6: Signature Talk 4 ──────────────────────────────────────────────
  {
    id: 6,
    name: 'Signature Talk 4',
    date: '03/09/2026',
    day: 2,
    timeStart: '11:00 AM',
    timeEnd: '11:45 AM',
    venue: '1st Floor Seminar Hall',
    speakers: [speakers.komalKaparde],
    facultyCoordinators: ['Dr. Monalisa Chowdhary', 'Ms. Vinitha Dsouza'],
    studentCoordinator: 'Ms. Nidhi Gaonkar (PCPT)',
    registrationLink: null,
    brochureLink: null,
    isRegisterable: false,
    description: 'A talk by Ms. Komal Kaparde Pritto, Founder of Diakon Coir, on sustainable entrepreneurship and building a business from natural resources.',
  },

  // ─── Sr. 4 (Day 2): MasterClass Day 2 ────────────────────────────────────
  {
    id: 41, // Differentiate from Day 1 masterclass
    name: 'MasterClass',
    date: '03/09/2026',
    day: 2,
    timeStart: '10:00 AM',
    timeEnd: '3:15 PM',
    venue: 'Ground Floor Seminar Hall',
    speakers: [speakers.prashantKhanna, speakers.hardikKharva, speakers.tusharThakur],
    facultyCoordinators: ['Dr. Amiya Dessai'],
    studentCoordinator: 'Mr. Rajat Naik (PCM)',
    registrationLink: 'https://forms.gle/yipaKg2o5YpeWzoj6',
    brochureLink: null,
    isRegisterable: true,
    description: 'Day 2 of the intensive masterclass covering design thinking, business model development, and venture scaling. Conducted by PIERC experts.',
  },

  // ─── Sr. 7: Idea Pitching Competition ─────────────────────────────────────
  {
    id: 7,
    name: 'Idea Pitching Competition',
    date: '03/09/2026',
    day: 2,
    timeStart: '11:45 AM',
    timeEnd: '1:00 PM',
    venue: 'Ground Floor Seminar Hall',
    speakers: [],
    judges: [speakers.sonalSudani, speakers.junedSheikh, speakers.divyanshThakur, speakers.panchamBaraiya],
    facultyCoordinators: ['Ms. Hencia Gomes'],
    studentCoordinator: 'Ms. Pranjali Naik (PCAHS)',
    registrationLink: 'https://forms.gle/ZPq53AKzwjJ6Zo2ZA',
    brochureLink: null,
    isRegisterable: true,
    description: 'Shortlisted teams pitch their startup ideas to a panel of expert judges from PIERC and Startup Studios for a chance to win from the prize pool.',
  },

  // ─── Sr. 8: Fireside Chat ─────────────────────────────────────────────────
  {
    id: 8,
    name: 'Fireside Chat',
    date: '03/09/2026',
    day: 2,
    timeStart: '2:00 PM',
    timeEnd: '3:00 PM',
    venue: '1st Floor Seminar Hall',
    speakers: [
      speakers.apurvaKedia,
      speakers.michaelFerrao,
      speakers.rohiniGonsalves,
      speakers.mangirishSalelkar,
    ],
    facultyCoordinators: ['Dr. Manasi Pawaskar'],
    studentCoordinator: 'Ms. Mahek Malviya (PCPT)',
    registrationLink: 'https://forms.gle/FtMKo89pZuqgVBm3A',
    brochureLink: null,
    isRegisterable: true,
    description: 'An interactive fireside chat with investors and industrialists. Panelists share insights on funding, scaling, and building businesses in Goa and beyond.',
    invitationStatus: 'Confirmed',
  },

  // ─── Sr. 11: Valedictory Function ─────────────────────────────────────────
  {
    id: 11,
    name: 'Valedictory Function',
    date: '03/09/2026',
    day: 2,
    timeStart: '3:00 PM',
    timeEnd: '4:30 PM',
    venue: '1st Floor Seminar Hall',
    speakers: [
      speakers.apurvaKedia,
      speakers.michaelFerrao,
      speakers.rohiniGonsalves,
      speakers.mangirishSalelkar,
    ],
    facultyCoordinators: ['Dr. Amiya Dessai', 'Dr. Manasi Pawaskar', 'Dr. Monalisa Chowdhary', 'Ms. Vinitha Dsouza'],
    studentCoordinator: 'Ms. Pranjali Naik (PCAHS)',
    registrationLink: null,
    brochureLink: null,
    isRegisterable: false,
    description: 'Closing ceremony of the Goa Startup Festival 2026, featuring prize distribution for the Idea Pitching Competition and ReelPitch, along with a valedictory address.',
    invitationStatus: 'Confirmed',
  },

  // ─── Sr. 10: ReelPitch (Online) ───────────────────────────────────────────
  {
    id: 10,
    name: 'ReelPitch',
    date: 'Online',
    day: 'online',
    timeStart: 'Online',
    timeEnd: 'Online',
    venue: 'Online Event',
    speakers: [],
    judges: [speakers.shlokSolanki, speakers.soorSolanki],
    facultyCoordinators: ['Ms. Meegal Fernandes'],
    studentCoordinator: 'Ms. Priyanka Gangani (PCM)',
    registrationLink: 'https://forms.gle/8iy2CxpNvnZdKm1d8',
    brochureLink: 'https://drive.google.com/file/d/1Bs88Rq1Z1o2Uqnx4o8Ga-Oi9BSmNsTEV/view?usp=drivesdk',
    isRegisterable: true,
    description: 'An online video pitch competition where participants submit their startup idea as a short reel. Open to all students. Winners announced at the Valedictory Function.',
  },
];

// ---------------------------------------------------------------------------
// HELPER FUNCTIONS — Filter events by day
// ---------------------------------------------------------------------------

export function getDay1Events(): EventItem[] {
  return allEvents
    .filter((e) => e.day === 1)
    .sort((a, b) => timeToMinutes(a.timeStart) - timeToMinutes(b.timeStart));
}

export function getDay2Events(): EventItem[] {
  return allEvents
    .filter((e) => e.day === 2)
    .sort((a, b) => timeToMinutes(a.timeStart) - timeToMinutes(b.timeStart));
}

export function getOnlineEvents(): EventItem[] {
  return allEvents.filter((e) => e.day === 'online');
}

export function getRegisterableEvents(): EventItem[] {
  return allEvents.filter((e) => e.isRegisterable);
}

/** Convert "10:00 AM" → minutes since midnight, for sorting */
function timeToMinutes(time: string): number {
  if (time === 'Online') return 9999;
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/** Format speaker for display: "Ms. Pratima Dhond, President, GCCI" */
export function formatSpeaker(s: Speaker): string {
  return `${s.name}, ${s.designation}, ${s.organization}`;
}

/** Format speaker short: "Ms. Pratima Dhond (President, GCCI)" */
export function formatSpeakerShort(s: Speaker): string {
  return `${s.name} (${s.designation}, ${s.organization})`;
}
