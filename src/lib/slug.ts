/**
 * Stable ids for Homelab-Portfolio documents.
 *
 *   "projects/wazuh/Wazuh + Suricata Integration.md" → "projects/wazuh/wazuh-suricata-integration"
 *   "projects/wazuh/README.md"                       → "projects/wazuh"
 *   "README.md"                                      → "overview"
 *
 * Used by the content collection (entry ids), the /docs/ routes, and every
 * source reference in src/data, so all three always agree.
 */
export function slugSegment(segment: string): string {
  return segment
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function docIdFromPath(sourcePath: string): string {
  const parts = sourcePath.replace(/\\/g, '/').replace(/\.md$/i, '').split('/');
  if (parts[parts.length - 1].toLowerCase() === 'readme') parts.pop();
  if (parts.length === 0) return 'overview';
  return parts.map(slugSegment).join('/');
}
