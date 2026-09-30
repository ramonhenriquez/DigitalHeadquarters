/**
 * Shared vocabularies: layers (cable colours), deployment status, evidence level.
 *
 * Nothing on this site is live telemetry. Status says what state the work
 * is in according to the documentation — never whether something is up
 * right now. Each status has a shape as well as a colour so it never
 * depends on colour alone.
 */

export type LayerId = 'physical' | 'network' | 'virtualization' | 'security' | 'identity' | 'services';

export interface Layer {
  id: LayerId;
  label: string;
  /** Short description of what the architecture view shows */
  question: string;
}

/** Order here is the order of the architecture view tabs. */
export const LAYERS: Layer[] = [
  { id: 'physical',       label: 'Physical',            question: 'What hardware is documented, and how it connects.' },
  { id: 'network',        label: 'Network',             question: 'How traffic gets in, how remote devices reach the lab, what sits inside.' },
  { id: 'virtualization', label: 'Virtualization',      question: 'What runs on Proxmox, as virtual machines or LXC containers.' },
  { id: 'security',       label: 'Security monitoring', question: 'How events travel from endpoints and network traffic into Wazuh.' },
  { id: 'identity',       label: 'Identity',            question: 'The homelab.local domain and the policy it enforces.' },
  { id: 'services',       label: 'Self-hosted services',question: 'The applications the lab provides and what they depend on.' },
];

export const layerById = Object.fromEntries(LAYERS.map((l) => [l.id, l])) as Record<LayerId, Layer>;

export type StatusId = 'deployed' | 'active' | 'experimental' | 'planned';

export const STATUS: Record<StatusId, { label: string; glyph: string; description: string }> = {
  deployed:     { label: 'DEPLOYED',       glyph: '●', description: 'Built and in use, per the documentation.' },
  active:       { label: 'ACTIVE PROJECT', glyph: '◆', description: 'Deployed and still being extended.' },
  experimental: { label: 'EXPERIMENTAL',   glyph: '▲', description: 'Early-stage; exploring rather than relying on it.' },
  planned:      { label: 'PLANNED',        glyph: '○', description: 'Named as an objective; not built yet.' },
};

export type EvidenceLevel = 'validated' | 'walkthrough' | 'architecture' | 'mentioned';

/** Ordered strongest → weakest. */
export const EVIDENCE: Record<EvidenceLevel, { label: string; rank: number; description: string }> = {
  validated:    { label: 'Validated by test',          rank: 4, description: 'A test was run and its outcome recorded.' },
  walkthrough:  { label: 'Step-by-step documented',    rank: 3, description: 'A reproducible procedure is written up.' },
  architecture: { label: 'Documented in architecture', rank: 2, description: 'Described in an architecture or overview document.' },
  mentioned:    { label: 'Mentioned only',             rank: 1, description: 'Listed, with no procedure or result yet.' },
};

export const strongest = (levels: EvidenceLevel[]): EvidenceLevel =>
  levels.reduce((best, l) => (EVIDENCE[l].rank > EVIDENCE[best].rank ? l : best), 'mentioned' as EvidenceLevel);
