/**
 * Orthogonal edge routing for the infrastructure map.
 * Paths are computed at build time; the browser only receives SVG.
 */
import { NODE_H, NODE_W, type Edge, type View } from '../data/infrastructure';

export interface Box { x: number; y: number; w: number; h: number }
type Pt = [number, number];

export function boxesFor(view: View): Record<string, Box> {
  const boxes: Record<string, Box> = {};
  view.nodes.forEach((n) => (boxes[n.id] = { x: n.x, y: n.y, w: n.w ?? NODE_W, h: NODE_H }));
  view.groups?.forEach((g) => (boxes[g.id] = { x: g.x, y: g.y, w: g.w, h: g.h }));
  return boxes;
}

const cx = (b: Box) => b.x + b.w / 2;
const cy = (b: Box) => b.y + b.h / 2;

function points(a: Box, b: Box, route?: Edge['route']): Pt[] {
  const r = route ?? (Math.abs(cy(a) - cy(b)) >= NODE_H ? 'v' : 'h');

  if (r === 'v') {
    const down = cy(b) > cy(a);
    const sy = down ? a.y + a.h : a.y;
    const ty = down ? b.y : b.y + b.h;
    const my = (sy + ty) / 2;
    return [[cx(a), sy], [cx(a), my], [cx(b), my], [cx(b), ty]];
  }
  if (r === 'h') {
    const right = cx(b) > cx(a);
    const sx = right ? a.x + a.w : a.x;
    const tx = right ? b.x : b.x + b.w;
    const mx = (sx + tx) / 2;
    return [[sx, cy(a)], [mx, cy(a)], [mx, cy(b)], [tx, cy(b)]];
  }
  if (r === 'hv') {
    const right = cx(b) > cx(a);
    const sx = right ? a.x + a.w : a.x;
    const ty = cy(b) > cy(a) ? b.y : b.y + b.h;
    return [[sx, cy(a)], [cx(b), cy(a)], [cx(b), ty]];
  }
  // vh
  const down = cy(b) > cy(a);
  const sy = down ? a.y + a.h : a.y;
  const tx = cx(b) > cx(a) ? b.x : b.x + b.w;
  return [[cx(a), sy], [cx(a), cy(b)], [tx, cy(b)]];
}

/** Drop zero-length segments so straight edges stay straight. */
function clean(pts: Pt[]): Pt[] {
  const out: Pt[] = [pts[0]];
  for (const p of pts.slice(1)) {
    const last = out[out.length - 1];
    if (Math.abs(p[0] - last[0]) > 0.5 || Math.abs(p[1] - last[1]) > 0.5) out.push(p);
  }
  // Drop points in the middle of a straight run so labels centre on the whole run
  for (let i = out.length - 2; i > 0; i--) {
    const [a, b, c] = [out[i - 1], out[i], out[i + 1]];
    const sameX = Math.abs(a[0] - b[0]) < 0.5 && Math.abs(b[0] - c[0]) < 0.5;
    const sameY = Math.abs(a[1] - b[1]) < 0.5 && Math.abs(b[1] - c[1]) < 0.5;
    if (sameX || sameY) out.splice(i, 1);
  }
  return out;
}

function roundedPath(pts: Pt[], radius = 10): string {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    const [nx, ny] = pts[i + 1];
    const inLen = Math.hypot(x - px, y - py);
    const outLen = Math.hypot(nx - x, ny - y);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    const ax = x - ((x - px) / inLen) * r;
    const ay = y - ((y - py) / inLen) * r;
    const bx = x + ((nx - x) / outLen) * r;
    const by = y + ((ny - y) / outLen) * r;
    d += ` L${ax},${ay} Q${x},${y} ${bx},${by}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L${last[0]},${last[1]}`;
}

export interface RoutedEdge {
  d: string;
  label?: { x: number; y: number; text: string };
  length: number;
}

export function routeEdge(edge: Edge, boxes: Record<string, Box>): RoutedEdge {
  const pts = clean(points(boxes[edge.from], boxes[edge.to], edge.route));
  const segs = pts.slice(1).map((p, i) => ({ a: pts[i], b: p, len: Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]) }));
  const length = segs.reduce((s, x) => s + x.len, 0);

  let label: RoutedEdge['label'];
  if (edge.label) {
    const seg =
      edge.labelAt === 'start' ? segs[0]
      : edge.labelAt === 'end' ? segs[segs.length - 1]
      : segs.reduce((best, s) => (s.len > best.len ? s : best), segs[0]);
    label = { x: (seg.a[0] + seg.b[0]) / 2, y: (seg.a[1] + seg.b[1]) / 2, text: edge.label };
  }
  return { d: roundedPath(pts), label, length: Math.round(length) };
}
