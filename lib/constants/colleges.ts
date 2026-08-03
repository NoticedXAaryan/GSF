/**
 * Centralized college, course, and semester constants.
 * Shared by client-side forms AND server-side Zod validators
 * so that no one can bypass the dropdown via curl/Postman.
 */

export const COLLEGES: Record<string, string[]> = {
  "Parul College of Engineering and IT": [
    "B.Tech Computer Science & Engineering",
    "B.Tech AI & ML",
    "B.Tech Cyber Security",
    "B.Tech Data Science",
    "BCA",
    "BCA (Specializations)",
    "MCA"
  ],
  "Parul College of Management Studies": [
    "BBA",
    "BBA (Finance)",
    "BBA (Marketing)",
    "MBA"
  ],
  "Parul College of Nursing": [
    "GNM",
    "B.Sc Nursing",
    "M.Sc Nursing"
  ],
  "Parul College of Physiotherapy": [
    "Bachelor of Physiotherapy (BPT)",
    "MPT"
  ],
  "Parul College of Applied & Health Sciences": [
    "B.Sc Biotechnology",
    "B.Sc Microbiology",
    "B.Sc Medical Laboratory Technology",
    "B.Sc Anaesthesia & Operation Theatre Technology"
  ],
  "Parul College of Pharmacy": [
    "B.Pharm",
    "B.Pharm (Lateral Entry)",
    "M.Pharm"
  ],
  "Parul College of Hotel Management": [
    "BHMCT",
    "B.Sc Hospitality",
    "Diploma programmes"
  ]
};

/** Flat set of all valid college names for quick lookup. */
export const VALID_COLLEGES = new Set(Object.keys(COLLEGES));

/** Flat set of all valid courses across all colleges. */
export const VALID_COURSES = new Set(Object.values(COLLEGES).flat());

/** Map from course → parent college for cross-validation. */
export const COURSE_TO_COLLEGE: Record<string, string> = {};
for (const [college, courses] of Object.entries(COLLEGES)) {
  for (const course of courses) {
    COURSE_TO_COLLEGE[course] = college;
  }
}

export const SEMESTERS = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8",
  "Completed"
] as const;

export const VALID_SEMESTERS = new Set<string>(SEMESTERS);

/** All valid account statuses for the user table. */
export type AccountStatus = 'active' | 'flagged' | 'banned';
export const ACCOUNT_STATUSES: AccountStatus[] = ['active', 'flagged', 'banned'];
