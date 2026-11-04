import React, {useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, Easing, interpolate, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {Frame} from './scenes';
import {MECHANISMS} from './data';

/* The agent-infrastructure piece in 3D (three.js via @remotion/three).
   One paper board lying in the scene; nodes are slabs standing ON it, each with a flat
   hard shadow on the board; edges and arrowheads are drawn on the board surface, so every
   arrow meets the node it points at. Flat colour, ink outlines, no gradients or glow.
   Two-way edges (lead <-> coding) carry an arrowhead at BOTH ends.
   The story is timed in "beat frames" (0..670) and played at half speed (SLOW). */

const INK = '#0b0b0b';
const INK2 = '#4f4a40';
const CANVAS = '#f4f1e8';
const BOARD = '#fbf9f2';
const PINK = '#ff6fae';
const SUN = '#ffd42e';
const COBALT = '#2d4bff';
const MINT = '#7bffbf';
const RED = '#ff5a4d';
const FONT = `'Space Grotesk', system-ui, sans-serif`;

const BEAT_FRAMES = 670;
const SLOW = 2;
export const FLOW3D_FRAMES = BEAT_FRAMES * SLOW; // 1340 = 44.7s

const pf = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
const lin = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin)});

/* ---------- layout: 2D design coordinates, mapped onto the board (100px = 1 unit) ---------- */
const CX = 960;
const CY = 680;
const wx = (x: number) => (x - CX) / 100;
const wy = (y: number) => -(y - CY) / 100;

const DEPTH = 0.26; // slab height above the board
const EDGE_Z = 0.05; // edges lie on the board
const GAP = 6; // px between an arrow tip / edge start and the node outline

type NodeDef = {cx: number; cy: number; label: string; fill: string; ink?: string; at: number};
const nw = (label: string) => label.length * 17 + 52;
const NH = 76;

const N: Record<string, NodeDef> = {
  human: {cx: 230, cy: 470, label: 'HUMAN', fill: PINK, at: 0},
  lead: {cx: 560, cy: 470, label: 'LEAD AGENT', fill: CANVAS, at: 14},
  coding: {cx: 930, cy: 470, label: 'CODING AGENT', fill: CANVAS, at: 28},
  pr: {cx: 1300, cy: 470, label: 'PULL REQUEST', fill: CANVAS, at: 345},
  gate: {cx: 1640, cy: 470, label: 'REVIEW GATE', fill: CANVAS, at: 345},
  reviewer: {cx: 1300, cy: 690, label: 'REVIEWER', fill: CANVAS, at: 372},
  approval: {cx: 1640, cy: 690, label: 'APPROVAL', fill: INK, ink: CANVAS, at: 484},
  deploy: {cx: 1640, cy: 880, label: 'DEPLOYMENT', fill: CANVAS, at: 520},
  cron: {cx: 230, cy: 880, label: 'CRON', fill: SUN, at: 562},
  agent: {cx: 560, cy: 880, label: 'AGENT', fill: CANVAS, at: 570},
  alert: {cx: 930, cy: 880, label: 'ALERT', fill: CANVAS, at: 578},
};

/* outline is 5px outside the fill */
const OUT = 5;
const right = (n: NodeDef) => n.cx + nw(n.label) / 2 + OUT + GAP;
const left = (n: NodeDef) => n.cx - nw(n.label) / 2 - OUT - GAP;
const bottom = (n: NodeDef) => n.cy + NH / 2 + OUT + GAP;
const top = (n: NodeDef) => n.cy - NH / 2 - OUT - GAP;

type Pts = [number, number, number, number, number, number, number, number];
/* from -> to; `both` = two-way: an arrowhead at each end */
type Edge = {id: string; pts: Pts; at: number; dash?: boolean; both?: boolean};
const line = (x1: number, y1: number, x2: number, y2: number): Pts => [x1, y1, x1 + (x2 - x1) / 3, y1 + (y2 - y1) / 3, x1 + (2 * (x2 - x1)) / 3, y1 + (2 * (y2 - y1)) / 3, x2, y2];

const E: Edge[] = [
  {id: 'h-l', pts: line(right(N.human), 470, left(N.lead), 470), at: 18},
  {id: 'l-c', pts: line(right(N.lead), 470, left(N.coding), 470), at: 34, both: true},
  {id: 'c-p', pts: line(right(N.coding), 470, left(N.pr), 470), at: 350},
  {id: 'p-g', pts: line(right(N.pr), 470, left(N.gate), 470), at: 350},
  {id: 'p-r', pts: line(1300, bottom(N.pr), 1300, top(N.reviewer)), at: 376},
  {
    id: 'r-c',
    pts: [left(N.reviewer), 690, left(N.reviewer) - 220, 690, 930, bottom(N.coding) + 170, 930, bottom(N.coding)],
    at: 392,
    dash: true,
  },
  {id: 'g-a', pts: line(1640, bottom(N.gate), 1640, top(N.approval)), at: 488},
  {id: 'a-d', pts: line(1640, bottom(N.approval), 1640, top(N.deploy)), at: 524},
  {id: 'k-a', pts: line(right(N.cron), 880, left(N.agent), 880), at: 574},
  {id: 'a-x', pts: line(right(N.agent), 880, left(N.alert), 880), at: 582},
];
const EDGE = Object.fromEntries(E.map((e) => [e.id, e]));

const bez2 = (e: Edge, t: number): [number, number] => {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = e.pts;
  const u = 1 - t;
  return [
    u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
    u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
  ];
};
const on = (e: Edge, t: number, z = EDGE_Z) => {
  const [x, y] = bez2(e, t);
  return new THREE.Vector3(wx(x), wy(y), z);
};

const PACKETS: {edge: string; a: number; b: number; color: string; label?: string; rev?: boolean}[] = [
  {edge: 'h-l', a: 22, b: 46, color: PINK, label: 'brief + context'},
  {edge: 'l-c', a: 50, b: 82, color: PINK, label: 'brief + context'},
  {edge: 'l-c', a: 90, b: 112, color: MINT, label: 'reply, same thread', rev: true},
  {edge: 'l-c', a: 136, b: 160, color: MINT, label: 'verified', rev: true},
  {edge: 'c-p', a: 352, b: 378, color: PINK, label: 'pull request'},
  {edge: 'p-r', a: 380, b: 402, color: SUN, label: 'review'},
  {edge: 'r-c', a: 406, b: 440, color: RED, label: 'findings'},
  {edge: 'c-p', a: 444, b: 468, color: MINT, label: '1 commit'},
  {edge: 'p-g', a: 470, b: 490, color: MINT},
  {edge: 'g-a', a: 496, b: 520, color: SUN, label: 'ready'},
  {edge: 'a-d', a: 548, b: 572, color: MINT, label: 'go'},
  {edge: 'k-a', a: 590, b: 604, color: MINT},
  {edge: 'k-a', a: 616, b: 630, color: MINT},
  {edge: 'k-a', a: 642, b: 656, color: MINT},
  {edge: 'a-x', a: 658, b: 668, color: RED},
];
/* which node a packet lands on */
const LANDS: Record<string, string> = {'h-l': 'lead', 'l-c': 'coding', 'c-p': 'pr', 'p-g': 'gate', 'p-r': 'reviewer', 'r-c': 'coding', 'g-a': 'approval', 'a-d': 'deploy', 'k-a': 'agent', 'a-x': 'alert'};

const BEATS = [
  {a: 0, b: 100, m: 0},
  {a: 100, b: 180, m: 3},
  {a: 180, b: 250, m: 5},
  {a: 250, b: 340, m: 1},
  {a: 340, b: 480, m: 4},
  {a: 480, b: 560, m: -1},
  {a: 560, b: 670, m: 2},
];
const approvalCaption = {
  title: 'Approval',
  say: 'A deployment does not start until a person approves it. The agent waits.',
  prevents: 'a change reaching production without anyone deciding.',
};

/* ---------- canvas textures (text drawn with the bundled font) ---------- */
const K = 220; // texture px per world unit

const roundRect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
};

const makeTex = (w: number, h: number, draw: (c: CanvasRenderingContext2D, W: number, H: number) => void) => {
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(w * K);
  cv.height = Math.ceil(h * K);
  draw(cv.getContext('2d')!, cv.width, cv.height);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  return tex;
};

const measure = (text: string, fs: number, weight: number, ls: number) => {
  const c = document.createElement('canvas').getContext('2d')!;
  c.font = `${weight} ${fs * K}px ${FONT}`;
  (c as any).letterSpacing = `${fs * K * ls}px`;
  return c.measureText(text).width / K;
};

/* a text plane lying on the board (or on a slab top), optionally on an inked pill */
const Tag: React.FC<{
  text: string;
  pos: [number, number, number];
  size?: number;
  color?: string;
  fill?: string;
  border?: boolean;
  weight?: number;
  ls?: number;
  opacity?: number;
  align?: 'center' | 'left' | 'right';
}> = ({text, pos, size = 0.21, color = INK, fill, border = false, weight = 600, ls = 0, opacity = 1, align = 'center'}) => {
  const {tex, w, h} = useMemo(() => {
    const padX = fill ? size * 0.7 : 0.04;
    const w = measure(text, size, weight, ls) + padX * 2 + (border ? 0.06 : 0);
    const h = size * (fill ? 1.9 : 1.5);
    const tex = makeTex(w, h, (c, W, H) => {
      if (fill) {
        roundRect(c, 4, 4, W - 8, H - 8, (H - 8) / 2);
        c.fillStyle = fill;
        c.fill();
        if (border) {
          c.lineWidth = 6;
          c.strokeStyle = INK;
          c.stroke();
        }
      }
      c.font = `${weight} ${size * K}px ${FONT}`;
      (c as any).letterSpacing = `${size * K * ls}px`;
      c.fillStyle = color;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(text, W / 2 + (size * K * ls) / 2, H / 2 + size * K * 0.04);
    });
    return {tex, w, h};
  }, [text, size, color, fill, border, weight, ls]);
  useEffect(() => () => tex.dispose(), [tex]);
  if (opacity <= 0.01) return null;
  const dx = align === 'left' ? w / 2 : align === 'right' ? -w / 2 : 0;
  return (
    <mesh position={[pos[0] + dx, pos[1], pos[2]]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

/* ---------- geometry ---------- */
const roundedShape = (w: number, h: number, r: number) => {
  const x = -w / 2;
  const y = -h / 2;
  const s = new THREE.Shape();
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, 1.5 * Math.PI, false);
  return s;
};
const slab = (w: number, h: number, depth: number, r = h / 2) => new THREE.ExtrudeGeometry(roundedShape(w, h, r), {depth, bevelEnabled: false, curveSegments: 24});
const flat = (w: number, h: number, r = h / 2) => new THREE.ShapeGeometry(roundedShape(w, h, r), 24);

/* the paper board everything sits on */
const BX0 = 90;
const BX1 = 1830;
const BY0 = 372;
const BY1 = 988;
const Board: React.FC = () => {
  const w = (BX1 - BX0) / 100;
  const h = (BY1 - BY0) / 100;
  const geo = useMemo(() => ({top: slab(w, h, 0.16, 0.36), rim: slab(w + 0.08, h + 0.08, 0.15, 0.4), shadow: flat(w + 0.08, h + 0.08, 0.4)}), [w, h]);
  const dots = useMemo(
    () =>
      makeTex(w, h, (c, W, H) => {
        c.fillStyle = 'rgba(11,11,11,0.13)';
        const step = 0.4 * K;
        for (let x = step / 2; x < W; x += step) for (let y = step / 2; y < H; y += step) c.fillRect(x - 3, y - 3, 6, 6);
      }),
    [w, h],
  );
  const c: [number, number] = [wx((BX0 + BX1) / 2), wy((BY0 + BY1) / 2)];
  return (
    <group position={[c[0], c[1], -0.16]}>
      <mesh geometry={geo.shadow} position={[0.14, -0.14, -0.02]}>
        <meshBasicMaterial color={INK} />
      </mesh>
      <mesh geometry={geo.rim}>
        <meshBasicMaterial color={INK} />
      </mesh>
      <mesh geometry={geo.top} position={[0, 0, 0.005]}>
        <meshBasicMaterial color={BOARD} />
      </mesh>
      <mesh position={[0, 0, 0.17]}>
        <planeGeometry args={[w - 0.2, h - 0.2]} />
        <meshBasicMaterial map={dots} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

const Node3: React.FC<{n: NodeDef; f: number; pop?: number}> = ({n, f, pop = 0}) => {
  const p = pf(f, n.at, n.at + 16);
  const w = nw(n.label) / 100;
  const h = NH / 100;
  const o = (OUT * 2) / 100;
  const geo = useMemo(() => ({shadow: flat(w + o, h + o), outline: slab(w + o, h + o, DEPTH - 0.01), fill: slab(w, h, DEPTH)}), [w, h, o]);
  if (p <= 0.001) return null;
  /* drops onto the board; the shadow stays on the board and tightens as it lands */
  const lift = (1 - p) * 1.4 + pop * 0.14;
  const sh = 0.08 + lift * 0.08;
  return (
    <group position={[wx(n.cx), wy(n.cy), 0]}>
      <mesh geometry={geo.shadow} position={[sh, -sh, 0.004]}>
        <meshBasicMaterial color={INK} transparent opacity={Math.min(1, p * 1.5)} />
      </mesh>
      <group position={[0, 0, lift]}>
        <mesh geometry={geo.outline}>
          <meshBasicMaterial color={INK} />
        </mesh>
        <mesh geometry={geo.fill} position={[0, 0, 0.012]}>
          <meshBasicMaterial color={n.fill} />
        </mesh>
        <Tag text={n.label} pos={[0, 0.005, DEPTH + 0.02]} size={0.27} color={n.ink ?? INK} weight={600} ls={0.08} />
      </group>
    </group>
  );
};

/* flat arrowhead lying on the board, tip exactly at `tip`, pointing along `ang` */
const ARROW_L = 0.26;
const ARROW_W = 0.24;
const arrowGeo = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(-ARROW_L, ARROW_W / 2);
  s.lineTo(-ARROW_L * 0.82, 0);
  s.lineTo(-ARROW_L, -ARROW_W / 2);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, {depth: 0.05, bevelEnabled: false});
})();
const Arrow3: React.FC<{tip: THREE.Vector3; ang: number}> = ({tip, ang}) => (
  <mesh geometry={arrowGeo} position={[tip.x, tip.y, EDGE_Z - 0.025]} rotation={[0, 0, ang]}>
    <meshBasicMaterial color={INK} />
  </mesh>
);

/* a stroke on the board between t0..t1 of an edge, as a flat ribbon */
const ribbon = (e: Edge, t0: number, t1: number, width: number, steps: number) => {
  const pos: number[] = [];
  const idx: number[] = [];
  for (let k = 0; k <= steps; k++) {
    const t = t0 + ((t1 - t0) * k) / steps;
    const [x, y] = bez2(e, t);
    const [xa, ya] = bez2(e, Math.max(0, t - 0.002));
    const [xb, yb] = bez2(e, Math.min(1, t + 0.002));
    let dx = xb - xa;
    let dy = -(yb - ya);
    const l = Math.hypot(dx, dy) || 1;
    dx /= l;
    dy /= l;
    const nx = -dy * (width / 2);
    const ny = dx * (width / 2);
    pos.push(wx(x) + nx, wy(y) + ny, EDGE_Z, wx(x) - nx, wy(y) - ny, EDGE_Z);
    if (k > 0) {
      const a = (k - 1) * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
};

/* tangent angle on the board at t (world space, y up) */
const angleAt = (e: Edge, t: number, back = false) => {
  const a = on(e, Math.max(0, Math.min(1, back ? t + 0.02 : t - 0.02)));
  const b = on(e, t);
  return Math.atan2(b.y - a.y, b.x - a.x);
};

/* how far (in t) the stroke must stop short so it ends under the arrowhead's notch */
const tShort = (e: Edge) => {
  const [x0, y0] = bez2(e, 0);
  const [x1, y1] = bez2(e, 1);
  const len = Math.hypot(x1 - x0, y1 - y0) / 100 || 1;
  return Math.min(0.25, (ARROW_L * 0.7) / Math.max(len, 1));
};

const Edge3: React.FC<{e: Edge; f: number}> = ({e, f}) => {
  const p = pf(f, e.at, e.at + 18);
  const q = Math.round(p * 80);
  const s = tShort(e);
  const t0 = e.both ? s : 0;
  const t1 = 1 - s;
  const geos = useMemo(() => {
    if (q <= 0) return [] as THREE.BufferGeometry[];
    const end = t0 + (t1 - t0) * (q / 80);
    if (e.dash) {
      const D = 16;
      const out: THREE.BufferGeometry[] = [];
      for (let i = 0; i < D; i++) {
        const a = t0 + ((t1 - t0) * i) / D;
        const b = Math.min(end, a + (0.55 * (t1 - t0)) / D);
        if (b - a > 0.004) out.push(ribbon(e, a, b, 0.065, 6));
      }
      return out;
    }
    return [ribbon(e, t0, end, 0.075, 48)];
  }, [q, e, t0, t1]);
  if (p <= 0) return null;
  return (
    <group>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshBasicMaterial color={INK} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {p > 0.92 && <Arrow3 tip={on(e, 1)} ang={angleAt(e, 1)} />}
      {/* two-way edge: the arrowhead at the start points back at the node it left */}
      {e.both && p > 0.92 && <Arrow3 tip={on(e, 0)} ang={angleAt(e, 0, true)} />}
    </group>
  );
};

/* on a vertical edge the label sits beside the packet, not over the node it left */
const vertical = (e: Edge) => Math.abs(e.pts[6] - e.pts[0]) < Math.abs(e.pts[7] - e.pts[1]);
const PR = 0.17; // packet radius: rests on the board
const Packet3: React.FC<{p: (typeof PACKETS)[number]; f: number}> = ({p, f}) => {
  if (f < p.a || f > p.b + 8) return null;
  const t = lin(f, p.a, p.b);
  const e = EDGE[p.edge];
  const pos = on(e, p.rev ? 1 - t : t, PR + 0.02);
  /* lands: the packet shrinks into the node instead of fading (no see-through ghosts) */
  const fade = f > p.b ? 1 - (f - p.b) / 8 : 1;
  const sc = Math.max(0.001, fade);
  return (
    <group position={pos} scale={[sc, sc, sc]}>
      <mesh position={[0.06, -0.06, -PR - 0.01]}>
        <circleGeometry args={[PR + 0.03, 32]} />
        <meshBasicMaterial color={INK} />
      </mesh>
      <mesh>
        <sphereGeometry args={[PR, 32, 24]} />
        <meshBasicMaterial color={p.color} />
      </mesh>
      <mesh>
        <sphereGeometry args={[PR + 0.035, 32, 24]} />
        <meshBasicMaterial color={INK} side={THREE.BackSide} />
      </mesh>
      {p.label &&
        (vertical(e) ? (
          <Tag text={p.label} pos={[0.32, 0, 0.45]} size={0.2} fill={CANVAS} border align="left" />
        ) : (
          <Tag text={p.label} pos={[0, 0.5, 0.45]} size={0.2} fill={CANVAS} border />
        ))}
    </group>
  );
};

/* dashed mission outline drawn on the board around the coding agent, with its tickets */
const Mission3: React.FC<{f: number}> = ({f}) => {
  const mission = pf(f, 252, 268);
  const out = 1 - pf(f, 336, 346);
  const done = [284, 304, 324].map((t) => f > t);
  const w = (nw(N.coding.label) + 90) / 100;
  const h = 2.5;
  const tex = useMemo(
    () =>
      makeTex(w, h, (c, W, H) => {
        roundRect(c, 5, 5, W - 10, H - 10, 50);
        c.setLineDash([24, 16]);
        c.lineWidth = 7;
        c.strokeStyle = INK;
        c.stroke();
      }),
    [w, h],
  );
  if (mission <= 0 || out <= 0) return null;
  const o = mission * out;
  const cy = wy(N.coding.cy) - 0.42;
  return (
    <group position={[wx(N.coding.cx), cy, 0.012]}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} transparent opacity={o} depthWrite={false} toneMapped={false} />
      </mesh>
      <Tag text="MISSION · ONE WORKTREE" pos={[0, h / 2, 0.01]} size={0.19} fill={BOARD} weight={600} ls={0.12} opacity={o} />
      {['T-1', 'T-2', 'T-3'].map((t, i) => (
        <Tag key={t + done[i]} text={(done[i] ? '✔ ' : '') + t} pos={[(i - 1) * 0.74, -h / 2 + 0.36, 0.01]} size={0.19} fill={done[i] ? MINT : CANVAS} border opacity={o} />
      ))}
    </group>
  );
};

/* camera: a slow truck left-right while looking at the board's centre */
const CameraRig: React.FC<{f: number}> = ({f}) => {
  const {camera} = useThree();
  const k = (f / BEAT_FRAMES) * Math.PI * 2;
  useLayoutEffect(() => {
    camera.position.set(1.8 * Math.sin(k), 0.25 * Math.cos(k), 26);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, k]);
  return null;
};

const useFontReady = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('fonts for 3d labels'));
  useEffect(() => {
    const done = () => {
      setReady(true);
      continueRender(handle);
    };
    document.fonts.load(`600 40px ${FONT}`).then(() => document.fonts.load(`500 40px ${FONT}`)).then(done, done);
  }, [handle]);
  return ready;
};

export const Flow3DScene: React.FC = () => {
  const f = useCurrentFrame() / SLOW; // beat frames
  const ready = useFontReady();

  const arrivals: Record<string, number> = {};
  PACKETS.forEach((p) => {
    const t = p.rev ? 'lead' : LANDS[p.edge];
    const since = f - p.b;
    if (since >= 0 && since < 12) arrivals[t] = Math.max(arrivals[t] ?? 0, 1 - since / 12);
  });

  const beat = BEATS.find((b) => f >= b.a && f < b.b) ?? BEATS[BEATS.length - 1];
  const cap = beat.m >= 0 ? MECHANISMS[beat.m] : approvalCaption;
  const capIn = pf(f, beat.a, beat.a + 10);
  const label = beat.m >= 0 ? `0${beat.m + 1}` : '→';

  const gateOn = f >= 490;
  const gate: NodeDef = {...N.gate, fill: gateOn ? COBALT : CANVAS, ink: gateOn ? '#fff' : INK};
  const deployOn = f >= 572;
  const deploy: NodeDef = {...N.deploy, fill: deployOn ? MINT : CANVAS};
  const alertOn = f >= 668;
  const alert: NodeDef = {...N.alert, fill: alertOn ? RED : CANVAS};
  const approvalPress = f > 510 && f < 520 ? 0.4 : 0;

  const note = (x: number, y: number, text: string, o: number, align: 'center' | 'left' | 'right' = 'center') =>
    o > 0.01 && text ? <Tag text={text} pos={[wx(x), wy(y), 0.015]} size={0.21} color={INK2} weight={500} opacity={o} align={align} /> : null;

  return (
    <Frame left="agent infrastructure" right="how work moves" footer="six mechanisms in use">
      {ready && (
        <ThreeCanvas
          width={1920}
          height={1080}
          camera={{position: [0, 0, 26], fov: 23, near: 0.1, far: 100}}
          gl={{toneMapping: THREE.NoToneMapping, antialias: true}}
          style={{position: 'absolute', left: 0, top: 0}}
        >
          <CameraRig f={f} />
          {/* the board tilts back like a sheet on a desk */}
          <group position={[0, -1.3, 0]} rotation={[-0.4, 0, 0]} scale={[0.86, 0.86, 0.86]}>
            <Board />
            <Mission3 f={f} />
            {E.map((e) => (
              <Edge3 key={e.id} e={e} f={f} />
            ))}
            <Node3 n={N.human} f={f} pop={arrivals.human} />
            <Node3 n={N.lead} f={f} pop={arrivals.lead} />
            <Node3 n={N.coding} f={f} pop={arrivals.coding} />
            <Node3 n={N.pr} f={f} pop={arrivals.pr} />
            <Node3 n={gate} f={f} pop={arrivals.gate} />
            <Node3 n={N.reviewer} f={f} pop={arrivals.reviewer} />
            <Node3 n={N.approval} f={f} pop={Math.max(arrivals.approval ?? 0, approvalPress)} />
            <Node3 n={deploy} f={f} pop={arrivals.deploy} />
            <Node3 n={N.cron} f={f} />
            <Node3 n={N.agent} f={f} pop={arrivals.agent} />
            <Node3 n={alert} f={f} pop={arrivals.alert} />
            {PACKETS.map((p, i) => (
              <Packet3 key={i} p={p} f={f} />
            ))}

            {note(930, 538, 'own session · own worktree', pf(f, 110, 122) * (1 - pf(f, 244, 252)))}
            {f >= 186 && <Tag text="1 agent · 1 branch" pos={[wx(930), wy(408), 0.12]} size={0.2} fill={SUN} border opacity={pf(f, 186, 198) * (1 - pf(f, 244, 252))} />}
            {note(1620, 548, gateOn ? '✔ gate passes' : '', f >= 470 ? pf(f, 470, 484) : 0, 'right')}
            {note(1620, 768, 'a person decides', f >= 492 ? pf(f, 492, 504) : 0, 'right')}
            {note(1640, 952, deployOn ? '✔ deployed' : 'waits for approval', f >= 520 ? pf(f, 520, 532) : 0)}
            {note(560, 812, f > 632 ? '✔ ✔ ✔  all clear' : f > 610 ? '✔ ✔  all clear' : '✔  all clear', f >= 590 ? pf(f, 590, 600) * (1 - pf(f, 654, 660)) : 0)}
            {note(930, 952, alertOn ? 'speaks only when something is wrong' : 'silent', f >= 578 ? pf(f, 578, 590) : 0)}
          </group>
        </ThreeCanvas>
      )}

      {/* caption */}
      <div style={{position: 'absolute', left: 120, top: 136, width: 1500, opacity: capIn, transform: `translateY(${(1 - capIn) * 14}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <span style={{width: 64, height: 64, borderRadius: 999, border: `3px solid ${INK}`, display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 700, background: [PINK, SUN, COBALT, MINT, PINK, SUN][Math.max(0, beat.m)] ?? PINK, color: beat.m === 2 ? '#fff' : INK}}>
            {label}
          </span>
          <span style={{fontSize: 60, fontWeight: 700, letterSpacing: '-0.035em'}}>{cap.title}</span>
        </div>
        <div style={{fontSize: 27, lineHeight: 1.35, color: INK2, marginTop: 14, maxWidth: 1380}}>{cap.say}</div>
        <div style={{marginTop: 14, display: 'flex', gap: 14, alignItems: 'center', fontSize: 25}}>
          <span style={{border: `2px solid ${INK}`, borderRadius: 999, background: SUN, padding: '2px 16px', fontWeight: 700, letterSpacing: '0.1em', fontSize: 20}}>PREVENTS</span>
          <span>{cap.prevents}</span>
        </div>
      </div>
    </Frame>
  );
};
