# Content gaps: roadmap for Homelab-Portfolio

Audited against Homelab-Portfolio at commit `ece9177` (2026-06-23).

This file does two jobs:

1. **Decisions only you can make**: places where your own sources disagree. The site currently follows Homelab-Portfolio, as the default source of truth, until you say otherwise.
2. **What to write next**, project by project. Every item is something the site would show if Homelab-Portfolio documented it. Until then the site says "Not yet documented" and invents nothing.

Priorities are marked **High** (moves a project up a tier or fixes a public claim), **Medium** (strengthens an existing page) and **Low** (polish).

---

## 1. Decisions needed from you

| # | Question | What the sources say | What the site shows now | Where to change it |
| --- | --- | --- | --- | --- |
| C1 | **Is CompTIA Security+ earned?** | HP README: "CompTIA Security+ (2026)" under *Certifications*. Web résumé (old): "In progress". `resume.pdf`: "Scheduled May 26, 2026". | "CompTIA Security+ · 2026" with **no status**, on the résumé page and timeline. | `CERTIFICATIONS` in `src/data/site.ts` (`status: 'earned' \| 'in-progress' \| 'scheduled'`). Then make HP README and `resume.pdf` agree. |
| C2 | When were things built? | No HP document has a build date. The previous site had: first Proxmox node Q3 2024, second host Q4 2024, AD Q2 2025, Wazuh Q2 2026, Odysseus Q2 2026. | Homelab items are **undated**, listed in build order. | Add a date to each project doc (see [SOURCE_FORMAT.md](SOURCE_FORMAT.md)), then `src/data/timeline.ts`. |
| C3 | Was the AD domain built on Proxmox VE 9? | AD docs say Proxmox VE 9 (released Aug 2025). The previous site dated AD to Q2 2025. | "Proxmox VE 9", undated. | If the domain predates PVE 9 and the host was upgraded, say so in the AD README. |
| C4 | Is Suricata running as an IDS or an IPS? | Integration doc: "IDS/IPS". Service Map and Network Overview: "IDS". No inline/IPS configuration is documented. | "Suricata IDS". | Document the mode in the Suricata write-up. |
| C5 | Are pfSense, Docker, Pi-hole, Tailscale and Uptime Kuma still planned? | Not mentioned anywhere in HP. The previous site listed them as a roadmap. | **Removed.** | If they're real plans, add a `ROADMAP.md` to HP and they can return as PLANNED. |
| C6 | Odysseus software stack | Previous site: Ollama + Open WebUI. HP: "local LLMs, self-hosted inference" only. | No tool names. | `projects/odysseus-ai/README.md`. |
| C7 | Home hardware | Previous site: switches, IP cameras, NVR, UNAS, UPS, 12U rack. HP: UDM SE, two Proxmox hosts, "NAS storage". | Only the HP-documented hardware. | `architecture/` (a hardware inventory doc). |
| C8 | Web résumé skills not in `resume.pdf` or HP | VMware ESXi, PowerShell and VLAN Segmentation appear in the web résumé's skills list; the PDF has no skills section and HP shows none of them in use. | **Left in place** on `/resume/` (it's your résumé), flagged here. | `src/pages/resume.astro`: confirm or remove. |
| C9 | Phone number and home city | `/resume/` and `resume.pdf` show 954-851-3522 and Plantation, FL. The rest of the site shows only email, LinkedIn, GitHub and "South Florida". | Unchanged. | `RESUME_CONTACT` in `src/data/site.ts` (set `phone: null` to hide it on the page). The PDF has to be replaced to change it there. |
| C10 | HP README projects with no documents | "Network Infrastructure" and "Vulnerability Management". | Not shown as projects; the related skills appear under "Listed, with evidence not yet documented". | Add project folders in HP, or remove the rows from the README. |
| C11 | HP README LinkedIn link is malformed | `[(https://…)]` | Site uses the correct URL. | HP `README.md`: `[LinkedIn](https://www.linkedin.com/in/ramon-henriquez-263176174/)`. |

---

## 2. Project roadmap

What each project has, what it is missing, and what would change on the site if it were added. "Tier" is how the site classifies the project today: **Featured case study** (enough evidence for a full case study) or **Lab system** (documented, not yet deep enough).

### Wazuh SIEM + Suricata — Featured case study

Has: objectives, environment, Suricata integration steps with commands, two recorded tests (Kali traffic; failed authentication with rule IDs), a full alert investigation with disposition, a remote Fedora agent validated over OpenVPN (VPN login, sudo/PAM), lessons learned.

Missing:
- **High** — Wazuh manager installation: version, install method, VM sizing, dashboard access.
- **High** — Agent deployment for the Ubuntu and Windows 11 endpoints (the Fedora one is the only write-up).
- **High** — Troubleshooting during the build: anything that didn't work first time and how it was fixed. This is the one core case-study section that is only partly covered.
- **Medium** — Where Suricata captures traffic (interface, mirror/span port, or host-only), and therefore what it can see.
- **Medium** — Suricata ruleset (ET Open?), update method, and one example alert with its signature.
- **Medium** — What traffic the Kali test generated (e.g. an nmap scan) and the Suricata alert it produced.
- **Medium** — The features the README lists without evidence: file integrity monitoring, vulnerability detection, MITRE ATT&CK mapping. One short test each would turn "Mentioned only" into evidence.
- **Low** — Screenshots of the dashboard and the alert (the write-up would be stronger with them).

### Active Directory — Featured case study

Has: a step-by-step DC build (static IP, rename, AD DS, promotion, NetBIOS, paths, verification), the Login Banner GPO end to end, and validation procedures with expected output.

Missing:
- **High** — Observed results. The validation sections describe what *should* appear; add what *did* (captured `gpresult /r` output, `hostname`/`ipconfig` output, or the screenshots the GPO doc names, such as `gpo-login-banner-linked.png`, which aren't in the repo). That would let the site label AD "Validated by test" instead of "Step-by-step documented".
- **High** — Lessons learned (the only core section with nothing yet).
- **Medium** — Troubleshooting: did the DNS delegation warning actually appear? Any other issues?
- **Medium** — Domain join of the Windows workstation (the Service Map says it's joined; no procedure is written up).
- **Medium** — OU design, users and groups, and any further GPOs.
- **Low** — Status of the two follow-on objectives: Wazuh monitoring of the domain, and Tactical RMM.
- **Low** — Fix heading levels in the README (sections use `#`, sub-steps `###`); it's the one accessibility warning left on the site.

### Proxmox — Lab system

Has: the role of each host, the VM and container inventory, and the Proxmox VE 9 version (from the AD doc).

Missing (any three of the **High** items would make this a candidate for a case study):
- **High** — Physical host specifications (CPU, RAM, disks, NICs).
- **High** — Cluster configuration: is it a Proxmox cluster (`pvecm`) or two standalone nodes? Quorum?
- **High** — VM and LXC placement: which guest runs on which host.
- **High** — Storage architecture: local, ZFS, LVM-thin, NFS/SMB to the NAS.
- **Medium** — Networking: bridges (`vmbr0`…), VLAN-aware bridges, how guests reach the network.
- **Medium** — Backup strategy: vzdump schedule, target, retention, a tested restore.
- **Medium** — Migration examples, or the HA/migration testing the secondary host is set aside for.
- **Medium** — Outages and recovery; troubleshooting examples.
- **Low** — Lessons learned.

### BookStack — Lab system

Has: objectives, features, and the four-shelf structure.

Missing:
- **High** — Deployment method: LXC template, Docker-in-LXC, or a manual install; database.
- **High** — Architecture: where it runs, how it's reached (LAN only? over the VPN?).
- **Medium** — Authentication and access model (local accounts, LDAP/AD integration?).
- **Medium** — Backup strategy for the database and uploads.
- **Medium** — An example of the documentation structure (a sanitised page or book outline).
- **Medium** — Operational use: one real example of a procedure or troubleshooting guide being used.
- **Low** — Troubleshooting; lessons learned.

### Jellyfin — Lab system

Has: objectives, the LXC → NAS → libraries architecture, and five library types.

Missing:
- **High** — LXC architecture: privileged or unprivileged, resources, OS.
- **High** — NAS mount architecture: NFS or SMB, mount point, how it's passed into the container, permissions/UID mapping.
- **Medium** — Media directory structure on the NAS.
- **Medium** — User access management (an objective with no write-up) and remote access, if any.
- **Medium** — Storage troubleshooting (mount or permission problems are the classic LXC issue and would make a strong write-up).
- **Medium** — Transcoding and playback problems; unsupported-media investigation; hardware acceleration.
- **Low** — Quality profile changes; lessons learned.

### Odysseus AI — Lab system (experimental)

Has: objectives, the "local LLMs / self-hosted inference / chat interface" description, and the privacy/security considerations.

Missing:
- **High** — Where it runs: which host, VM or container, or separate hardware.
- **High** — Hardware and resources (GPU? RAM?).
- **High** — Software stack (resolves C6) and model deployment: which models, how they're served.
- **Medium** — Access architecture: how the chat interface is reached, and what "controlled access" means in practice.
- **Medium** — Performance observations (tokens/s, which model sizes are usable). Only if measured.
- **Medium** — Privacy/security architecture: confirming there's no external API call.
- **Medium** — Testing; lessons learned.

### Network (lab-wide) — not a project yet

Has: Network Overview (UDM SE roles, OpenVPN remote access, internal services list, security features).

Missing:
- **High** — VLAN and subnet design. The README lists VLAN segmentation as a skill and "Network Infrastructure" as a project, but nothing documents it.
- **High** — Firewall policy: at least the rules between segments and for VPN clients.
- **Medium** — OpenVPN server configuration (subnet, auth method, which resources clients can reach).
- **Medium** — Physical switching and cabling between the gateway, hosts and NAS (the map draws them as one group until this exists).
- **Low** — DNS for the lab: how clients resolve `homelab.local` (the DC? the gateway?).

### Vulnerability management — listed, not documented

HP README lists it as a skill and a project. Nothing else documents it. **High** if you want it on the site: the scanner used, the scope scanned, one finding and its remediation.

---

## 3. Source formatting fixes in Homelab-Portfolio (small)

- `projects/wazuh/Wazuh + Suricata Integration.md`: no title heading (starts with `## Project Overview`) and `# Environment` partway down. Add `# Wazuh + Suricata Integration` at the top and change the later `#` headings to `##`.
- `projects/wazuh/Wazuh Agent Deployment - Fedora Workstation.md`: no title heading (starts with `## Objective`).
- `projects/active-directory/README.md`: sections use `#` and sub-steps `###`. Use `##` for sections so the heading levels don't skip.
- `projects/active-directory/Group Policy_ Security Banner.md`: `# Objectives` and other `#` headings partway down; use `##`.
- Optional frontmatter (`title`, `summary`, `date`, `status`) is described in [SOURCE_FORMAT.md](SOURCE_FORMAT.md). A `date` is the single change that would let the timeline show real dates (C2).

---

## 4. How the site uses this

- The **documentation pages** (`/docs/`) update automatically on the next build when HP changes.
- Everything else (case studies, the map, skills and evidence, the timeline) is written by hand in `src/data/` from HP, with every fact citing its source file. After adding material to HP, update the matching data file. The build fails if a cited file is renamed or deleted.
- A lab system can be promoted to a featured case study by setting `tier: 'featured'` in `src/data/projects.ts`. The build refuses unless its objective, implementation, validation and results all have documented items.
