/**
 * skills.ts — skills tied to evidence.
 * ─────────────────────────────────────────────────────────────────
 * A skill only gets a page if Homelab-Portfolio contains evidence for it.
 * Each evidence row says what was done, how strong the evidence is,
 * and which file shows it. Professional-experience skills live on the
 * resume, where they're backed by work history instead.
 *
 * Evidence levels (strongest first): validated → walkthrough →
 * architecture → mentioned. See src/data/status.ts.
 */
import { SRC, type SourcePath } from './source-paths';
import { strongest, type EvidenceLevel, type LayerId } from './status';

export interface Evidence {
  /** Case study this evidence belongs to; omit for architecture-only docs */
  project?: string;
  level: EvidenceLevel;
  text: string;
  source: SourcePath;
}

export interface Skill {
  slug: string;
  name: string;
  domain: string;
  /** Cable colour for the domain */
  layer: LayerId;
  summary: string;
  evidence: Evidence[];
}

export const DOMAINS: { name: string; layer: LayerId }[] = [
  { name: 'Security monitoring', layer: 'security' },
  { name: 'Identity and Windows', layer: 'identity' },
  { name: 'Virtualization', layer: 'virtualization' },
  { name: 'Networking and remote access', layer: 'network' },
  { name: 'Linux', layer: 'physical' },
  { name: 'Documentation and self-hosting', layer: 'services' },
];

export const SKILLS: Skill[] = [
  // Security monitoring
  {
    slug: 'wazuh',
    name: 'Wazuh SIEM',
    domain: 'Security monitoring',
    layer: 'security',
    summary: 'Running a Wazuh manager, enrolling agents, adding log sources, and confirming alerts arrive.',
    evidence: [
      { project: 'wazuh-suricata', level: 'validated', text: 'Detected failed logins (rules 2501, 5557) during a deliberate test and triaged the alert.', source: SRC.suricata },
      { project: 'wazuh-suricata', level: 'validated', text: 'Confirmed a remote agent’s registration, log collection, VPN login and sudo events.', source: SRC.fedora },
      { project: 'wazuh-suricata', level: 'walkthrough', text: 'Added Suricata’s eve.json as a JSON localfile in ossec.conf and verified ingestion.', source: SRC.suricata },
      { project: 'wazuh-suricata', level: 'mentioned', text: 'File integrity monitoring, vulnerability detection, threat hunting and MITRE ATT&CK mapping are listed as Wazuh features, with no configuration or test written up yet.', source: SRC.wazuh },
    ],
  },
  {
    slug: 'suricata',
    name: 'Suricata IDS',
    domain: 'Security monitoring',
    layer: 'security',
    summary: 'Installing Suricata, confirming EVE JSON output, and forwarding its alerts into a SIEM.',
    evidence: [
      { project: 'wazuh-suricata', level: 'validated', text: 'Traffic generated from Kali was detected, logged to eve.json and ingested by Wazuh.', source: SRC.suricata },
      { project: 'wazuh-suricata', level: 'walkthrough', text: 'Installed on the Wazuh server; verified the service and EVE JSON logging.', source: SRC.suricata },
    ],
  },
  {
    slug: 'alert-triage',
    name: 'Alert triage',
    domain: 'Security monitoring',
    layer: 'security',
    summary: 'Working an alert to a conclusion: what happened, who was targeted, was it expected, how it’s classified and closed.',
    evidence: [
      { project: 'wazuh-suricata', level: 'validated', text: 'Investigated an authentication-failure alert and recorded classification (benign test activity), reasoning and disposition (closed).', source: SRC.suricata },
    ],
  },
  {
    slug: 'endpoint-monitoring',
    name: 'Endpoint monitoring',
    domain: 'Security monitoring',
    layer: 'security',
    summary: 'Getting endpoint activity (logins, privilege elevation, VPN sessions) into a central place.',
    evidence: [
      { project: 'wazuh-suricata', level: 'validated', text: 'sudo on a remote Fedora laptop showed up in Wazuh as a PAM session with root privileges, with user and timestamp.', source: SRC.fedora },
      { project: 'wazuh-suricata', level: 'architecture', text: 'Agents on Ubuntu Linux and Windows 11 endpoints.', source: SRC.wazuh },
    ],
  },
  {
    slug: 'threat-hunting',
    name: 'Searching security events',
    domain: 'Security monitoring',
    layer: 'security',
    summary: 'Using the Wazuh event search to find specific activity.',
    evidence: [
      { project: 'wazuh-suricata', level: 'walkthrough', text: 'Used Threat Hunting → Events to search for Suricata events and confirm the integration.', source: SRC.suricata },
    ],
  },
  {
    slug: 'security-testing',
    name: 'Detection testing',
    domain: 'Security monitoring',
    layer: 'security',
    summary: 'Generating known activity on purpose to prove a detection works.',
    evidence: [
      { project: 'wazuh-suricata', level: 'validated', text: 'Generated network traffic from Kali to test Suricata.', source: SRC.suricata },
      { project: 'wazuh-suricata', level: 'validated', text: 'Entered wrong passwords on purpose to test authentication-failure detection.', source: SRC.suricata },
    ],
  },

  // Identity and Windows
  {
    slug: 'active-directory',
    name: 'Active Directory',
    domain: 'Identity and Windows',
    layer: 'identity',
    summary: 'Building a forest from scratch and verifying the domain controller.',
    evidence: [
      { project: 'active-directory', level: 'walkthrough', text: 'Installed AD DS and promoted DC01 into the new homelab.local forest.', source: SRC.ad },
      { project: 'active-directory', level: 'architecture', text: 'A Windows workstation VM is domain-joined.', source: SRC.serviceMap },
    ],
  },
  {
    slug: 'group-policy',
    name: 'Group Policy',
    domain: 'Identity and Windows',
    layer: 'identity',
    summary: 'Creating, linking, applying and validating a GPO.',
    evidence: [
      { project: 'active-directory', level: 'walkthrough', text: 'Applied with gpupdate /force; validation with gpresult /r and a pre-logon banner check is documented as a procedure.', source: SRC.gpo },
      { project: 'active-directory', level: 'walkthrough', text: 'Created the Login Banner GPO, set the interactive-logon message title and text, and linked it at homelab.local (Link Enabled: Yes).', source: SRC.gpo },
    ],
  },
  {
    slug: 'windows-server',
    name: 'Windows Server',
    domain: 'Identity and Windows',
    layer: 'identity',
    summary: 'Preparing and configuring a Windows Server 2025 host for a server role.',
    evidence: [
      { project: 'active-directory', level: 'walkthrough', text: 'Static addressing, renaming, role installation and verification on Windows Server 2025.', source: SRC.ad },
    ],
  },
  {
    slug: 'dns',
    name: 'DNS',
    domain: 'Identity and Windows',
    layer: 'identity',
    summary: 'Running AD-integrated DNS on a domain controller.',
    evidence: [
      { project: 'active-directory', level: 'walkthrough', text: 'Enabled DNS Server (AD-integrated) during promotion; the walkthrough explains the DNS delegation warning and why it is safe to ignore in a lab.', source: SRC.ad },
    ],
  },

  // Virtualization
  {
    slug: 'proxmox-ve',
    name: 'Proxmox VE',
    domain: 'Virtualization',
    layer: 'virtualization',
    summary: 'Running a two-host Proxmox environment for VMs and containers.',
    evidence: [
      { project: 'proxmox', level: 'architecture', text: 'Primary and secondary hosts, four VMs and several LXC containers.', source: SRC.proxmox },
      { project: 'active-directory', level: 'architecture', text: 'The domain controller runs as a VM on Proxmox VE 9.', source: SRC.ad },
    ],
  },
  {
    slug: 'lxc-containers',
    name: 'LXC containers',
    domain: 'Virtualization',
    layer: 'virtualization',
    summary: 'Running services as LXC containers alongside full virtual machines.',
    evidence: [
      { project: 'proxmox', level: 'architecture', text: 'BookStack and Jellyfin run as LXC containers.', source: SRC.proxmox },
      { project: 'jellyfin', level: 'architecture', text: 'Jellyfin container reads its libraries from NAS storage.', source: SRC.jellyfin },
    ],
  },

  // Networking
  {
    slug: 'remote-access-vpn',
    name: 'OpenVPN remote access',
    domain: 'Networking and remote access',
    layer: 'network',
    summary: 'Reaching the lab securely from outside, and monitoring it.',
    evidence: [
      { project: 'wazuh-suricata', level: 'validated', text: 'A remote OpenVPN login was observed in Wazuh with source IP, port and timestamp.', source: SRC.fedora },
      { level: 'architecture', text: 'Remote devices connect with OpenVPN through the UniFi gateway.', source: SRC.network },
    ],
  },
  {
    slug: 'unifi',
    name: 'UniFi gateway',
    domain: 'Networking and remote access',
    layer: 'network',
    summary: 'Routing, firewall policy and VPN on a UDM SE.',
    evidence: [
      { level: 'architecture', text: 'Handles routing, firewall policies, VPN access and network management.', source: SRC.network },
    ],
  },

  // Linux
  {
    slug: 'linux-administration',
    name: 'Linux administration',
    domain: 'Linux',
    layer: 'physical',
    summary: 'Managing services, editing configuration and working with logs on Linux servers and workstations.',
    evidence: [
      { project: 'wazuh-suricata', level: 'walkthrough', text: 'systemctl service management and ossec.conf edits on the Ubuntu Wazuh server.', source: SRC.suricata },
      { project: 'wazuh-suricata', level: 'validated', text: 'Deployed and verified a Wazuh agent on a Fedora workstation.', source: SRC.fedora },
    ],
  },

  // Documentation and self-hosting
  {
    slug: 'technical-documentation',
    name: 'Technical documentation',
    domain: 'Documentation and self-hosting',
    layer: 'services',
    summary: 'Writing procedures with validation steps, and keeping a knowledge base organised.',
    evidence: [
      { project: 'active-directory', level: 'walkthrough', text: 'Step-by-step build guides with a "why" and a validation for each step.', source: SRC.ad },
      { project: 'bookstack', level: 'architecture', text: 'A BookStack knowledge base organised into four shelves.', source: SRC.bookstack },
    ],
  },
  {
    slug: 'self-hosting',
    name: 'Self-hosted services',
    domain: 'Documentation and self-hosting',
    layer: 'services',
    summary: 'Running applications on your own infrastructure.',
    evidence: [
      { project: 'bookstack', level: 'architecture', text: 'BookStack as the lab’s documentation platform.', source: SRC.bookstack },
      { project: 'jellyfin', level: 'architecture', text: 'Jellyfin backed by NAS storage.', source: SRC.jellyfin },
      { project: 'odysseus-ai', level: 'architecture', text: 'Odysseus local AI platform (experimental).', source: SRC.odysseus },
    ],
  },
  {
    slug: 'self-hosted-ai',
    name: 'Local AI hosting',
    domain: 'Documentation and self-hosting',
    layer: 'services',
    summary: 'Running language models locally so data stays private.',
    evidence: [
      { project: 'odysseus-ai', level: 'architecture', text: 'Local LLMs with self-hosted inference and no external API dependency.', source: SRC.odysseus },
    ],
  },
];

export const skillBySlug = Object.fromEntries(SKILLS.map((s) => [s.slug, s])) as Record<string, Skill>;

export const skillStrength = (s: Skill) => strongest(s.evidence.map((e) => e.level));

/**
 * Skills Homelab-Portfolio's README lists, but that no document in the
 * repository shows being used yet. Shown on /skills/ as "evidence not yet
 * documented" rather than given evidence pages. Remove an entry once a
 * write-up exists and give it a proper SKILLS entry instead.
 */
export const LISTED_WITHOUT_EVIDENCE: { name: string; note: string; source: SourcePath }[] = [
  { name: 'Vulnerability management', note: 'Listed as a skill and as a project; no write-up yet. Wazuh’s vulnerability detection is listed as a feature only.', source: SRC.readme },
  { name: 'File integrity monitoring', note: 'Listed as a skill and a Wazuh feature; no configuration or test documented.', source: SRC.readme },
  { name: 'VLAN segmentation', note: 'Listed as a skill and part of the Network Infrastructure project; no VLAN design is documented.', source: SRC.readme },
  { name: 'Firewall management', note: 'The gateway is documented as applying firewall policies, but no rules or changes are written up.', source: SRC.readme },
  { name: 'Routing and switching', note: 'Listed as a skill; no routing or switching configuration is documented.', source: SRC.readme },
];
