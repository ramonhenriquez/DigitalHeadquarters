/**
 * infrastructure.ts — the homelab as a model.
 * ─────────────────────────────────────────────────────────────────
 * One set of nodes, six views. A node that appears in several views
 * (e.g. the Wazuh manager) is the same object with the same facts.
 *
 * RULES
 *   - Every fact cites the Homelab-Portfolio file it comes from.
 *   - If something isn't documented, list it under `undocumented`
 *     instead of guessing. Those lines are shown to visitors.
 *   - Don't draw an edge the documentation doesn't support. Dashed +
 *     `planned: true` for objectives that haven't been built.
 *
 * Coordinates are in SVG user units; each view sets its own viewBox.
 * Default node size is 176 × 60.
 */
import { SRC, type SourcePath } from './source-paths';
import type { LayerId, StatusId } from './status';

export interface Fact {
  text: string;
  source: SourcePath;
}

export interface InfraNode {
  id: string;
  label: string;
  /** Shorter name for the map plate when the full label won't fit */
  short?: string;
  /** Real identifier (hostname, domain, file) shown in monospace. Omit if none is documented. */
  ident?: string;
  kind: string;
  layer: LayerId;
  status?: StatusId;
  summary: string;
  facts: Fact[];
  undocumented?: string[];
  projects?: string[];
}

export interface ViewNode {
  id: string;
  x: number;
  y: number;
  w?: number;
  /** Override the plate's name for this view (e.g. a hostname in a tight row) */
  label?: string;
  /** Override the second line on the plate for this view */
  sub?: string;
}

export interface Edge {
  from: string;
  to: string;
  label?: string;
  planned?: boolean;
  dashed?: boolean;
  /** Routing hint: v = vertical elbow, h = horizontal elbow, hv / vh = L-shapes */
  route?: 'v' | 'h' | 'hv' | 'vh';
  /** Where to put the label along the path */
  labelAt?: 'start' | 'mid' | 'end';
}

export interface Group {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface View {
  id: LayerId;
  width: number;
  height: number;
  nodes: ViewNode[];
  edges: Edge[];
  groups?: Group[];
  /** Plain-language caveat shown under the map */
  note?: string;
}

export const NODE_W = 176;
export const NODE_H = 60;

// ─── NODES ────────────────────────────────────────────────────────

export const NODES: InfraNode[] = [
  {
    id: 'internet',
    label: 'Internet',
    kind: 'External network',
    layer: 'network',
    summary: 'External connectivity for the homelab.',
    facts: [{ text: 'Provides external connectivity to the homelab environment.', source: SRC.network }],
  },
  {
    id: 'udm',
    label: 'UniFi gateway',
    ident: 'UDM SE',
    kind: 'Gateway and firewall',
    layer: 'network',
    status: 'deployed',
    summary: 'Routes traffic, applies firewall policy, and terminates OpenVPN for remote access.',
    facts: [
      { text: 'Responsible for routing, firewall policies, VPN access, and network management.', source: SRC.network },
      { text: 'Listed in the lab inventory as a UDM SE.', source: SRC.readme },
      { text: 'Remote devices connect to the home network with OpenVPN.', source: SRC.network },
      { text: 'OpenVPN logins from the remote Fedora workstation were observed in Wazuh, including source IP, port and timestamp.', source: SRC.fedora },
    ],
    undocumented: ['VLAN and subnet layout', 'Firewall rule set', 'Switching between the gateway and the hosts'],
    projects: ['wazuh-suricata'],
  },
  {
    id: 'mobile',
    label: 'Mobile devices',
    kind: 'Remote VPN clients',
    layer: 'network',
    summary: 'Phones and other mobile devices that reach the lab over OpenVPN.',
    facts: [{ text: 'Mobile devices are listed as OpenVPN remote-access clients.', source: SRC.network }],
  },
  {
    id: 'pve1',
    label: 'Proxmox host (primary)',
    short: 'Proxmox primary',
    kind: 'Hypervisor host',
    layer: 'virtualization',
    status: 'deployed',
    summary: 'Runs the production virtual machines and containers and provides their storage and compute.',
    facts: [
      { text: 'Hosts production virtual machines and containers.', source: SRC.proxmox },
      { text: 'Provides storage and compute resources.', source: SRC.proxmox },
    ],
    undocumented: ['Hardware specification', 'Storage layout', 'Network bridges', 'Backup configuration'],
    projects: ['proxmox'],
  },
  {
    id: 'pve2',
    label: 'Proxmox host (secondary)',
    short: 'Proxmox secondary',
    kind: 'Hypervisor host',
    layer: 'virtualization',
    status: 'deployed',
    summary: 'Used for workload distribution, and set aside for future high-availability and migration testing.',
    facts: [
      { text: 'Used for workload distribution.', source: SRC.proxmox },
      { text: 'Supports future high-availability and migration testing.', source: SRC.proxmox },
    ],
    undocumented: ['Hardware specification', 'Whether it is joined to the primary as a Proxmox cluster', 'Which guests it runs'],
    projects: ['proxmox'],
  },
  {
    id: 'proxmox-env',
    label: 'Proxmox VE',
    kind: 'Virtualization platform',
    layer: 'virtualization',
    status: 'deployed',
    summary: 'The platform that hosts every virtual machine and container in the lab.',
    facts: [
      { text: 'Hosts all virtual machines and containers.', source: SRC.serviceMap },
      { text: 'Runs across a primary and a secondary host.', source: SRC.proxmox },
      { text: 'The Active Directory build records the version as Proxmox VE 9.', source: SRC.ad },
    ],
    projects: ['proxmox'],
  },
  {
    id: 'nas',
    label: 'NAS storage',
    kind: 'Network storage',
    layer: 'physical',
    status: 'deployed',
    summary: 'Centralised network storage that holds the Jellyfin media libraries.',
    facts: [{ text: 'Jellyfin is connected to centralised NAS storage.', source: SRC.jellyfin }],
    undocumented: ['Make and model', 'How it is mounted into the Jellyfin container', 'Other workloads that use it'],
    projects: ['jellyfin'],
  },
  {
    id: 'dc01',
    label: 'Domain controller',
    ident: 'DC01',
    kind: 'Virtual machine, Windows Server 2025',
    layer: 'identity',
    status: 'deployed',
    summary: 'Windows Server 2025 domain controller for the homelab.local forest, with AD-integrated DNS.',
    facts: [
      { text: 'Windows Server 2025 Standard Evaluation, running on Proxmox VE 9.', source: SRC.ad },
      { text: 'Promoted into a new forest, homelab.local (NetBIOS name HOMELAB).', source: SRC.ad },
      { text: 'DNS Server and Global Catalog enabled during promotion.', source: SRC.ad },
      { text: 'Provides user authentication, Group Policy management and centralised administration.', source: SRC.serviceMap },
    ],
    undocumented: ['OU design, users and groups'],
    projects: ['active-directory'],
  },
  {
    id: 'gpo',
    label: 'Login Banner GPO',
    ident: 'Login Banner',
    kind: 'Group Policy Object',
    layer: 'identity',
    status: 'deployed',
    summary: 'Shows an "Authorized Access Only" notice before logon on every domain-joined system.',
    facts: [
      { text: 'Linked at the domain level (homelab.local), so it applies to all domain-joined systems.', source: SRC.gpo },
      { text: 'Sets the interactive-logon message title and text.', source: SRC.gpo },
      { text: 'Applied with gpupdate /force and confirmed in gpresult /r.', source: SRC.gpo },
    ],
    projects: ['active-directory'],
  },
  {
    id: 'win-ws',
    label: 'Windows workstation',
    kind: 'Virtual machine',
    layer: 'identity',
    status: 'deployed',
    summary: 'Domain-joined Windows endpoint used for monitoring and testing.',
    facts: [
      { text: 'Runs as a Proxmox VM for endpoint monitoring and testing.', source: SRC.proxmox },
      { text: 'Joined to Active Directory, with the Wazuh agent installed.', source: SRC.serviceMap },
    ],
    projects: ['active-directory', 'wazuh-suricata'],
  },
  {
    id: 'linux-ws',
    label: 'Linux workstation',
    kind: 'Virtual machine',
    layer: 'virtualization',
    status: 'deployed',
    summary: 'Virtual machine for Linux administration and testing.',
    facts: [{ text: 'Runs as a Proxmox VM for Linux administration and testing.', source: SRC.proxmox }],
    undocumented: ['Distribution'],
    projects: ['proxmox'],
  },
  {
    id: 'extra-lxc',
    label: 'Additional services',
    kind: 'LXC containers',
    layer: 'virtualization',
    status: 'planned',
    summary: 'Container capacity set aside for future projects and testing.',
    facts: [{ text: 'Reserved for future projects and testing.', source: SRC.proxmox }],
    projects: ['proxmox'],
  },
  {
    id: 'wazuh',
    label: 'Wazuh manager',
    kind: 'Virtual machine, Ubuntu Server',
    layer: 'security',
    status: 'active',
    summary: 'The SIEM: collects agent logs and Suricata alerts and makes them searchable in one place.',
    facts: [
      { text: 'Runs on an Ubuntu Server virtual machine.', source: SRC.fedora },
      { text: 'Collects authentication events, system logs, security alerts and endpoint activity.', source: SRC.serviceMap },
      { text: 'Reads Suricata’s eve.json as a JSON localfile configured in ossec.conf.', source: SRC.suricata },
      { text: 'Raised rules 2501 and 5557 during a deliberate failed-login test on the server itself.', source: SRC.suricata },
    ],
    undocumented: ['Wazuh version and install method'],
    projects: ['wazuh-suricata'],
  },
  {
    id: 'suricata',
    label: 'Suricata',
    ident: 'eve.json',
    kind: 'Network intrusion detection',
    layer: 'security',
    status: 'active',
    summary: 'Inspects network traffic on the Wazuh server and writes its alerts to eve.json for Wazuh to ingest.',
    facts: [
      { text: 'Installed on the Wazuh server.', source: SRC.suricata },
      { text: 'Logs events in EVE JSON format to /var/log/suricata/eve.json.', source: SRC.suricata },
      { text: 'Detected test traffic generated from Kali Linux; the events reached Wazuh.', source: SRC.suricata },
    ],
    undocumented: ['Which interface it captures on, and so which traffic it can see', 'Ruleset source and update method'],
    projects: ['wazuh-suricata'],
  },
  {
    id: 'ubuntu-agent',
    label: 'Ubuntu Linux endpoint',
    short: 'Ubuntu endpoint',
    kind: 'Wazuh agent',
    layer: 'security',
    status: 'deployed',
    summary: 'A Linux endpoint reporting to Wazuh.',
    facts: [{ text: 'Ubuntu Linux is listed as a monitored Wazuh agent.', source: SRC.wazuh }],
    undocumented: ['Which lab machine runs this agent'],
    projects: ['wazuh-suricata'],
  },
  {
    id: 'fedora',
    label: 'Fedora laptop',
    kind: 'Remote endpoint',
    layer: 'security',
    status: 'deployed',
    summary: 'Linux admin workstation that reaches the lab over OpenVPN and reports to Wazuh from outside the network.',
    facts: [
      { text: 'Linux administration workstation with VPN-enabled remote access.', source: SRC.serviceMap },
      { text: 'Wazuh agent registered over UniFi OpenVPN; remote log collection confirmed.', source: SRC.fedora },
      { text: 'sudo elevation on the laptop was detected in Wazuh as a PAM session with root privileges.', source: SRC.fedora },
    ],
    projects: ['wazuh-suricata'],
  },
  {
    id: 'kali',
    label: 'Kali Linux',
    kind: 'Security testing workstation',
    layer: 'security',
    status: 'deployed',
    summary: 'Used to generate test traffic and validate that detections fire.',
    facts: [
      { text: 'Used for security testing, network analysis and validating SIEM detections.', source: SRC.serviceMap },
      { text: 'Generated the network traffic for the Suricata detection test.', source: SRC.suricata },
    ],
    undocumented: ['Whether it runs as a VM or on separate hardware', 'What traffic was generated'],
    projects: ['wazuh-suricata'],
  },
  {
    id: 'tactical-rmm',
    label: 'Tactical RMM',
    kind: 'Remote management',
    layer: 'identity',
    status: 'planned',
    summary: 'Remote monitoring and management platform the domain was prepared for.',
    facts: [{ text: 'Listed as a follow-on the Active Directory build prepares for.', source: SRC.ad }],
    projects: ['active-directory'],
  },
  {
    id: 'bookstack',
    label: 'BookStack',
    kind: 'LXC container',
    layer: 'services',
    status: 'deployed',
    summary: 'The lab’s documentation platform for infrastructure notes, procedures and troubleshooting guides.',
    facts: [
      { text: 'Runs as a container on Proxmox.', source: SRC.proxmox },
      { text: 'Holds infrastructure documentation (Proxmox, networking, security tools, VMs) and operational documentation (troubleshooting guides, procedures, asset tracking, maintenance records).', source: SRC.bookstack },
    ],
    undocumented: ['Install method, database and backups', 'How access is authenticated'],
    projects: ['bookstack'],
  },
  {
    id: 'shelves',
    label: 'Documentation shelves',
    short: 'BookStack shelves',
    kind: 'Content structure',
    layer: 'services',
    summary: 'BookStack content is organised into four shelves.',
    facts: [{ text: 'Shelves: Network & Security, Learning & Certifications, General Documentation, Homelab Infrastructure.', source: SRC.bookstack }],
    projects: ['bookstack'],
  },
  {
    id: 'jellyfin',
    label: 'Jellyfin',
    kind: 'LXC container',
    layer: 'services',
    status: 'deployed',
    summary: 'Self-hosted media server backed by NAS storage.',
    facts: [
      { text: 'Runs as an LXC container on Proxmox.', source: SRC.proxmox },
      { text: 'Serves media libraries stored on the NAS.', source: SRC.jellyfin },
    ],
    undocumented: ['How the NAS is mounted', 'User access model'],
    projects: ['jellyfin'],
  },
  {
    id: 'media',
    label: 'Media libraries',
    kind: 'Content',
    layer: 'services',
    summary: 'The libraries Jellyfin serves.',
    facts: [{ text: 'Movies, Music, Audiobooks, Anime and Documentaries.', source: SRC.jellyfin }],
    projects: ['jellyfin'],
  },
  {
    id: 'odysseus',
    label: 'Odysseus AI',
    kind: 'Self-hosted AI platform',
    layer: 'services',
    status: 'experimental',
    summary: 'Local large-language-model platform for private experiments, with no external API dependency.',
    facts: [
      { text: 'Runs local LLMs with self-hosted inference and a local chat interface.', source: SRC.odysseus },
      { text: 'No external API dependency; processing stays on private infrastructure with controlled access.', source: SRC.odysseus },
    ],
    undocumented: ['Software stack and models', 'Hardware', 'Where it is hosted'],
    projects: ['odysseus-ai'],
  },
];

export const nodeById = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<string, InfraNode>;

// ─── VIEWS ────────────────────────────────────────────────────────

export const VIEWS: View[] = [
  {
    id: 'physical',
    width: 960,
    height: 400,
    nodes: [
      { id: 'internet', x: 392, y: 24 },
      { id: 'fedora', x: 744, y: 24, sub: 'OpenVPN client' },
      { id: 'mobile', x: 744, y: 108, sub: 'OpenVPN clients' },
      { id: 'udm', x: 392, y: 160 },
      { id: 'pve1', x: 60, y: 310, w: 196, sub: 'compute + storage' },
      { id: 'pve2', x: 382, y: 310, w: 196, sub: 'workload distribution' },
      { id: 'nas', x: 704, y: 310, sub: 'media storage' },
    ],
    groups: [{ id: 'onprem', label: 'Lab hardware', x: 36, y: 272, w: 888, h: 116 }],
    edges: [
      { from: 'internet', to: 'udm', label: 'WAN' },
      { from: 'fedora', to: 'internet', label: 'OpenVPN', dashed: true, route: 'h' },
      { from: 'mobile', to: 'internet', dashed: true, route: 'h' },
      { from: 'udm', to: 'onprem', label: 'internal network' },
    ],
    note: 'Only hardware documented in Homelab-Portfolio is shown. How these devices are cabled to the gateway (switching, ports, power) isn’t documented yet, so they’re drawn as one group.',
  },
  {
    id: 'network',
    width: 960,
    height: 430,
    nodes: [
      { id: 'internet', x: 392, y: 24 },
      { id: 'udm', x: 392, y: 150, sub: 'routing, firewall, VPN' },
      { id: 'fedora', x: 40, y: 150, sub: 'OpenVPN client' },
      { id: 'mobile', x: 40, y: 232, sub: 'OpenVPN clients' },
      { id: 'dc01', x: 40, y: 340, w: 160, label: 'DC01', sub: 'domain controller' },
      { id: 'wazuh', x: 224, y: 340, w: 160, label: 'Wazuh', sub: 'SIEM manager' },
      { id: 'bookstack', x: 408, y: 340, w: 160, sub: 'documentation' },
      { id: 'jellyfin', x: 592, y: 340, w: 160, sub: 'media' },
      { id: 'odysseus', x: 776, y: 340, w: 160, sub: 'AI experiments' },
    ],
    groups: [{ id: 'lan', label: 'Internal services', x: 24, y: 300, w: 928, h: 116 }],
    edges: [
      { from: 'internet', to: 'udm', label: 'WAN' },
      { from: 'fedora', to: 'udm', label: 'OpenVPN tunnel', dashed: true, route: 'h' },
      { from: 'mobile', to: 'udm', dashed: true, route: 'h' },
      { from: 'udm', to: 'lan', label: 'firewall policies' },
    ],
    note: 'Segmentation (VLANs and subnets) isn’t documented yet, so internal services are drawn as one group rather than guessed networks.',
  },
  {
    id: 'virtualization',
    width: 960,
    height: 420,
    nodes: [
      { id: 'pve1', x: 150, y: 24 },
      { id: 'pve2', x: 634, y: 24 },
      { id: 'dc01', x: 48, y: 208, w: 184 },
      { id: 'wazuh', x: 256, y: 208, w: 184, sub: 'Ubuntu Server' },
      { id: 'win-ws', x: 48, y: 300, w: 184 },
      { id: 'linux-ws', x: 256, y: 300, w: 184 },
      { id: 'bookstack', x: 520, y: 208, w: 184, sub: 'documentation' },
      { id: 'jellyfin', x: 728, y: 208, w: 184, sub: 'media server' },
      { id: 'extra-lxc', x: 520, y: 300, w: 184, sub: 'future projects' },
    ],
    groups: [
      { id: 'vms', label: 'Virtual machines', x: 24, y: 160, w: 440, h: 230 },
      { id: 'lxcs', label: 'LXC containers', x: 496, y: 160, w: 440, h: 230 },
    ],
    edges: [
      { from: 'pve1', to: 'vms', label: 'production guests' },
      { from: 'pve1', to: 'lxcs' },
      { from: 'pve1', to: 'pve2', label: 'planned: HA / migration', planned: true, route: 'h' },
    ],
    note: 'Which host runs each guest isn’t documented. The primary host is described as running the production guests.',
  },
  {
    id: 'security',
    width: 960,
    height: 400,
    nodes: [
      { id: 'kali', x: 24, y: 70, sub: 'test traffic source' },
      { id: 'suricata', x: 296, y: 70 },
      { id: 'wazuh', x: 580, y: 70, sub: 'Ubuntu Server VM' },
      { id: 'ubuntu-agent', x: 180, y: 316 },
      { id: 'win-ws', x: 420, y: 316, sub: 'domain-joined' },
      { id: 'fedora', x: 660, y: 316, sub: 'remote, over OpenVPN' },
    ],
    groups: [{ id: 'wazuh-server', label: 'Wazuh server', x: 272, y: 30, w: 508, h: 124 }],
    edges: [
      { from: 'kali', to: 'suricata', label: 'test traffic', route: 'h' },
      { from: 'suricata', to: 'wazuh', label: 'eve.json', route: 'h' },
      { from: 'ubuntu-agent', to: 'wazuh', label: 'agent', labelAt: 'start' },
      { from: 'win-ws', to: 'wazuh', label: 'agent', labelAt: 'start' },
      { from: 'fedora', to: 'wazuh', label: 'agent via VPN', labelAt: 'start' },
    ],
    note: 'Suricata runs on the Wazuh server. Where it captures traffic, and therefore how much of the network it can see, isn’t documented yet.',
  },
  {
    id: 'identity',
    width: 960,
    height: 420,
    nodes: [
      { id: 'dc01', x: 392, y: 24, sub: 'homelab.local' },
      { id: 'gpo', x: 392, y: 164 },
      { id: 'win-ws', x: 392, y: 330 },
      { id: 'wazuh', x: 64, y: 164, sub: 'objective' },
      { id: 'tactical-rmm', x: 720, y: 164, sub: 'objective' },
    ],
    groups: [{ id: 'joined', label: 'Domain-joined systems', x: 312, y: 296, w: 336, h: 108 }],
    edges: [
      { from: 'dc01', to: 'gpo', label: 'linked at domain root' },
      { from: 'gpo', to: 'joined', label: 'banner before logon' },
      { from: 'dc01', to: 'wazuh', label: 'monitoring', planned: true, route: 'hv' },
      { from: 'dc01', to: 'tactical-rmm', label: 'remote management', planned: true, route: 'hv' },
    ],
    note: 'Dashed lines are integrations the domain build was prepared for; their completion isn’t documented yet. (The Windows workstation is separately documented as running a Wazuh agent.)',
  },
  {
    id: 'services',
    width: 960,
    height: 500,
    nodes: [
      { id: 'proxmox-env', x: 200, y: 24, sub: 'container host' },
      { id: 'bookstack', x: 40, y: 164, sub: 'LXC' },
      { id: 'jellyfin', x: 360, y: 164, sub: 'LXC' },
      { id: 'shelves', x: 40, y: 300, sub: '4 shelves' },
      { id: 'nas', x: 360, y: 300 },
      { id: 'media', x: 360, y: 420, sub: '5 libraries' },
      { id: 'odysseus', x: 720, y: 164, sub: 'local LLM inference' },
    ],
    edges: [
      { from: 'proxmox-env', to: 'bookstack' },
      { from: 'proxmox-env', to: 'jellyfin' },
      { from: 'bookstack', to: 'shelves', label: 'organised into' },
      { from: 'jellyfin', to: 'nas', label: 'reads from' },
      { from: 'nas', to: 'media', label: 'stores' },
    ],
    note: 'Where Odysseus runs isn’t documented yet, so it’s shown without a host.',
  },
];

export const viewById = Object.fromEntries(VIEWS.map((v) => [v.id, v])) as Record<LayerId, View>;

/** Views a node appears in — used for "Appears in" links in the detail panel. */
export function viewsForNode(id: string): LayerId[] {
  return VIEWS.filter((v) => v.nodes.some((n) => n.id === id)).map((v) => v.id);
}
