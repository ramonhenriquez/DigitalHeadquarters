/**
 * projects.ts — case studies.
 * ─────────────────────────────────────────────────────────────────
 * Structure follows: Objective → Architecture → Implementation →
 * Troubleshooting & investigation → Validation → Results → Skills →
 * What I learned → Source documentation.
 *
 * TIERS
 *   featured — the source docs cover objective, implementation, testing,
 *              investigation/troubleshooting and results. Shown as case studies.
 *   lab      — documented, but not yet deep enough for a full case study.
 *              Shown as lab systems; empty sections are grouped, not padded.
 *
 * Section coverage is derived, never typed in (see sectionCoverage()):
 *   documented — items, and nothing flagged missing
 *   partial    — items, plus a `missing` note
 *   none       — no items
 *
 * RULES
 *   - Every item cites its Homelab-Portfolio source file.
 *   - Paraphrase; code/config blocks are copied from the source doc.
 *   - If a section isn't covered by the source, leave `items` empty and
 *     say what's missing in `missing`. Don't fill the gap.
 *   - Update this file when Homelab-Portfolio gains new material.
 */
import { SRC, type SourcePath } from './source-paths';
import type { EvidenceLevel, LayerId, StatusId } from './status';

export interface Item {
  text: string;
  source: SourcePath;
  /** Optional heading for implementation steps */
  title?: string;
  code?: { lang: string; code: string };
}

export interface Section {
  items: Item[];
  /** Shown when the source doesn't cover this section (or only partly does) */
  missing?: string;
}

export type Tier = 'featured' | 'lab';

export interface Project {
  slug: string;
  title: string;
  tier: Tier;
  layer: LayerId;
  status: StatusId;
  /** Strongest kind of evidence in the source docs */
  evidence: EvidenceLevel;
  /** One or two sentences for the register and command palette */
  summary: string;
  /** What this project demonstrates, in a phrase — shown in the register */
  proves: string;
  /** Architecture view to embed, and nodes to highlight in it */
  view: LayerId;
  focus: string[];
  objective: Section;
  architecture: Section;
  implementation: Section;
  challenges: Section;
  validation: Section;
  result: Section;
  learned: Section;
  skills: string[];
  docs: SourcePath[];
}

export const PROJECTS: Project[] = [
  // ──────────────────────────────────────────────────────────────
  {
    slug: 'wazuh-suricata',
    tier: 'featured',
    title: 'Wazuh SIEM + Suricata IDS',
    layer: 'security',
    status: 'active',
    evidence: 'validated',
    summary:
      'A SIEM collecting logs from Linux, Windows and a remote Fedora laptop, with Suricata network alerts fed into the same dashboard. Detections were tested and triaged.',
    proves: 'SIEM fundamentals: ingest, test, investigate, close',
    view: 'security',
    focus: ['wazuh', 'suricata', 'kali', 'fedora'],
    objective: {
      items: [
        { text: 'Centralise security logs and monitor both Linux and Windows systems.', source: SRC.wazuh },
        { text: 'Learn threat-detection workflows and get hands-on SIEM experience.', source: SRC.wazuh },
        { text: 'Simulate a small SOC, where network activity and system events are watched from a single dashboard.', source: SRC.suricata },
      ],
    },
    architecture: {
      items: [
        { text: 'The Wazuh manager runs on an Ubuntu Server virtual machine.', source: SRC.fedora },
        { text: 'Agents report from Ubuntu Linux and Windows 11 endpoints.', source: SRC.wazuh },
        { text: 'A Fedora laptop outside the network reports through the UniFi OpenVPN tunnel.', source: SRC.fedora },
        { text: 'Suricata is installed on the Wazuh server itself and writes EVE JSON to /var/log/suricata/eve.json, which Wazuh reads as a local log file.', source: SRC.suricata },
        { text: 'Kali Linux is the test source used to generate traffic and validate that detections fire.', source: SRC.serviceMap },
      ],
      missing: 'Where Suricata captures traffic (and so how much of the network it can see) and which ruleset it uses aren’t documented yet.',
    },
    implementation: {
      items: [
        {
          title: 'Install Suricata on the Wazuh server and confirm it is running',
          text: 'Suricata was installed on the same host as the Wazuh manager and its service status checked.',
          source: SRC.suricata,
          code: { lang: 'bash', code: 'sudo systemctl status suricata' },
        },
        {
          title: 'Confirm EVE JSON logging',
          text: 'Checked that Suricata was writing eve.json in its log directory.',
          source: SRC.suricata,
          code: { lang: 'bash', code: 'ls -lh /var/log/suricata' },
        },
        {
          title: 'Point Wazuh at the Suricata log',
          text: 'Added a localfile block to the manager configuration (/var/ossec/etc/ossec.conf) so Wazuh parses eve.json as JSON.',
          source: SRC.suricata,
          code: {
            lang: 'xml',
            code: '<localfile>\n  <log_format>json</log_format>\n  <location>/var/log/suricata/eve.json</location>\n</localfile>',
          },
        },
        {
          title: 'Restart the manager and verify',
          text: 'Restarted wazuh-manager and checked the service came back up.',
          source: SRC.suricata,
          code: { lang: 'bash', code: 'sudo systemctl restart wazuh-manager\nsudo systemctl status wazuh-manager' },
        },
        {
          title: 'Confirm ingestion in the dashboard',
          text: 'Searched for "suricata" under Threat Intelligence → Threat Hunting → Events; alerts appearing there confirmed the integration.',
          source: SRC.suricata,
        },
        {
          title: 'Enrol a remote endpoint over VPN',
          text: 'Deployed a Wazuh agent to the Fedora workstation connected through UniFi OpenVPN and confirmed it registered with the manager.',
          source: SRC.fedora,
        },
      ],
      missing: 'The Wazuh install itself and the Windows and Ubuntu agent deployments aren’t written up yet.',
    },
    challenges: {
      items: [
        { title: 'Investigating the failed-login alert', text: 'Worked the authentication-failure alert as an analyst would: was the login successful (no), which user was targeted (ramon), was the activity expected (yes).', source: SRC.suricata },
        { title: 'Conclusion', text: 'Classified as benign test activity, because an authorised user generated the failures on purpose to verify detection. Disposition: closed.', source: SRC.suricata },
      ],
      missing: 'Problems hit while deploying Wazuh or Suricata (and how they were fixed) aren’t written up yet.',
    },
    validation: {
      items: [
        { title: 'Network traffic detection', text: 'Traffic generated from Kali Linux was detected by Suricata, written to eve.json and ingested by Wazuh. Recorded as successful.', source: SRC.suricata },
        { title: 'Failed authentication', text: 'Wrong passwords entered on purpose on the locked Wazuh server raised rule 2501 (level 5, "syslog: User authentication failure") and rule 5557 ("unix_chkpwd: Password check failed").', source: SRC.suricata },
        { title: 'Remote VPN login', text: 'A successful OpenVPN connection from the remote Fedora workstation was detected, with source IP, source port and timestamp.', source: SRC.fedora },
        { title: 'Privilege escalation', text: 'sudo on the Fedora workstation was detected as a PAM login session, with the user performing the elevation, the root privilege assignment and the timestamp.', source: SRC.fedora },
      ],
    },
    result: {
      items: [
        { text: 'Suricata alerts are searchable in the Wazuh dashboard alongside agent events; the integration was confirmed from Threat Hunting → Events.', source: SRC.suricata },
        { text: 'The remote Fedora agent’s registration, log collection, VPN event monitoring, authentication monitoring and privilege-escalation monitoring were all confirmed. Status recorded as operational and ready for threat-simulation exercises.', source: SRC.fedora },
      ],
    },
    learned: {
      items: [
        { text: 'Wazuh can follow both user and system activity on endpoints that sit outside the network, as long as they connect over a VPN tunnel. Authentication events, VPN logins and administrative actions all end up centrally searchable.', source: SRC.fedora },
      ],
    },
    skills: ['wazuh', 'suricata', 'alert-triage', 'endpoint-monitoring', 'linux-administration', 'remote-access-vpn', 'security-testing', 'threat-hunting'],
    docs: [SRC.wazuh, SRC.suricata, SRC.fedora],
  },

  // ──────────────────────────────────────────────────────────────
  {
    slug: 'active-directory',
    tier: 'featured',
    title: 'Active Directory domain',
    layer: 'identity',
    status: 'deployed',
    evidence: 'walkthrough',
    summary:
      'A Windows Server 2025 domain controller (DC01) for a new homelab.local forest with integrated DNS, plus a Group Policy that puts a legal notice in front of every domain logon.',
    proves: 'Identity foundations and enforcing policy through GPO',
    view: 'identity',
    focus: ['dc01', 'gpo'],
    objective: {
      items: [
        { text: 'Build a centralised identity system: authentication, authorisation, DNS and Group Policy management.', source: SRC.ad },
        { text: 'Lay the groundwork for later work: domain joins, user and computer administration, security monitoring with Wazuh, and remote management with Tactical RMM.', source: SRC.ad },
        { text: 'Show users, before they sign in, that systems are monitored and unauthorised access is prohibited, the way government, healthcare and enterprise environments do.', source: SRC.gpo },
      ],
    },
    architecture: {
      items: [
        { text: 'DC01 runs Windows Server 2025 Standard Evaluation as a virtual machine on Proxmox VE 9.', source: SRC.ad },
        { text: 'It is the domain controller for a new forest, homelab.local (NetBIOS name HOMELAB), with AD-integrated DNS and the Global Catalog role.', source: SRC.ad },
        { text: 'The "Login Banner" GPO is linked at the domain root, so it reaches every domain-joined system.', source: SRC.gpo },
        { text: 'A Windows workstation VM is joined to the domain.', source: SRC.serviceMap },
      ],
    },
    implementation: {
      items: [
        { title: 'Give the server a static address', text: 'Configured a static IPv4 address, because a domain controller needs a stable address for DNS and authentication to stay reliable.', source: SRC.ad },
        { title: 'Rename to DC01', text: 'Set a descriptive hostname before promotion and verified it after the reboot.', source: SRC.ad, code: { lang: 'powershell', code: 'hostname' } },
        { title: 'Install AD DS', text: 'Added the Active Directory Domain Services role through Server Manager’s Add Roles and Features wizard.', source: SRC.ad },
        { title: 'Promote to domain controller', text: 'Created a new forest named homelab.local with DNS Server and Global Catalog enabled, set a DSRM password, accepted the HOMELAB NetBIOS name and the default NTDS / SYSVOL paths.', source: SRC.ad },
        { title: 'Create and link the Login Banner GPO', text: 'In Group Policy Management, created a GPO named "Login Banner" and linked it at homelab.local.', source: SRC.gpo },
        {
          title: 'Configure the banner',
          text: 'Under Computer Configuration → Policies → Windows Settings → Security Settings → Local Policies → Security Options, set the interactive-logon message title and text.',
          source: SRC.gpo,
          code: {
            lang: 'text',
            code: 'Title: Authorized Access Only\n\nThis system is the property of Ramon\'s Homelab.\nUnauthorized access is prohibited.\nAll activity may be monitored and logged.',
          },
        },
        { title: 'Apply the policy', text: 'Forced a Group Policy refresh from an elevated prompt.', source: SRC.gpo, code: { lang: 'powershell', code: 'gpupdate /force' } },
      ],
    },
    challenges: {
      items: [
        { text: 'The walkthrough notes that a DNS delegation warning may appear during promotion, and that it can safely be ignored in a homelab forest.', source: SRC.ad },
      ],
      missing: 'Whether the warning actually appeared, and any other problems hit during the build, aren’t written up.',
    },
    validation: {
      items: [
        { title: 'Addressing and name', text: 'Check the static address with ipconfig and the hostname with hostname (expected: DC01).', source: SRC.ad, code: { lang: 'powershell', code: 'ipconfig\nhostname' } },
        { title: 'Domain controller', text: 'Sign in as HOMELAB\\Administrator and confirm the AD tools are present: Users and Computers, Administrative Center, DNS Manager, Group Policy Management, Sites and Services.', source: SRC.ad },
        { title: 'Group Policy applied', text: 'gpresult /r should list "Login Banner" under Applied Group Policy Objects; locking the session should show the banner before logon.', source: SRC.gpo, code: { lang: 'powershell', code: 'gpresult /r' } },
      ],
      missing: 'These are the documented validation steps and expected output. The observed output (captured text or the screenshots the GPO write-up lists) isn’t in the repository yet.',
    },
    result: {
      items: [
        { text: 'DC01 was promoted into the new homelab.local forest, with DNS Server and Global Catalog enabled.', source: SRC.ad },
        { text: 'The Login Banner GPO is linked at homelab.local with "Link Enabled: Yes", so it applies to every domain-joined system; before logon the user receives the banner and must acknowledge it.', source: SRC.gpo },
      ],
    },
    learned: {
      items: [],
      missing: 'Lessons learned haven’t been written up for this project yet.',
    },
    skills: ['active-directory', 'group-policy', 'windows-server', 'dns', 'proxmox-ve'],
    docs: [SRC.ad, SRC.gpo],
  },

  // ──────────────────────────────────────────────────────────────
  {
    slug: 'proxmox',
    tier: 'lab',
    title: 'Proxmox homelab infrastructure',
    layer: 'virtualization',
    status: 'deployed',
    evidence: 'architecture',
    summary:
      'Two Proxmox VE hosts for the lab’s virtual machines and containers: VMs for identity, security monitoring and test workstations; LXC containers for documentation and media.',
    proves: 'The virtualization platform under the lab’s VMs and containers',
    view: 'virtualization',
    focus: ['pve1', 'pve2'],
    objective: {
      items: [
        { text: 'Provide centralised virtualisation and resource management, and host multiple services and operating systems.', source: SRC.proxmox },
        { text: 'Simulate enterprise IT and cybersecurity operations.', source: SRC.readme },
      ],
    },
    architecture: {
      items: [
        { text: 'A primary host runs the production VMs and containers and provides storage and compute.', source: SRC.proxmox },
        { text: 'A secondary host handles workload distribution and is set aside for future high-availability and migration testing.', source: SRC.proxmox },
        { text: 'Virtual machines: Active Directory, Wazuh SIEM, a Windows workstation and a Linux workstation.', source: SRC.proxmox },
        { text: 'LXC containers: BookStack, Jellyfin, and capacity reserved for future projects.', source: SRC.proxmox },
        { text: 'Proxmox VE 9 is the version recorded in the Active Directory build.', source: SRC.ad },
      ],
      missing: 'Host hardware, storage layout, networking, whether the hosts form a Proxmox cluster, and which guest runs on which host aren’t documented yet.',
    },
    implementation: { items: [], missing: 'Installation and configuration steps for the hosts aren’t written up yet.' },
    challenges: { items: [], missing: 'No troubleshooting has been documented for this project yet.' },
    validation: { items: [], missing: 'No tests or validation steps are documented yet.' },
    result: {
      items: [{ text: 'The service map describes Proxmox as hosting all of the lab’s virtual machines and containers.', source: SRC.serviceMap }],
    },
    learned: { items: [], missing: 'Lessons learned haven’t been written up for this project yet.' },
    skills: ['proxmox-ve', 'lxc-containers'],
    docs: [SRC.proxmox, SRC.serviceMap],
  },

  // ──────────────────────────────────────────────────────────────
  {
    slug: 'bookstack',
    tier: 'lab',
    title: 'BookStack documentation platform',
    layer: 'services',
    status: 'deployed',
    evidence: 'architecture',
    summary:
      'A self-hosted knowledge base for infrastructure notes, procedures and troubleshooting guides, organised into four shelves.',
    proves: 'Treating documentation as part of the work',
    view: 'services',
    focus: ['bookstack', 'shelves'],
    objective: {
      items: [
        { text: 'Centralise documentation, improve knowledge retention, standardise procedures and reduce troubleshooting time.', source: SRC.bookstack },
      ],
    },
    architecture: {
      items: [
        { text: 'Runs as an LXC container on Proxmox.', source: SRC.proxmox },
        { text: 'Content is organised into four shelves: Network & Security, Learning & Certifications, General Documentation, and Homelab Infrastructure.', source: SRC.bookstack },
        { text: 'It holds infrastructure documentation (Proxmox, networking, security tools, VMs) and operational documentation (troubleshooting guides, procedures, asset tracking, maintenance records).', source: SRC.bookstack },
      ],
    },
    implementation: { items: [], missing: 'How BookStack was installed and configured (database, access, backups) isn’t written up yet.' },
    challenges: { items: [], missing: 'No troubleshooting has been documented for this project yet.' },
    validation: { items: [], missing: 'No tests or validation steps are documented yet.' },
    result: {
      items: [],
      missing: 'The source lists intended benefits (faster troubleshooting, better organisation) but no measured outcome yet.',
    },
    learned: { items: [], missing: 'Lessons learned haven’t been written up for this project yet.' },
    skills: ['technical-documentation', 'lxc-containers'],
    docs: [SRC.bookstack],
  },

  // ──────────────────────────────────────────────────────────────
  {
    slug: 'jellyfin',
    tier: 'lab',
    title: 'Jellyfin media server',
    layer: 'services',
    status: 'deployed',
    evidence: 'architecture',
    summary: 'A self-hosted media server in an LXC container, serving libraries stored on centralised NAS storage.',
    proves: 'Running a service that depends on shared storage',
    view: 'services',
    focus: ['jellyfin', 'nas', 'media'],
    objective: {
      items: [
        { text: 'Learn self-hosted service deployment, integrate NAS storage, manage user access, and understand media infrastructure.', source: SRC.jellyfin },
      ],
    },
    architecture: {
      items: [
        { text: 'Jellyfin runs in an LXC container and reads from NAS storage, which holds the media libraries.', source: SRC.jellyfin },
        { text: 'Libraries: Movies, Music, Audiobooks, Anime and Documentaries.', source: SRC.jellyfin },
      ],
      missing: 'The NAS model and how storage is mounted into the container aren’t documented yet.',
    },
    implementation: { items: [], missing: 'Deployment steps (container setup, storage mount, permissions, user access) aren’t written up yet.' },
    challenges: { items: [], missing: 'No troubleshooting has been documented for this project yet.' },
    validation: { items: [], missing: 'No tests or validation steps are documented yet.' },
    result: { items: [], missing: 'No results have been recorded yet.' },
    learned: { items: [], missing: 'Lessons learned haven’t been written up for this project yet.' },
    skills: ['lxc-containers', 'self-hosting'],
    docs: [SRC.jellyfin],
  },

  // ──────────────────────────────────────────────────────────────
  {
    slug: 'odysseus-ai',
    tier: 'lab',
    title: 'Odysseus AI',
    layer: 'services',
    status: 'experimental',
    evidence: 'architecture',
    summary: 'A locally hosted large-language-model platform for private experiments, with no dependence on external AI APIs.',
    proves: 'Keeping AI workloads on private infrastructure',
    view: 'services',
    focus: ['odysseus'],
    objective: {
      items: [
        { text: 'Explore self-hosted AI, keep data private, evaluate how local models perform, and develop AI-assisted workflows.', source: SRC.odysseus },
      ],
    },
    architecture: {
      items: [
        { text: 'The platform, Odysseus, runs local LLMs with self-hosted inference behind a local chat interface.', source: SRC.odysseus },
        { text: 'Security posture: no external API dependency, local processing, controlled access, private infrastructure.', source: SRC.odysseus },
      ],
      missing: 'The software stack, models, hardware and where it’s hosted aren’t documented yet.',
    },
    implementation: { items: [], missing: 'Deployment steps aren’t written up yet.' },
    challenges: { items: [], missing: 'No troubleshooting has been documented for this project yet.' },
    validation: { items: [], missing: 'No tests or validation steps are documented yet.' },
    result: { items: [], missing: 'No evaluation results have been recorded yet.' },
    learned: { items: [], missing: 'Lessons learned haven’t been written up for this project yet.' },
    skills: ['self-hosting', 'self-hosted-ai'],
    docs: [SRC.odysseus],
  },
];

export const projectBySlug = Object.fromEntries(PROJECTS.map((p) => [p.slug, p])) as Record<string, Project>;

export const CASE_STUDY_SECTIONS = [
  { key: 'objective', title: 'Problem and objective' },
  { key: 'architecture', title: 'Architecture' },
  { key: 'implementation', title: 'Implementation' },
  { key: 'challenges', title: 'Troubleshooting and investigation' },
  { key: 'validation', title: 'Validation' },
  { key: 'result', title: 'Results' },
  { key: 'skills', title: 'Skills demonstrated' },
  { key: 'learned', title: 'What I learned' },
  { key: 'docs', title: 'Source documentation' },
] as const;

export type SectionKey = 'objective' | 'architecture' | 'implementation' | 'challenges' | 'validation' | 'result' | 'learned';
export const WRITTEN_SECTIONS: SectionKey[] = ['objective', 'architecture', 'implementation', 'challenges', 'validation', 'result', 'learned'];

export type Coverage = 'documented' | 'partial' | 'none';
export const COVERAGE_LABEL: Record<Coverage, string> = {
  documented: 'Documented',
  partial: 'Partially documented',
  none: 'Not yet documented',
};

/** Derived from the section's content: never set by hand. */
export function sectionCoverage(s: Section | undefined): Coverage {
  if (!s || s.items.length === 0) return 'none';
  return s.missing ? 'partial' : 'documented';
}

export const FEATURED = PROJECTS.filter((p) => p.tier === 'featured');
export const LAB = PROJECTS.filter((p) => p.tier === 'lab');
