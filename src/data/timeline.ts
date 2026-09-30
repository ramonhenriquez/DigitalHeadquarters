/**
 * timeline.ts — career, homelab, documentation and plans.
 * ─────────────────────────────────────────────────────────────────
 * Every date says where it comes from. Homelab-Portfolio doesn't record
 * when anything was built, so homelab milestones are undated until it does
 * (the previous site's self-reported dates are listed for confirmation in
 * docs/CONTENT_GAPS.md, not shown here).
 *
 *   dateSource: 'resume'      — employment dates on the resume
 *   dateSource: 'readme'      — as written in Homelab-Portfolio's README
 *   dateSource: 'git'         — first commit date in the named repository
 *   dateSource: 'undocumented'— happened, but no date is documented
 *   dateSource: 'none'        — a plan or goal; no date claimed
 *
 * `sort` orders items. Undated items keep build order among themselves
 * and are listed separately from the dated chronology.
 */

export type Track = 'career' | 'homelab' | 'documentation' | 'learning' | 'planned';

export interface Milestone {
  date: string;
  sort: string;
  track: Track;
  title: string;
  description: string;
  dateSource: 'resume' | 'readme' | 'git' | 'undocumented' | 'none';
  /** Case study slug, if one exists */
  project?: string;
  status: 'done' | 'in-progress' | 'planned' | 'listed';
}

export const TRACKS: { id: Track; label: string }[] = [
  { id: 'career', label: 'Career' },
  { id: 'homelab', label: 'Homelab' },
  { id: 'documentation', label: 'Documentation' },
  { id: 'learning', label: 'Learning' },
  { id: 'planned', label: 'Planned' },
];

export const MILESTONES: Milestone[] = [
  {
    date: 'Jul 2021', sort: '2021-07', track: 'career', status: 'done', dateSource: 'resume',
    title: 'IT Help Desk Technician, Elevate ENT Partners',
    description: 'Supported clinical and administrative staff in a healthcare environment: workstation imaging, account and access management in Active Directory and Microsoft 365, HIPAA-compliant ticket documentation.',
  },
  {
    date: 'Oct 2023', sort: '2023-10', track: 'career', status: 'done', dateSource: 'resume',
    title: 'Technical Support Specialist, IT Services Express',
    description: 'Managed-services support for small and mid-sized businesses: N-able RMM and EDR monitoring, Active Directory and file-server administration, network equipment deployment, backup verification.',
  },
  {
    date: 'Undated', sort: 'u1', track: 'homelab', status: 'done', dateSource: 'undocumented', project: 'proxmox',
    title: 'Primary Proxmox host',
    description: 'The primary host that runs the production virtual machines and containers and provides their storage and compute.',
  },
  {
    date: 'Undated', sort: 'u2', track: 'homelab', status: 'done', dateSource: 'undocumented', project: 'proxmox',
    title: 'Second Proxmox host',
    description: 'Added a second host for workload distribution, with high-availability and migration testing planned.',
  },
  {
    date: 'Undated', sort: 'u3', track: 'homelab', status: 'done', dateSource: 'undocumented', project: 'active-directory',
    title: 'Active Directory domain',
    description: 'Built DC01 (Windows Server 2025 on Proxmox VE 9) and the homelab.local forest with integrated DNS, then linked a logon-banner GPO at the domain root.',
  },
  {
    date: 'Sep 2025', sort: '2025-09', track: 'career', status: 'done', dateSource: 'resume',
    title: 'Systems Technician II, Seventeenth Judicial Circuit of Florida',
    description: 'Supporting courthouse IT across multiple locations: help desk, Windows deployment and configuration, hardware and asset management in a government environment.',
  },
  {
    date: 'Undated', sort: 'u4', track: 'homelab', status: 'done', dateSource: 'undocumented', project: 'wazuh-suricata',
    title: 'Wazuh SIEM and Suricata',
    description: 'Wazuh with Ubuntu, Windows and remote Fedora agents, Suricata’s eve.json ingested on the same server, and detections tested with Kali traffic and deliberate failed logins.',
  },
  {
    date: 'Undated', sort: 'u5', track: 'homelab', status: 'in-progress', dateSource: 'undocumented', project: 'odysseus-ai',
    title: 'Odysseus self-hosted AI',
    description: 'Experimenting with local language models on private infrastructure, with no external API dependency.',
  },
  {
    date: 'Jun 2026', sort: '2026-06', track: 'documentation', status: 'done', dateSource: 'git',
    title: 'Homelab-Portfolio published',
    description: 'Architecture notes and project write-ups published as a public repository: the technical source of truth for this site.',
  },
  {
    date: 'Jun 2026', sort: '2026-06', track: 'documentation', status: 'done', dateSource: 'git',
    title: 'Digital Headquarters launched',
    description: 'This site, built with Astro and deployed to GitHub Pages.',
  },
  {
    date: '2026', sort: '2026-00', track: 'learning', status: 'listed', dateSource: 'readme',
    title: 'CompTIA Security+',
    description: 'Listed under Certifications in Homelab-Portfolio as “CompTIA Security+ (2026)”.',
  },
  {
    date: 'Planned', sort: '2099-01', track: 'planned', status: 'planned', dateSource: 'none', project: 'active-directory',
    title: 'Domain integrations',
    description: 'Wazuh monitoring of the domain and remote management with Tactical RMM, both named as objectives in the Active Directory build.',
  },
  {
    date: 'Goal', sort: '2099-03', track: 'planned', status: 'planned', dateSource: 'none',
    title: 'Security operations role',
    description: 'A SOC analyst position where SIEM work, endpoint monitoring and documentation habits carry over directly.',
  },
];

export const DATE_SOURCE_NOTE: Record<Milestone['dateSource'], string> = {
  resume: 'Date from employment history',
  readme: 'As written in the Homelab-Portfolio README',
  git: 'Date from repository history',
  undocumented: 'Build date not yet documented; write-up first committed Jun 2026',
  none: '',
};

export const STATUS_TEXT: Record<Milestone['status'], string> = {
  done: 'Done',
  'in-progress': 'In progress',
  planned: 'Planned',
  listed: 'Listed',
};

export const isDated = (m: Milestone) => m.dateSource !== 'undocumented';
