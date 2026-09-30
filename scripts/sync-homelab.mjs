#!/usr/bin/env node
/**
 * sync-homelab.mjs
 * ─────────────────────────────────────────────────────────────────
 * Copies the Markdown in Homelab-Portfolio (the source of truth) into
 * ./.homelab-source so Astro can load it as a content collection.
 *
 * Runs automatically before `npm run dev` and `npm run build`.
 *
 * Environment variables (all optional):
 *   HOMELAB_PORTFOLIO_PATH  Use a local checkout instead of cloning.
 *                           Handy when editing both repos side by side.
 *   HOMELAB_PORTFOLIO_REPO  Git URL to clone (default: the public GitHub repo)
 *   HOMELAB_PORTFOLIO_REF   Branch or tag (default: main)
 *   HOMELAB_OFFLINE=1       Skip fetching; reuse the existing .homelab-source
 *
 * Failure behaviour (so a network problem can't quietly ship wrong content):
 *   - In CI (CI=true, as on GitHub Actions) a failed clone fails the build.
 *     GitHub Pages keeps serving the last successful deploy.
 *   - Locally, a failed clone reuses the previous sync if there is one and
 *     marks it `reused` in _sync.json; the footer then says so.
 *   - A local checkout with uncommitted changes is marked `dirty`, because
 *     the GitHub links (pinned to HEAD) won't match what was rendered.
 *
 * Output:
 *   .homelab-source/**\/*.md   the documents
 *   .homelab-source/_sync.json commit, commit date, per-file last-changed dates
 *
 * Nothing here invents content. Dates come from git history, which
 * records when a document changed, not when the work was done.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, '.homelab-source');
const repo = process.env.HOMELAB_PORTFOLIO_REPO ?? 'https://github.com/ramonhenriquez/Homelab-Portfolio.git';
const ref = process.env.HOMELAB_PORTFOLIO_REF ?? 'main';
const localPath = process.env.HOMELAB_PORTFOLIO_PATH;

const log = (msg) => console.log(`[sync-homelab] ${msg}`);

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function hasExistingSync() {
  return fs.existsSync(path.join(outDir, '_sync.json'));
}

function listMarkdown(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listMarkdown(full, base));
    else if (entry.name.toLowerCase().endsWith('.md')) out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out.sort();
}

function readMeta(srcDir, files) {
  let commit = null;
  let commitDate = null;
  let dirty = false;
  const perFile = {};
  try {
    commit = git(srcDir, 'rev-parse', 'HEAD');
    dirty = git(srcDir, 'status', '--porcelain', '--', '*.md').length > 0;
    if (dirty) log('WARNING: the local checkout has uncommitted Markdown changes; GitHub links will point at HEAD, not at what is rendered.');
    commitDate = git(srcDir, 'log', '-1', '--format=%cs');
    for (const f of files) {
      const line = git(srcDir, 'log', '-1', '--format=%h %cs', '--', f);
      const [hash, date] = line.split(' ');
      perFile[f] = { commit: hash ?? null, date: date ?? null };
    }
  } catch {
    log('Source is not a git checkout; commit metadata unavailable.');
  }
  return { commit, commitDate, dirty, perFile };
}

function copyInto(srcDir) {
  const files = listMarkdown(srcDir);
  if (files.length === 0) throw new Error(`No Markdown files found in ${srcDir}`);
  const meta = readMeta(srcDir, files);

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of files) {
    const dest = path.join(outDir, f);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(srcDir, f), dest);
  }

  const record = {
    repo: localPath ? `local:${srcDir}` : repo.replace(/\.git$/, ''),
    ref,
    commit: meta.commit,
    commitDate: meta.commitDate,
    dirty: meta.dirty,
    reused: null,
    syncedAt: new Date().toISOString(),
    files: meta.perFile,
  };
  fs.writeFileSync(path.join(outDir, '_sync.json'), JSON.stringify(record, null, 2));
  log(`Synced ${files.length} documents${meta.commit ? ` at ${meta.commit.slice(0, 7)} (${meta.commitDate})` : ''}.`);
}

function main() {
  if (process.env.HOMELAB_OFFLINE === '1') {
    if (hasExistingSync()) return log('HOMELAB_OFFLINE=1, reusing existing .homelab-source.');
    throw new Error('HOMELAB_OFFLINE=1 but .homelab-source does not exist yet.');
  }

  if (localPath) {
    const resolved = path.resolve(root, localPath);
    log(`Using local checkout ${resolved}`);
    return copyInto(resolved);
  }

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'homelab-portfolio-'));
  try {
    log(`Cloning ${repo} (${ref})`);
    // Full history is small for a docs repo and gives accurate per-file dates.
    git(root, 'clone', '--quiet', '--branch', ref, repo, tmp);
    copyInto(tmp);
  } catch (err) {
    const reason = err.message.split('\n')[0];
    if (process.env.CI === 'true') {
      throw new Error(`Could not fetch Homelab-Portfolio in CI (${reason}). Failing rather than building from stale or missing docs.`);
    }
    if (hasExistingSync()) {
      log(`WARNING: fetch failed (${reason}). Reusing the previous sync and marking it as reused.`);
      const file = path.join(outDir, '_sync.json');
      const record = JSON.parse(fs.readFileSync(file, 'utf8'));
      record.reused = { at: new Date().toISOString(), reason };
      fs.writeFileSync(file, JSON.stringify(record, null, 2));
      return;
    }
    throw err;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

try {
  main();
} catch (err) {
  console.error(`[sync-homelab] ${err.message}`);
  console.error('[sync-homelab] Set HOMELAB_PORTFOLIO_PATH to a local checkout to build offline.');
  process.exit(1);
}
