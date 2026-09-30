/**
 * Build-time integrity checks. Any failure stops the build, so the site
 * can never ship a reference to a document or node that doesn't exist.
 */
import { SRC } from '../data/source-paths';
import { NODES, VIEWS, nodeById } from '../data/infrastructure';
import { PROJECTS, projectBySlug } from '../data/projects';
import { SKILLS, LISTED_WITHOUT_EVIDENCE, skillBySlug } from '../data/skills';
import { CERTIFICATIONS } from '../data/site';
import { MILESTONES } from '../data/timeline';
import { getDocs } from './sources';

let result: Promise<void> | null = null;

export function validateSources(): Promise<void> {
  result ??= run();
  return result;
}

async function run() {
  const errors: string[] = [];
  const docs = await getDocs();
  const available = new Set(docs.map((d) => d.sourcePath));
  const check = (p: string, where: string) => {
    if (!available.has(p)) errors.push(`${where}: source "${p}" not found in Homelab-Portfolio`);
  };

  Object.values(SRC).forEach((p) => check(p, 'source-paths.ts'));

  for (const n of NODES) {
    n.facts.forEach((f) => check(f.source, `node ${n.id}`));
    n.projects?.forEach((p) => projectBySlug[p] || errors.push(`node ${n.id}: unknown project "${p}"`));
  }

  for (const v of VIEWS) {
    const ids = new Set([...v.nodes.map((n) => n.id), ...(v.groups ?? []).map((g) => g.id)]);
    v.nodes.forEach((n) => nodeById[n.id] || errors.push(`view ${v.id}: unknown node "${n.id}"`));
    v.edges.forEach((e) => {
      if (!ids.has(e.from)) errors.push(`view ${v.id}: edge from unknown "${e.from}"`);
      if (!ids.has(e.to)) errors.push(`view ${v.id}: edge to unknown "${e.to}"`);
    });
  }

  for (const p of PROJECTS) {
    const sections = [p.objective, p.architecture, p.implementation, p.challenges, p.validation, p.result, p.learned];
    sections.forEach((s) => s.items.forEach((i) => check(i.source, `project ${p.slug}`)));
    p.docs.forEach((d) => check(d, `project ${p.slug} docs`));
    p.skills.forEach((s) => skillBySlug[s] || errors.push(`project ${p.slug}: unknown skill "${s}"`));
    const view = VIEWS.find((v) => v.id === p.view);
    p.focus.forEach((f) => view?.nodes.some((n) => n.id === f) || errors.push(`project ${p.slug}: focus node "${f}" not in view ${p.view}`));
  }

  for (const s of SKILLS) {
    s.evidence.forEach((e) => {
      check(e.source, `skill ${s.slug}`);
      if (e.project && !projectBySlug[e.project]) errors.push(`skill ${s.slug}: unknown project "${e.project}"`);
    });
  }

  LISTED_WITHOUT_EVIDENCE.forEach((u) => check(u.source, `unevidenced skill ${u.name}`));
  CERTIFICATIONS.forEach((c) => check(c.source, `certification ${c.name}`));
  // A project page only counts as a featured case study if its docs cover the
  // core of one. Stops a thin project being promoted by editing `tier` alone.
  for (const p of PROJECTS.filter((x) => x.tier === 'featured')) {
    const need = { objective: p.objective, implementation: p.implementation, validation: p.validation, result: p.result };
    Object.entries(need).forEach(([k, sec]) => sec.items.length || errors.push(`project ${p.slug}: featured, but "${k}" has no documented items`));
  }

  MILESTONES.forEach((m) => m.project && !projectBySlug[m.project] && errors.push(`timeline "${m.title}": unknown project "${m.project}"`));

  if (errors.length) {
    throw new Error(`Content validation failed:\n  - ${errors.join('\n  - ')}`);
  }
}
