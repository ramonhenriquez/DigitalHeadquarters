/**
 * Identity, navigation, contact details and certifications.
 * Edit here, not in components.
 *
 * Contact details are split in two so they can be controlled separately:
 *   PUBLIC_CONTACT — shown across the website (footer, contact page, CTAs,
 *                    command palette). Email, LinkedIn, GitHub only.
 *   RESUME_CONTACT — shown only on the /resume/ page. Set `phone` to null
 *                    to stop publishing it there.
 * Note: public/resume.pdf is a separate file and carries its own contact
 * line; replacing that PDF is the only way to change what it shows.
 */

export const SITE = {
  name: 'Ramon Henriquez',
  title: 'Systems Technician II',
  focus: 'Building toward security operations (SOC) work',
  location: 'South Florida',
  domain: 'homelab.local',
  sourceRepo: 'https://github.com/ramonhenriquez/Homelab-Portfolio',
  siteRepo: 'https://github.com/ramonhenriquez/DigitalHeadquarters',
};

export const PUBLIC_CONTACT = {
  email: 'ramonhenriquez301@gmail.com',
  linkedin: 'https://www.linkedin.com/in/ramon-henriquez-263176174/',
  github: 'https://github.com/ramonhenriquez',
  githubHandle: 'ramonhenriquez',
  location: SITE.location,
};

export const RESUME_CONTACT: {
  email: string;
  location: string;
  /** Display form and dialable form. null = don't show a phone number. */
  phone: { display: string; tel: string } | null;
} = {
  email: PUBLIC_CONTACT.email,
  location: 'Plantation, FL',
  phone: { display: '954-851-3522', tel: '+19548513522' },
};

/**
 * Certifications. `status` controls the label shown next to the name:
 *   'earned' | 'in-progress' | 'scheduled' → shown as a status chip
 *   'unconfirmed'                          → no chip; the year is shown as written in the source
 * Security+ follows Homelab-Portfolio's README ("CompTIA Security+ (2026)"),
 * which doesn't say whether it is earned. See docs/CONTENT_GAPS.md (C1).
 */
export type CertStatus = 'earned' | 'in-progress' | 'scheduled' | 'unconfirmed';
export const CERTIFICATIONS: { name: string; year: string; status: CertStatus; source: string }[] = [
  { name: 'CompTIA Security+', year: '2026', status: 'unconfirmed', source: 'README.md' },
];
export const CERT_STATUS_LABEL: Record<CertStatus, string | null> = {
  earned: 'Earned',
  'in-progress': 'In progress',
  scheduled: 'Scheduled',
  unconfirmed: null,
};

/** Paths are relative to BASE_URL. */
export const NAV = [
  { label: 'Infrastructure', path: 'infrastructure/' },
  { label: 'Projects',       path: 'projects/' },
  { label: 'Skills',         path: 'skills/' },
  { label: 'Timeline',       path: 'timeline/' },
  { label: 'Docs',           path: 'docs/' },
  { label: 'Contact',        path: 'contact/' },
];
