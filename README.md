# Digital Headquarters

Personal professional website for Ramon Henriquez — Systems Technician II, Homelab Engineer, and aspiring SOC Analyst.

This is not a generic portfolio template. It exists to document real infrastructure work, showcase homelab projects, and build a public record of continuous learning in IT and cybersecurity.

---

## Why This Exists

Most IT professionals have a resume. This site exists to show *how I think and work* — not just where I've worked.

A hiring manager visiting this site should be able to understand:

- What I build and why
- How I document my work
- What I am currently learning
- Why hands-on lab experience translates to real-world value on an IT or security team

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Astro](https://astro.build/) — static site generator |
| Hosting | [GitHub Pages](https://pages.github.com/) |
| Styling | Custom CSS — no frameworks |
| Fonts | Inter + JetBrains Mono (Google Fonts) |
| Language | HTML, CSS, Astro components |

No JavaScript frameworks. No unnecessary dependencies. Fast, static, and maintainable.

---

## Pages

| Page | Status | Description |
|---|---|---|
| Home | ✅ Live | Infrastructure overview, projects, tech stack, learning journey |
| Resume | ✅ Live | Online resume with PDF download |
| Documentation | ✅ Live | Documentation philosophy and areas |
| Infrastructure | 🔲 Planned | Detailed homelab architecture and service overview |
| Projects | 🔲 Planned | Individual project pages with write-ups |
| Contact | 🔲 Planned | Contact information and availability |

---

## Running Locally

**Requirements:** Node.js 18 or higher, npm

```bash
# Clone the repository
git clone https://github.com/ramonhenriquez/DigitalHeadquarters.git
cd DigitalHeadquarters

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

Other commands:

```bash
npm run build    # Build for production (outputs to ./dist)
npm run preview  # Preview the production build locally
```

---

## Deployment

This site deploys automatically to GitHub Pages on every push to `main`.

**How it works:**

1. Push to `main`
2. GitHub Actions runs `astro build`
3. Built files are deployed to GitHub Pages
4. Site is live at the configured GitHub Pages URL

**Key configuration files:**

- `astro.config.mjs` — sets `site` and `base` for GitHub Pages subdirectory deployment
- `public/` — static assets served as-is (resume PDF, images)
- `.github/workflows/` — GitHub Actions deploy workflow

If deploying to a custom domain, update `site` in `astro.config.mjs` and add a `CNAME` file to `public/`.

---

## Project Structure

```
src/
├── components/       # Reusable Astro components
│   ├── Layout.astro       # HTML shell — wraps every page
│   ├── Navbar.astro       # Sticky top navigation
│   ├── Footer.astro       # Site footer
│   ├── Hero.astro         # Homepage hero + status panel
│   ├── StatusPanel.astro  # Infrastructure status HUD
│   ├── ProjectCard.astro  # Project card component
│   ├── TechStack.astro    # Skills grid
│   ├── LearningJourney.astro  # Timeline component
│   └── CTA.astro          # Call-to-action block
├── pages/            # One file = one page/route
│   ├── index.astro        # Homepage
│   ├── resume.astro       # Online resume
│   └── documentation.astro  # Documentation showcase
└── styles/
    └── portfolio.css      # Complete design system
public/
    └── resume.pdf         # Downloadable resume PDF
```

---

## Content Standards

This site follows strict accuracy standards:

- Only technologies actually in use are listed as skills
- No fabricated metrics or statistics
- Roadmap items are labeled "Planned" — not presented as completed
- Every claim must be something I can explain confidently in an interview

---

## Project Status

**Active** — updated as projects are completed and documented.

Current priorities:
- Completing CompTIA Security+ certification
- Expanding Wazuh + Suricata documentation
- Building the Infrastructure and Projects pages

---

## Roadmap

**Pages to build:**
- Infrastructure — homelab architecture and service overview
- Projects — individual write-ups for each project
- Contact — professional contact information

**Technologies to document when deployed:**
- pfSense
- Docker
- Pi-hole
- Tailscale
- Uptime Kuma

---

*Built and maintained by [Ramon Henriquez](https://github.com/ramonhenriquez)*
