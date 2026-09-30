/**
 * Content collections.
 *
 * homelabDocs — every Markdown file in Homelab-Portfolio, synced into
 * .homelab-source by scripts/sync-homelab.mjs before dev/build.
 * Frontmatter is optional (see docs/SOURCE_FORMAT.md); plain Markdown works.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { docIdFromPath } from './lib/slug';

const homelabDocs = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './.homelab-source',
    generateId: ({ entry }) => docIdFromPath(entry),
  }),
  schema: z.object({
    title: z.string().optional(),
    summary: z.string().optional(),
    date: z.union([z.string(), z.date()]).optional()
      .transform((d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d)),
    status: z.enum(['deployed', 'active', 'experimental', 'planned']).optional(),
  }),
});

export const collections = { homelabDocs };
