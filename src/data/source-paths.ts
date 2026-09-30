/**
 * Homelab-Portfolio files referenced by the site.
 *
 * Paths are exactly as they appear in the source repo. The build fails
 * (src/lib/validate.ts) if any of these stop existing, so a rename in
 * Homelab-Portfolio is caught before it ships a broken reference.
 */
export const SRC = {
  readme: 'README.md',
  network: 'architecture/Network Overview.md',
  proxmox: 'architecture/Proxmox Cluster Overview.md',
  serviceMap: 'architecture/Service Map.md',
  ad: 'projects/active-directory/README.md',
  gpo: 'projects/active-directory/Group Policy_ Security Banner.md',
  bookstack: 'projects/bookstack/README.md',
  jellyfin: 'projects/jellyfin/README.md',
  odysseus: 'projects/odysseus-ai/README.md',
  wazuh: 'projects/wazuh/README.md',
  suricata: 'projects/wazuh/Wazuh + Suricata Integration.md',
  fedora: 'projects/wazuh/Wazuh Agent Deployment - Fedora Workstation.md',
} as const;

export type SourcePath = (typeof SRC)[keyof typeof SRC];
