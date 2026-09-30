/**
 * Entries for the command palette. Built once at build time and inlined
 * as JSON; searching happens in the browser with no network requests.
 */
import { NAV } from '../data/site';
import { NODES, viewsForNode } from '../data/infrastructure';
import { PROJECTS } from '../data/projects';
import { SKILLS } from '../data/skills';
import { LAYERS, STATUS } from '../data/status';
import { getDocs } from './sources';

const BASE = import.meta.env.BASE_URL;

export interface PaletteEntry {
  group: 'Pages' | 'Projects' | 'Infrastructure' | 'Architecture views' | 'Skills' | 'Documents' | 'Actions';
  title: string;
  hint?: string;
  href?: string;
  action?: 'theme' | 'copy-email';
  keywords?: string;
}

export async function buildPaletteIndex(): Promise<PaletteEntry[]> {
  const docs = await getDocs();
  return [
    { group: 'Pages', title: 'Home', href: BASE },
    ...NAV.map((n) => ({ group: 'Pages' as const, title: n.label, href: `${BASE}${n.path}` })),
    { group: 'Pages', title: 'Resume', href: `${BASE}resume/`, keywords: 'cv experience' },

    ...PROJECTS.map((p) => ({
      group: 'Projects' as const,
      title: p.title,
      hint: `${p.tier === 'featured' ? 'Case study' : 'Lab system'} · ${STATUS[p.status].label}`,
      href: `${BASE}projects/${p.slug}/`,
      keywords: p.summary,
    })),

    ...LAYERS.map((l) => ({
      group: 'Architecture views' as const,
      title: `${l.label} view`,
      hint: 'Map',
      href: `${BASE}infrastructure/?view=${l.id}`,
      keywords: l.question,
    })),

    ...NODES.map((n) => ({
      group: 'Infrastructure' as const,
      title: n.label,
      hint: n.ident ?? n.kind,
      href: `${BASE}infrastructure/?view=${viewsForNode(n.id)[0] ?? n.layer}&node=${n.id}`,
      keywords: `${n.kind} ${n.ident ?? ''} ${n.summary}`,
    })),

    ...SKILLS.map((s) => ({
      group: 'Skills' as const,
      title: s.name,
      hint: s.domain,
      href: `${BASE}skills/${s.slug}/`,
      keywords: s.summary,
    })),

    ...docs.map((d) => ({
      group: 'Documents' as const,
      title: d.title,
      hint: d.sourcePath,
      href: d.href,
    })),

    { group: 'Actions', title: 'Switch light / dark theme', action: 'theme' },
    { group: 'Actions', title: 'Copy email address', action: 'copy-email' },
    { group: 'Actions', title: 'Download resume (PDF)', href: `${BASE}resume.pdf` },
  ];
}
