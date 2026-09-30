# Digital Headquarters redesign: "Explore the infrastructure I've built"

This document records the audit, the plan, and the decisions behind turning
Digital Headquarters into the presentation layer for
[Homelab-Portfolio](https://github.com/ramonhenriquez/Homelab-Portfolio).
Open gaps in the source material are tracked separately in
[`CONTENT_GAPS.md`](./CONTENT_GAPS.md).

---

## 1. Audit

### Homelab-Portfolio (source of truth)

Audited at commit `ece9177` (all files last changed 2026-06-23). Twelve
Markdown files, no frontmatter, no images.

| File | Depth | What it actually proves |
| --- | --- | --- |
| `README.md` | Overview | Bio, skills list, infrastructure list, project table, Security+ (2026), contact |
| `architecture/Network Overview.md` | Overview | UniFi gateway (routing, firewall, OpenVPN, management), remote VPN clients, internal service list |
| `architecture/Proxmox Cluster Overview.md` | Overview | Two Proxmox hosts (primary / secondary), VM list, LXC list |
| `architecture/Service Map.md` | Overview | Layered service model, endpoint roles (Fedora, Windows, Kali) |
| `projects/active-directory/README.md` | **Walkthrough** | DC01 on Windows Server 2025 / Proxmox VE 9, new forest `homelab.local`, DNS + GC, verification |
| `projects/active-directory/Group Policy_ Security Banner.md` | **Walkthrough + validation** | "Login Banner" GPO, `gpupdate` / `gpresult` validation, logon test |
| `projects/wazuh/README.md` | Overview | Manager on Ubuntu Server, Ubuntu + Windows 11 agents, feature list |
| `projects/wazuh/Wazuh + Suricata Integration.md` | **Walkthrough + validation** | Suricata on the Wazuh server, `eve.json` ingestion via `ossec.conf`, Kali traffic test, failed-auth test (rules 2501 / 5557) with triage and disposition |
| `projects/wazuh/Wazuh Agent Deployment - Fedora Workstation.md` | **Validation** | Remote agent over UniFi OpenVPN, VPN auth + sudo/PAM detection, lessons learned |
| `projects/bookstack/README.md` | Overview | Objectives, content types, four shelves |
| `projects/jellyfin/README.md` | Overview | Jellyfin LXC → NAS → libraries |
| `projects/odysseus-ai/README.md` | Overview | Local LLM platform, objectives, security considerations |

**Strongest evidence:** Wazuh + Suricata (configuration, two recorded tests,
alert triage with a disposition), the Fedora remote-agent validation, and the
two Active Directory walkthroughs. These carry the site.

**Thin areas:** Proxmox, BookStack, Jellyfin and Odysseus are overviews with
no implementation steps, troubleshooting, results, or lessons learned. No
project documents dates. No screenshots exist (one is referenced but missing).

### DigitalHeadquarters (existing site)

Astro 7.0.3, static output, zero client framework, one global stylesheet
(~1,900 lines), GitHub Pages deploy via `withastro/action`, `base:
/DigitalHeadquarters/`. Three pages: home, resume, documentation.

What's good and worth keeping:

- An explicit content-accuracy policy already written into the code comments.
- Clean component boundaries (data in pages, presentation in components).
- `BASE_URL`-aware links throughout; flash-free theme toggle; reduced-motion handling.
- Accurate, detailed resume page.

Problems found:

| Problem | Where | Why it matters |
| --- | --- | --- |
| Fake health bars (95 %, 90 %, 100 %) and "ALL SYSTEMS NOMINAL" | `Hero.astro`, `StatusPanel.astro` | Looks like live telemetry; it isn't |
| "All systems operational" status dot | `Navbar.astro` | Same |
| Odysseus described as Ollama + Open WebUI | `index.astro` (projects, timeline) | Not in Homelab-Portfolio |
| Home-infrastructure hardware (switches, cameras, NVR, UNAS, UPS, 12U rack) | `index.astro` skills | Not in Homelab-Portfolio |
| BookStack topics (OU structure, backup configuration, storage planning…) | `documentation.astro` | Not in Homelab-Portfolio; unverifiable |
| Project cards all link out to GitHub | `index.astro` | Visitors leave the site instead of exploring |
| Footer title "Systems Engineer" | `Footer.astro` | Conflicts with "Systems Technician II" everywhere else |
| No skip link, no page-level `h1` on some layouts | `Layout.astro` | Accessibility |
| Content duplicated by hand from the docs repo | everywhere | Drifts as Homelab-Portfolio grows |

---

## 2. Information architecture

The site is organised around the lab itself. Every page answers one of three
questions: *what did he build*, *how do I know*, and *how do I reach him*.

```
/                         Overview: headline + interactive infrastructure map (the hero),
                          case-study register, one worked detection, timeline excerpt, contact
/infrastructure/          Full explorer: six architecture views, node detail panel,
                          ?view= & ?node= deep links, list mode for mobile / no-JS
/projects/                Case-study register (filter by layer)
/projects/[slug]/         Featured case study or lab system: Objective → Architecture → Implementation →
                          Challenges → Result → Skills → Learned → Full documentation
/skills/                  Skills grouped by domain, ranked by strength of evidence
/skills/[slug]/           One skill: every piece of evidence, where it's documented
/timeline/                Career + homelab + documentation + planned, filterable
/docs/                    Index of every Homelab-Portfolio document + how documentation works
/docs/[...slug]/          The Homelab-Portfolio document itself, rendered at build time
/resume/                  Existing resume (restyled), PDF download
/contact/                 Contact options
/documentation/           Redirect to /docs/ (keeps old links working)
```

**Architecture views** (all drawn from one hand-maintained infrastructure model, so a
node that appears in several views is the same object with the same facts):

| View | What it shows |
| --- | --- |
| Physical | Internet, UDM SE, two Proxmox hosts, NAS, remote clients |
| Network | UniFi gateway roles, OpenVPN remote access, internal services |
| Virtualization | Proxmox hosts, VMs vs. LXC containers |
| Security monitoring | Kali → Suricata → `eve.json` → Wazuh ← agents |
| Identity | DC01 / `homelab.local`, Login Banner GPO, domain-joined systems, planned integrations |
| Self-hosted services | BookStack, Jellyfin → NAS → libraries, Odysseus |

**Honesty model.** Nothing on the site is live. The map says so. Status uses
four labels only (`DEPLOYED`, `ACTIVE PROJECT`, `EXPERIMENTAL`, `PLANNED`),
each also shape-coded so it never relies on colour. Evidence is graded
separately, per claim:

| Evidence level | Meaning |
| --- | --- |
| Validated by test | A test was run and its outcome recorded |
| Step-by-step documented | A reproducible procedure exists |
| Documented in architecture | Described in an architecture/overview document |
| Mentioned only | Listed, no procedure or result yet |

Every fact in a case study, node panel, or skill page carries a reference to
the Homelab-Portfolio file it came from. A build-time check fails the build
if any referenced file disappears.

---

## 3. Visual direction

**Concept: the patch panel.** In a real rack, cable colour encodes function.
The site borrows that convention: each architecture layer has a cable colour
(network blue, security red, identity violet, virtualization amber, services
green, physical grey), and that colour follows the layer everywhere: map
edges, case-study headers, skill groups, timeline items. It's information,
not decoration.

- **Palette.** Deep slate-blue console (`#121a24`) rather than hacker black;
  a cool drafting-sheet light theme. One interface accent (signal blue) for
  links and focus; the cable colours are reserved for layers.
- **Type.** Barlow Semi Condensed for headings (equipment label-plate feel),
  Barlow for body, JetBrains Mono only for real identifiers: hostnames,
  paths, rule IDs, commands. Sentence case; no ALL-CAPS eyebrows above every
  heading; status chips are the one place capitals are used, because the
  labels themselves are specified that way.
- **The one bold element** is the map, drawn on a faint drafting grid. The
  rest of the site is quiet: prose, rules, and tables.
- **Motion.** Only in response to the visitor: edges draw in when a view
  changes, connected edges highlight when a node is hovered/focused, the
  detail panel slides in. No looping "packets": animated traffic would
  imply live telemetry. All motion is removed under `prefers-reduced-motion`.

---

## 4. Reuse of existing components

| Existing | Decision |
| --- | --- |
| `Layout.astro` | **Kept, extended**: skip link, `no-js` class, command palette mount, canonical/OG tags, new fonts |
| `Navbar.astro` | **Kept, extended**: new routes, palette trigger, mobile menu; fake status dot removed |
| `Footer.astro` | **Kept, fixed**: correct title, source-sync commit shown |
| `ThemeToggle.astro` | **Kept as-is** (logic unchanged) |
| `CTA.astro` | **Kept**: used for the contact block |
| `ProjectCard.astro` | **Evolved** into a register row linking to internal case studies |
| `TechStack.astro` | **Replaced** by evidence-backed skills pages (same data-as-props pattern) |
| `LearningJourney.astro` | **Evolved** into `Timeline.astro` with filters and project links |
| `StatusPanel.astro` / `Hero.astro` | **Retired**: the fake-telemetry panel is replaced by the map |
| `resume.astro` | **Kept**: markup preserved, restyled |
| `documentation.astro` | **Replaced** by `/docs/`, a redirect stub keeps the old URL |
| `portfolio.css` | **Split** into token/base/component/page files; resume styles ported |

---

## 5. New components and pages

- `scripts/sync-homelab.mjs`: pulls Homelab-Portfolio at build time into
  `.homelab-source/` and records commit + per-file dates.
- `src/content.config.ts`: `homelabDocs` collection over the synced repo.
- Doc pages use a source document's own `#` heading as the page `h1` and supply one only when a document has none, so every page keeps a single `h1` without modifying the source.
- `src/data/*`: infrastructure model, projects, skills, timeline, site config.
- `src/lib/*`: source helpers, source validation, command-palette index, map geometry.
- `topology/TopologyExplorer.astro`, `TopologyBoard.astro`, `NodeDetail.astro`, `explorer.ts`
- `CommandPalette.astro` + `command-palette.ts` (Ctrl/⌘ K and `/`)
- `ui/StatusBadge.astro`, `ui/EvidenceBadge.astro`, `ui/SourceRefs.astro`, `ui/NotDocumented.astro`
- `projects/CaseStudySection.astro`, `AlertRecord.astro`
- `timeline/Timeline.astro`
- Pages listed in §2, plus `404.astro`.

---

## 6. File structure

```
DigitalHeadquarters/
├── .github/workflows/deploy.yml     # sync → build → deploy; daily + dispatch triggers
├── docs/                            # REDESIGN.md, CONTENT_GAPS.md, SOURCE_FORMAT.md
├── public/                          # favicon, resume.pdf
├── scripts/sync-homelab.mjs
└── src/
    ├── content.config.ts
    ├── data/
    │   ├── site.ts                  # identity, nav, contact
    │   ├── status.ts                # status + evidence taxonomies, layers/cable colours
    │   ├── infrastructure.ts        # nodes + six views
    │   ├── projects.ts              # case studies (every item sourced or marked missing)
    │   ├── skills.ts                # skills + evidence
    │   └── timeline.ts
    ├── lib/
    │   ├── sources.ts               # doc ids, titles, GitHub URLs, sync metadata
    │   ├── validate.ts              # build-time source validation
    │   ├── geometry.ts              # map edge routing
    │   └── search-index.ts          # command palette entries
    ├── components/
    │   ├── layout/   Layout, Navbar, Footer, ThemeToggle, CommandPalette
    │   ├── ui/       StatusBadge, EvidenceBadge, SourceRefs, NotDocumented, CTA
    │   ├── topology/ TopologyExplorer, TopologyBoard, NodeDetail
    │   ├── projects/ ProjectRow, CaseStudySection, AlertRecord
    │   └── timeline/ Timeline
    ├── scripts/      explorer.ts, command-palette.ts (timeline and nav behaviour are inline in their components)
    ├── pages/        index, infrastructure/, projects/, skills/, timeline, docs/, resume, contact, documentation, 404
    └── styles/       tokens, base, components, topology, pages, resume
```

---

## 7. Adding to the site as Homelab-Portfolio grows

1. Write the document in Homelab-Portfolio. It appears under `/docs/` on the
   next build automatically.
2. To feature it: add facts to `src/data/projects.ts` (or a new project),
   referencing the file path. Add nodes/edges to `src/data/infrastructure.ts`
   if it introduces new infrastructure.
3. Add evidence rows in `src/data/skills.ts`.
4. The build fails if a referenced path doesn't exist, so renames in the
   source repo are caught before deploy.

`SOURCE_FORMAT.md` proposes optional frontmatter for Homelab-Portfolio docs
that would let more of this be generated directly.


## 8. Refinement pass (accuracy and production readiness)

The design, IA and interaction model above are unchanged. This pass tightened
what the site claims and how it behaves on small screens.

**Sourcing language.** The site no longer says content is "generated from"
Homelab-Portfolio. Only `/docs/` is automatic (synced at build, pinned to a
commit). Case studies, the map, skills and the timeline are written by hand in
`src/data/` from those documents, each fact citing its file. The footer,
home page, map page, docs index and README say exactly that.

**Two tiers of project.** `tier: 'featured' | 'lab'` in `projects.ts`.
Featured case studies (Wazuh + Suricata, Active Directory) show every section.
Lab systems (Proxmox, BookStack, Jellyfin, Odysseus AI) show what's
documented and group the rest under "Still being documented". `validate.ts`
refuses a featured project whose objective, implementation, validation or
results are empty.

**Section coverage.** Each section carries Documented / Partially documented /
Not yet documented (● ◐ ○), derived by `sectionCoverage()` from the data:
items and no `missing` note → documented; items plus a note → partial; no items →
not yet. A coverage summary sits at the top of every project page and in the
project register. A **Validation** section was added between troubleshooting
and results; the Wazuh alert investigation now sits under "Troubleshooting and
investigation".

**Evidence chain.** Skill pages read skill → project → evidence → document
(site link and pinned GitHub link). Skills whose strongest evidence is an
architecture document say hands-on evidence isn't documented. Skills the HP
README lists with no supporting document are shown separately as "Evidence not
yet documented" (`LISTED_WITHOUT_EVIDENCE` in `skills.ts`).

**Facts corrected** (details in CONTENT_GAPS.md §1): Security+ follows HP's
README wording with no status; self-reported homelab dates removed; the
pfSense/Docker/Pi-hole/Tailscale/Uptime Kuma roadmap removed; AD evidence
downgraded from "validated" to "step-by-step documented" (the docs give
validation procedures, not recorded output); DNS-delegation wording no longer
claims the warning occurred; the physical view no longer draws undocumented
cabling; "documented components" became "mapped components".

**Contact.** `PUBLIC_CONTACT` (site-wide: email, LinkedIn, GitHub) and
`RESUME_CONTACT` (résumé page only, phone optional) in `site.ts`.
Certifications are data (`CERTIFICATIONS`) with an explicit status.

**Mobile explorer.** Below 760px a native `<select>` replaces the tab strip
(always shows the selected view; no clipping at 320px). Wider screens centre the
active tab, with scroll-snap and faded edges as a scroll cue. CSS matches the
script's initial mode so the explorer doesn't shift when JavaScript loads.

**Sync hardening.** In CI a failed clone fails the build (Pages keeps the last
good deploy). Locally a failed clone reuses the previous sync and marks it
`reused`; a local checkout with uncommitted changes is marked `dirty`. The
footer states either condition.
