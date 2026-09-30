/**
 * Helpers for Homelab-Portfolio documents: titles, links, sync metadata.
 */
import fs from 'node:fs';
import path from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { docIdFromPath } from './slug';
import { SITE } from '../data/site';

const BASE = import.meta.env.BASE_URL;

export interface SyncInfo {
  repo: string;
  ref: string;
  commit: string | null;
  commitDate: string | null;
  /** Local checkout had uncommitted Markdown changes when synced */
  dirty?: boolean;
  /** Set when a fetch failed locally and the previous sync was reused */
  reused?: { at: string; reason: string } | null;
  syncedAt: string;
  files: Record<string, { commit: string | null; date: string | null }>;
}

let syncCache: SyncInfo | null = null;
export function syncInfo(): SyncInfo {
  if (!syncCache) {
    const p = path.join(process.cwd(), '.homelab-source', '_sync.json');
    syncCache = JSON.parse(fs.readFileSync(p, 'utf8')) as SyncInfo;
  }
  return syncCache;
}

export const shortCommit = () => syncInfo().commit?.slice(0, 7) ?? null;

/** Link to the file on GitHub, pinned to the synced commit when known. */
export function githubUrl(sourcePath: string): string {
  const info = syncInfo();
  const ref = info.commit ?? info.ref;
  return `${SITE.sourceRepo}/blob/${ref}/${sourcePath.split('/').map(encodeURIComponent).join('/')}`;
}

export const docHref = (sourcePath: string) => `${BASE}docs/${docIdFromPath(sourcePath)}/`;

export const lastChanged = (sourcePath: string) => syncInfo().files[sourcePath]?.date ?? null;

export function sourcePathOf(entry: CollectionEntry<'homelabDocs'>): string {
  return (entry.filePath ?? '').replace(/\\/g, '/').replace(/^\.?\/?\.homelab-source\//, '');
}

/** The document's title heading: an H1 only if it is the first heading in the file. */
export function leadingH1(body: string | undefined): string | null {
  const first = body?.match(/^(#{1,6})\s+(.+)$/m);
  return first && first[1] === '#' ? first[2].trim() : null;
}

export function titleOf(entry: CollectionEntry<'homelabDocs'>): string {
  if (entry.data.title) return entry.data.title;
  const h1 = leadingH1(entry.body);
  if (h1) return h1;
  const file = sourcePathOf(entry).split('/').pop() ?? entry.id;
  return file.replace(/\.md$/i, '').replace(/_/g, ':').trim();
}

/** Project folders in Homelab-Portfolio → case-study slugs on this site. */
export const FOLDER_TO_PROJECT: Record<string, string> = {
  'wazuh': 'wazuh-suricata',
  'active-directory': 'active-directory',
  'bookstack': 'bookstack',
  'jellyfin': 'jellyfin',
  'odysseus-ai': 'odysseus-ai',
};

export interface DocInfo {
  id: string;
  entry: CollectionEntry<'homelabDocs'>;
  title: string;
  sourcePath: string;
  group: 'Overview' | 'Architecture' | 'Projects';
  folder: string | null;
  project: string | null;
  updated: string | null;
  href: string;
  github: string;
}

let docsCache: Promise<DocInfo[]> | null = null;
export function getDocs(): Promise<DocInfo[]> {
  docsCache ??= getCollection('homelabDocs').then((entries) =>
    entries
      .map((entry) => {
        const sourcePath = sourcePathOf(entry);
        const parts = sourcePath.split('/');
        const group: DocInfo['group'] =
          parts[0] === 'architecture' ? 'Architecture' : parts[0] === 'projects' ? 'Projects' : 'Overview';
        const folder = group === 'Projects' ? parts[1] : null;
        return {
          id: entry.id,
          entry,
          title: titleOf(entry),
          sourcePath,
          group,
          folder,
          project: folder ? FOLDER_TO_PROJECT[folder] ?? null : null,
          updated: entry.data.date ?? lastChanged(sourcePath),
          href: docHref(sourcePath),
          github: githubUrl(sourcePath),
        };
      })
      .sort((a, b) => a.sourcePath.localeCompare(b.sourcePath)),
  );
  return docsCache;
}

export async function docTitleMap(): Promise<Record<string, string>> {
  const docs = await getDocs();
  return Object.fromEntries(docs.map((d) => [d.sourcePath, d.title]));
}
