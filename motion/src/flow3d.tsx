import React, {useEffect, useMemo, useState} from 'react';
import {continueRender, delayRender, Easing, interpolate, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {Frame} from './scenes';
import {MECHANISMS} from './data';

/* The agent-infrastructure piece in 3D (three.js via @remotion/three).
   Same story, same timing as flow.tsx. Flat colours and hard offset shadows keep
   the page's look: ink-outlined slabs, no gradients, no glow.
   Two-way edges (lead <-> coding) carry an arrowhead at BOTH ends. */

const INK = '#0b0b0b';
const INK2 = '#4f4a40';
const CANVAS = '#f4f1e8';
const PINK = '#ff6fae';
const SUN = '#ffd42e';
const COBALT = '#2d4bff';
const MINT = '#7bffbf';
const RED = '#ff5a4d';
const FONT = `'Space Grotesk', system-ui, sans-serif`;

export const FLOW3D_FRAMES = 670;

const pf = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
const lin = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/* ---------- layout: the 2D coordinates, mapped to world units (100px = 1) ---------- */
const CX = 960;
const CY = 675;
const wx = (x: number) => (x - CX) / 100;
const wy = (y: number) => -(y - CY) / 100;

type NodeDef = {cx: number; cy: number; z: number; label: string; fill: string; ink?: string; at: number; sub?: string; subAt?: number; subEnd?: number};
const nw = (label: string) => label.length * 17 + 52;
const NH = 76;
const DEPTH = 0.28;

const N: Record<string, NodeDef> = {
  human: {cx: 230, cy: 470, z: 0.4, label: 'HUMAN', fill: PINK, at: 0},
  lead: {cx: 560, cy: 470, z: 0.4, label: 'LEAD AGENT', fill: CANVAS, at: 14},
  coding: {cx: 930, cy: 470, z: 0.4, label: 'CODING AGENT', fill: CANVAS, at: 28, sub: 'own session · own worktree', subAt: 110, subEnd: 330},
  pr: {cx: 1300, cy: 470, z: 0.4, label: 'PULL REQUEST', fill: CANVAS, at: 345},
  gate: {cx: 1640, cy: 470, z: 0.4, label: 'REVIEW GATE', fill: CANVAS, at: 345},
  reviewer: {cx: 1300, cy: 690, z: 0, label: 'REVIEWER', fill: CANVAS, at: 372},
  approval: {cx: 1640, cy: 690, z: 0, label: 'APPROVAL', fill: INK, ink: CANVAS, at: 484, sub: 'a person decides', subAt: 492},
  deploy: {cx: 1640, cy: 880, z: -0.4, label: 'DEPLOYMENT', fill: CANVAS, at: 520},
  cron: {cx: 230, cy: 880, z: -0.4, label: 'CRON', fill: SUN, at: 562},
  agent: {cx: 560, cy: 880, z: -0.4, label: 'AGENT', fill: CANVAS, at: 570},
  alert: {cx: 930, cy: 880, z: -0.4, label: 'ALERT', fill: CANVAS, at: 578},
};

const right = (n: NodeDef) => n.cx + nw(n.label) / 2 + 8;
const left = (n: NodeDef) => n.cx - nw(n.label) / 2 - 14;
const bottom = (n: NodeDef) => n.cy + NH / 2 + 8;
const top = (n: NodeDef) => n.cy - NH / 2 - 14;

type Pts = [number, number, number, number, number, number, number, number];
/* from -> to; `both` = two-way: an arrowhead at each end */
type Edge = {id: string; from: string; to: string; pts: Pts; at: number; dash?: boolean; both?: boolean};
const line = (x1: number, y1: number, x2: number, y2: number): Pts => [x1, y1, x1 + (x2 - x1) / 3, y1 + (y2 - y1) / 3, x1 + (2 * (x2 - x1)) / 3, y1 + (2 * (y2 - y1)) / 3, x2, y2];

const E: Edge[] = [
  {id: 'h-l', from: 'human', to: 'lead', pts: line(right(N.human), 470, left(N.lead), 470), at: 18},
  {id: 'l-c', from: 'lead', to: 'coding', pts: line(right(N.lead), 470, left(N.coding), 470), at: 34, both: true},
  {id: 'c-p', from: 'coding', to: 'pr', pts: line(right(N.coding), 470, left(N.pr), 470), at: 350},
  {id: 'p-g', from: 'pr', to: 'gate', pts: line(right(N.pr), 470, left(N.gate), 470), at: 350},
  {id: 'p-r', from: 'pr', to: 'reviewer', pts: line(1300, bottom(N.pr), 1300, top(N.reviewer)), at: 376},
  {
    id: 'r-c',
    from: 'reviewer',
    to: 'coding',
    pts: [left(N.reviewer), 690, left(N.reviewer) - 220, 690, 930, bottom(N.coding) + 190, 930, bottom(N.coding) + 6],
    at: 392,
    dash: true,
  },
  {id: 'g-a', from: 'gate', to: 'approval', pts: line(1640, bottom(N.gate), 1640, top(N.approval)), at: 488},
  {id: 'a-d', from: 'approval', to: 'deploy', pts: line(1640, bottom(N.approval), 1640, top(N.deploy)), at: 524},
  {id: 'k-a', from: 'cron', to: 'agent', pts: line(right(N.cron), 880, left(N.agent), 880), at: 574},
  {id: 'a-x', from: 'agent', to: 'alert', pts: line(right(N.agent), 880, left(N.alert), 880), at: 582},
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
/* world position along an edge; z blends between the two node layers */
const at3 = (e: Edge, t: number): THREE.Vector3 => {
  const [x, y] = bez2(e, t);
  const z = N[e.from].z + (N[e.to].z - N[e.from].z) * t;
  return new THREE.Vector3(wx(x), wy(y), z);
};

const PACKETS: {edge: string; a: number; b: number; color: string; label?: string; rev?: boolean}[] = [
  {edge: 'h-l', a: 22, b: 46, color: PINK, label: 'brief + context'},
  {edge: 'l-c', a: 50, b: 82, color: PINK, label: 'brief + context'},
  {edge: 'l-c', a: 90, b: 108, color: MINT, label: 'reply, same thread', rev: true},
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
  {edge: 'a-x', a: 660, b: 670, color: RED},
];

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

/* ---------- canvas textures (text lives on planes, drawn with the bundled font) ---------- */
const K = 200; // texture pixels per world unit

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
  const c = cv.getContext('2d')!;
  draw(c, cv.width, cv.height);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
};

const measure = (text: string, fs: number, weight: number, ls: number) => {
  const c = document.createElement('canvas').getContext('2d')!;
  c.font = `${weight} ${fs * K}px ${FONT}`;
  (c as any).letterSpacing = `${fs * K * ls}px`;
  return c.measureText(text).width / K;
};

/* text plane, optionally on a pill with an ink border */
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
}> = ({text, pos, size = 0.21, color = INK, fill, border = false, weight = 600, ls = 0, opacity = 1}) => {
  const {tex, w, h} = useMemo(() => {
    const padX = fill ? size * 0.7 : 0.04;
    const tw = measure(text, size, weight, ls);
    const w = tw + padX * 2 + (border ? 0.06 : 0);
    const h = size * (fill ? 1.9 : 1.5);
    const tex = makeTex(w, h, (c, W, H) => {
      if (fill) {
        roundRect(c, 3, 3, W - 6, H - 6, (H - 6) / 2);
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
  return (
    <mesh position={pos}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={tex} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

/* ---------- geometry helpers ---------- */
const pillShape = (w: number, h: number) => {
  const r = h / 2;
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
const slab = (w: number, h: number, depth: number) => new THREE.ExtrudeGeometry(pillShape(w, h), {depth, bevelEnabled: false, curveSegments: 20});

const Node3: React.FC<{n: NodeDef; f: number; pop?: number}> = ({n, f, pop = 0}) => {
  const p = pf(f, n.at, n.at + 14);
  const w = nw(n.label) / 100;
  const h = NH / 100;
  const geo = useMemo(
    () => ({
      shadow: slab(w + 0.1, h + 0.1, DEPTH - 0.06),
      outline: slab(w + 0.1, h + 0.1, DEPTH - 0.04),
      fill: slab(w, h, DEPTH),
    }),
    [w, h],
  );
  if (p <= 0.001) return null;
  const s = Math.max(p, 0.001) * (1 + 0.07 * pop);
  const lift = pop * 0.12;
  return (
    <group position={[wx(n.cx), wy(n.cy) + (1 - p) * -0.35, n.z + lift]} scale={[s, s, s]}>
      <mesh geometry={geo.shadow} position={[0.08, -0.08, -0.1]}>
        <meshBasicMaterial color={INK} />
      </mesh>
      <mesh geometry={geo.outline}>
        <meshBasicMaterial color={INK} />
      </mesh>
      <mesh geometry={geo.fill} position={[0, 0, 0.02]}>
        <meshBasicMaterial color={n.fill} />
      </mesh>
      <Tag text={n.label} pos={[0, 0.01, DEPTH + 0.05]} size={0.28} color={n.ink ?? INK} weight={600} ls={0.08} />
    </group>
  );
};

const tubeBetween = (pts: THREE.Vector3[], r: number) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.max(4, pts.length * 2), r, 8, false);

const Arrow3: React.FC<{tip: THREE.Vector3; dir: THREE.Vector3}> = ({tip, dir}) => {
  const L = 0.24;
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  const c = tip.clone().addScaledVector(dir.clone().normalize(), -L / 2);
  return (
    <mesh position={c} quaternion={q}>
      <coneGeometry args={[0.11, L, 20]} />
      <meshBasicMaterial color={INK} />
    </mesh>
  );
};

const Edge3: React.FC<{e: Edge; f: number}> = ({e, f}) => {
  const p = pf(f, e.at, e.at + 16);
  const q = Math.round(p * 60);
  const geos = useMemo(() => {
    if (q <= 0) return [] as THREE.BufferGeometry[];
    const pp = q / 60;
    if (e.dash) {
      const D = 14;
      const out: THREE.BufferGeometry[] = [];
      for (let i = 0; i < D; i++) {
        const t0 = i / D;
        const t1 = Math.min(pp, t0 + 0.6 / D);
        if (t1 - t0 < 0.02) continue;
        const pts = [0, 1, 2, 3, 4].map((k) => at3(e, t0 + ((t1 - t0) * k) / 4));
        out.push(tubeBetween(pts, 0.035));
      }
      return out;
    }
    const n = 36;
    const pts = Array.from({length: n + 1}, (_, k) => at3(e, (pp * k) / n));
    return [tubeBetween(pts, 0.04)];
  }, [q, e]);
  if (p <= 0) return null;
  const end = at3(e, 1);
  const endDir = end.clone().sub(at3(e, 0.97));
  const start = at3(e, 0);
  const startDir = start.clone().sub(at3(e, 0.03));
  return (
    <group>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshBasicMaterial color={INK} />
        </mesh>
      ))}
      {p > 0.9 && <Arrow3 tip={end} dir={endDir} />}
      {/* two-way edge: the arrowhead at the start points back to where it began */}
      {e.both && p > 0.9 && <Arrow3 tip={start} dir={startDir} />}
    </group>
  );
};

const Packet3: React.FC<{p: (typeof PACKETS)[number]; f: number}> = ({p, f}) => {
  if (f < p.a || f > p.b + 8) return null;
  const t = lin(f, p.a, p.b);
  const e = EDGE[p.edge];
  const pos = at3(e, p.rev ? 1 - t : t);
  const fade = f > p.b ? 1 - (f - p.b) / 8 : 1;
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.2, 28, 20]} />
        <meshBasicMaterial color={p.color} transparent opacity={fade} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.25, 28, 20]} />
        <meshBasicMaterial color={INK} side={THREE.BackSide} transparent opacity={fade} />
      </mesh>
      {p.label && <Tag text={p.label} pos={[0, 0.62, 0.35]} size={0.21} fill={CANVAS} border opacity={fade} />}
    </group>
  );
};

/* dashed mission box behind the coding agent, with its tickets */
const Mission3: React.FC<{f: number}> = ({f}) => {
  const mission = pf(f, 252, 268);
  const out = 1 - pf(f, 336, 346);
  const done = [284, 304, 324].map((t) => f > t);
  const key = done.join();
  const w = (nw(N.coding.label) + 72) / 100;
  const h = (NH + 114 + 60) / 100;
  const tex = useMemo(
    () =>
      makeTex(w, h, (c, W, H) => {
        roundRect(c, 4, 4, W - 8, H - 8, 56);
        c.setLineDash([22, 16]);
        c.lineWidth = 7;
        c.strokeStyle = INK;
        c.stroke();
        c.setLineDash([]);
      }),
    [w, h],
  );
  if (mission <= 0 || out <= 0) return null;
  const o = mission * out;
  const cy = N.coding.cy - NH / 2 - 52 + (NH + 114 + 60) / 2;
  const base = [wx(N.coding.cx), wy(cy), N.coding.z - 0.2] as [number, number, number];
  return (
    <group position={base}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} transparent opacity={o} depthWrite={false} />
      </mesh>
      <Tag text="MISSION · ONE WORKTREE" pos={[-0.05, h / 2, 0.02]} size={0.2} fill={CANVAS} weight={600} ls={0.12} opacity={o} />
      {['T-1', 'T-2', 'T-3'].map((t, i) => (
        <Tag key={t + key} text={(done[i] ? '✔ ' : '') + t} pos={[(i - 1) * 0.72, -h / 2 + 0.3, 0.05]} size={0.2} fill={done[i] ? MINT : CANVAS} border opacity={o} />
      ))}
    </group>
  );
};

const useFontReady = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('fonts for 3d labels'));
  useEffect(() => {
    document.fonts
      .load(`600 40px ${FONT}`)
      .then(() => document.fonts.load(`700 40px ${FONT}`))
      .then(() => {
        setReady(true);
        continueRender(handle);
      })
      .catch(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);
  return ready;
};

export const Flow3DScene: React.FC = () => {
  const f = useCurrentFrame();
  const ready = useFontReady();

  const arrivals: Record<string, number> = {};
  const target: Record<string, string> = {'h-l': 'lead', 'l-c': 'coding', 'c-p': 'pr', 'p-g': 'gate', 'p-r': 'reviewer', 'g-a': 'approval', 'a-d': 'deploy', 'k-a': 'agent', 'a-x': 'alert'};
  PACKETS.forEach((p) => {
    /* a reversed l-c packet arrives at the lead agent, the forward one at the coding agent */
    const t = p.rev ? 'lead' : p.edge === 'r-c' ? 'coding' : target[p.edge];
    const since = f - p.b;
    if (t && since >= 0 && since < 12) arrivals[t] = Math.max(arrivals[t] ?? 0, 1 - since / 12);
  });

  const beat = BEATS.find((b) => f >= b.a && f < b.b) ?? BEATS[BEATS.length - 1];
  const cap = beat.m >= 0 ? MECHANISMS[beat.m] : approvalCaption;
  const capIn = pf(f, beat.a, beat.a + 12);
  const label = beat.m >= 0 ? `0${beat.m + 1}` : '→';

  const gateOn = f >= 490;
  const gate: NodeDef = {...N.gate, fill: gateOn ? COBALT : CANVAS, ink: gateOn ? '#fff' : INK};
  const deployOn = f >= 572;
  const deploy: NodeDef = {...N.deploy, fill: deployOn ? MINT : CANVAS};
  const alertOn = f >= FLOW3D_FRAMES - 4;
  const alert: NodeDef = {...N.alert, fill: alertOn ? RED : CANVAS};
  const approvalPress = f > 510 && f < 520 ? 0.4 : 0;

  /* slow camera sway around the board */
  const sway = Math.sin((f / FLOW3D_FRAMES) * Math.PI * 2);
  const rotY = 0.04 + 0.16 * sway;
  const rotX = -0.28 + 0.03 * Math.cos((f / FLOW3D_FRAMES) * Math.PI * 2);

  const note = (n: NodeDef, dy: number, text: string, o: number): React.ReactNode =>
    o > 0.01 ? <Tag text={text} pos={[wx(n.cx), wy(n.cy) + dy, n.z + 0.1]} size={0.22} color={INK2} weight={500} opacity={o} /> : null;

  return (
    <Frame left="agent infrastructure" right="how work moves · 3D" footer="six mechanisms in use">
      {ready && (
        <ThreeCanvas width={1920} height={1080} camera={{position: [0, 0, 15], fov: 40, near: 0.1, far: 100}} gl={{toneMapping: THREE.NoToneMapping}} style={{position: 'absolute', left: 0, top: 0}}>
          <group position={[0, -1.58, 0]} rotation={new THREE.Euler(rotX, rotY, 0, 'YXZ')} scale={[0.95, 0.95, 0.95]}>
            {/* ground slab so the layers read as depth */}
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

            {note(N.coding, -0.78, N.coding.sub ?? '', pf(f, 110, 122) * (1 - pf(f, 330, 340)))}
            {f >= 492 && <Tag text="a person decides" pos={[wx(N.approval.cx) + 0.8, wy(N.approval.cy) - 0.72, N.approval.z + 0.1]} size={0.22} color={INK2} weight={500} opacity={pf(f, 492, 504)} />}
            {f >= 186 && <Tag text="1 agent · 1 branch" pos={[wx(N.coding.cx) + 1.0, wy(470) + 1.25, N.coding.z + 0.1]} size={0.21} fill={SUN} border opacity={pf(f, 186, 198) * (1 - pf(f, 244, 252))} />}
            {note(N.gate, 0.72, gateOn ? '✔ gate passes' : '', f >= 470 ? pf(f, 470, 484) : 0)}
            {note(N.agent, 0.78, f > 632 ? '✔ ✔ ✔  all clear' : f > 610 ? '✔ ✔  all clear' : '✔  all clear', f >= 590 ? pf(f, 590, 600) * (1 - pf(f, 654, 660)) : 0)}
            {note(N.alert, -0.72, alertOn ? 'speaks only when something is wrong' : 'silent', f >= 578 ? pf(f, 578, 590) : 0)}
            {note(N.deploy, -0.72, deployOn ? '✔ deployed' : 'waits for approval', f >= 520 ? pf(f, 520, 532) : 0)}
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
