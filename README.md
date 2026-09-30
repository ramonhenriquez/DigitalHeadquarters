# Digital Headquarters

Personal site for Ramon Henriquez, Systems Technician II building toward security operations work.

The site is an **infrastructure explorer**: an interactive map of the homelab where every component links to the case study and the technical documentation behind it. Its technical content is sourced from **[Homelab-Portfolio](https://github.com/ramonhenriquez/Homelab-Portfolio)**, which stays the technical source of truth; this repository holds the presentation.

What is automatic and what isn't:

- **Automatic:** every Markdown document in Homelab-Portfolio is synced at build time, pinned to the commit it came from, and rendered under `/docs/` with a link to the same file on GitHub.
- **Written by hand, from those documents:** the case studies (`src/data/projects.ts`), the infrastructure map (`src/data/infrastructure.ts`), skills and evidence (`src/data/skills.ts`) and the timeline (`src/data/timeline.ts`). Every fact in them cites a Homelab-Portfolio file, and the build fails if a cited file no longer exists. When Homelab-Portfolio gains new material, these files need updating to reflect it.

Live: https://ramonhenriquez.github.io/DigitalHeadquarters/

## Content rules

- Nothing is invented. Every fact about the lab cites a file in Homelab-Portfolio.
- If the documentation doesn't cover something, the page says **Not yet documented** instead of filling the gap. Open gaps are tracked in [`docs/CONTENT_GAPS.md`](docs/CONTENT_GAPS.md).
- Nothing on the site is live monitoring. Status labels describe documented state: **DEPLOYED**, **ACTIVE PROJECT**, **EXPERIMENTAL**, **PLANNED**.
- Skills are rated by their strongest evidence: validated by test → step-by-step documented → documented in architecture → mentioned only.

## Projects: featured case studies and lab systems

Each project in `src/data/projects.ts` has a `tier`:

- `featured` — the source docs cover objective, implementation, validation and results. The build enforces this.
- `lab` — documented and running, but not deep enough for a full case study yet. Empty sections are grouped under "Still being documented" rather than padded.

Every section is labelled Documented, Partially documented or Not yet documented. The label is derived from the data (items present, and whether a `missing` note is set), never typed in.

## Contact details and certifications

`src/data/site.ts` holds `PUBLIC_CONTACT` (used everywhere: email, LinkedIn, GitHub), `RESUME_CONTACT` (used only on `/resume/`; set `phone: null` to hide the number) and `CERTIFICATIONS` (with an explicit status). `public/resume.pdf` is a separate file with its own contact line.

## Running it

```bash
npm ci
npm run dev        # syncs Homelab-Portfolio, then starts the dev server
npm run build      # syncs, then builds to dist/
npm run preview
npm run check      # type-check Astro and TypeScript
```

`npm run sync` clones Homelab-Portfolio into `.homelab-source/` (git-ignored) and records the commit and each file's last-changed date. Options:

| Variable | Effect |
|---|---|
| `HOMELAB_PORTFOLIO_PATH=../Homelab-Portfolio` | Use a local checkout instead of cloning (handy while writing docs) |
| `HOMELAB_PORTFOLIO_REPO=<git url>` | Clone a different repository |
| `HOMELAB_PORTFOLIO_REF=<branch or tag>` | Build from a branch or tag other than `main` |
| `HOMELAB_OFFLINE=1` | Skip fetching and reuse the last sync |

The build fails if any page cites a Homelab-Portfolio file that no longer exists, so a renamed document can't silently break links.

If the clone fails:

- **In CI** (`CI=true`, as on GitHub Actions) the build fails. GitHub Pages keeps serving the last successful deploy, so a GitHub outage can't publish stale or empty content.
- **Locally** the previous sync is reused, marked `reused` in `.homelab-source/_sync.json`, and the footer says the build is offline.

A local checkout (`HOMELAB_PORTFOLIO_PATH`) with uncommitted Markdown changes is marked `dirty`, and the footer says so, because the GitHub links (pinned to the checkout's HEAD) won't match what was rendered.

## Deployment

GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) builds and deploys to GitHub Pages on push to `main`, on manual dispatch, and daily at 06:00 UTC, so new Homelab-Portfolio documents appear within a day without touching this repo.

### Rebuild when Homelab-Portfolio changes (optional, instant)

Add this workflow to **Homelab-Portfolio** as `.github/workflows/notify-site.yml`, and a repository secret `SITE_DISPATCH_TOKEN` holding a fine-grained token with *Contents: read and write* on DigitalHeadquarters:

```yaml
name: Rebuild portfolio site
on:
  push:
    branches: [main]
jobs:
  dispatch:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -sf -X POST \
            -H "Authorization: Bearer ${{ secrets.SITE_DISPATCH_TOKEN }}" \
            -H "Accept: application/vnd.github+json" \
            https://api.github.com/repos/ramonhenriquez/DigitalHeadquarters/dispatches \
            -d '{"event_type":"homelab-updated"}'
```

## Structure

```
scripts/sync-homelab.mjs        Pulls Homelab-Portfolio in at build time
src/content.config.ts           "homelabDocs" collection over .homelab-source/
src/data/                       The sourced data model (edit these to change content)
  site.ts                       Name, title, contact links, navigation
  status.ts                     Layers (cable colours), status and evidence vocabularies
  source-paths.ts               Short names for Homelab-Portfolio files
  infrastructure.ts             Components, facts, gaps, and the six architecture views
  projects.ts                   Case studies, section by section, each item cited
  skills.ts                     Skills and the evidence behind each
  timeline.ts                   Milestones, with where each date comes from
src/lib/                        Sources/links, validation, map geometry, search index
src/components/
  layout/                       Layout, Navbar, Footer, ThemeToggle, CommandPalette
  topology/                     TopologyExplorer, TopologyBoard (SVG), NodeDetail
  projects/                     ProjectRow, CaseStudySection, AlertRecord
  timeline/                     Timeline
  ui/                           StatusBadge, EvidenceBadge, SourceRefs, NotDocumented, CTA
src/scripts/                    Explorer and command-palette behaviour
src/styles/                     tokens → base → components → topology → pages
src/pages/                      Routes (see below)
docs/                           REDESIGN.md, CONTENT_GAPS.md, SOURCE_FORMAT.md
```

Routes: `/`, `/infrastructure/` (supports `?view=` and `?node=`), `/projects/`, `/projects/<slug>/`, `/skills/`, `/skills/<slug>/`, `/timeline/`, `/docs/`, `/docs/<path>/`, `/resume/`, `/contact/`. `/documentation/` redirects to `/docs/`.

## Adding things

- **A new document in Homelab-Portfolio** appears under `/docs/` on the next build with no changes here. Optional frontmatter (title, summary, date, status) is described in [`docs/SOURCE_FORMAT.md`](docs/SOURCE_FORMAT.md).
- **A new project**: add the file to `src/data/source-paths.ts`, an entry to `src/data/projects.ts` with `tier: 'lab'` (cite every item; use `missing` for gaps), and map its folder in `FOLDER_TO_PROJECT` in `src/lib/sources.ts`. Promote it to `featured` once its docs cover the core sections.
- **A roadmap of what to document next** is in [`docs/CONTENT_GAPS.md`](docs/CONTENT_GAPS.md).
- **A new component on the map**: add it to `NODES` and place it in one or more `VIEWS` in `src/data/infrastructure.ts`.
- **A new skill**: add it to `src/data/skills.ts` with at least one evidence row.

More detail, including the design rationale, is in [`docs/REDESIGN.md`](docs/REDESIGN.md).

## Accessibility

Keyboard-operable explorer (tabs pattern, Enter to open a component, Escape to close), a list view that's the default on small screens and the fallback without JavaScript, a skip link, visible focus, reduced-motion support, and status shown by shape and text as well as colour. Checked with axe-core in both themes; the one remaining finding is a heading-level skip inside a Homelab-Portfolio document (see CONTENT_GAPS.md §3).
