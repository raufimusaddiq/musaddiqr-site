import React from 'react';
import {Easing, interpolate} from 'remotion';
import {Frame, useT} from './scenes';
import {MECHANISMS} from './data';

/* The agent-infrastructure piece: one diagram, work travels through it.
   Visual language is the page's connection map: pills, 2px ink, hard shadows. */

const INK = '#0b0b0b';
const INK2 = '#4f4a40';
const CANVAS = '#f4f1e8';
const PINK = '#ff6fae';
const SUN = '#ffd42e';
const COBALT = '#2d4bff';
const MINT = '#7bffbf';
const SANS = `'Space Grotesk', system-ui, sans-serif`;

export const FLOW_FRAMES = 670;

const pf = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
const lin = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

type NodeDef = {cx: number; cy: number; label: string; fill: string; ink?: string; at: number; sub?: string; subAt?: number; subEnd?: number};
const nw = (label: string) => label.length * 20 + 60;
const NH = 76;

const N: Record<string, NodeDef> = {
  human: {cx: 230, cy: 470, label: 'HUMAN', fill: PINK, at: 0},
  lead: {cx: 560, cy: 470, label: 'LEAD AGENT', fill: CANVAS, at: 14},
  coding: {cx: 930, cy: 470, label: 'CODING AGENT', fill: CANVAS, at: 28, sub: 'own session · own worktree', subAt: 110, subEnd: 330},
  pr: {cx: 1300, cy: 470, label: 'PULL REQUEST', fill: CANVAS, at: 345},
  gate: {cx: 1640, cy: 470, label: 'REVIEW GATE', fill: CANVAS, at: 345},
  reviewer: {cx: 1300, cy: 690, label: 'REVIEWER', fill: CANVAS, at: 372},
  approval: {cx: 1640, cy: 690, label: 'APPROVAL', fill: INK, ink: CANVAS, at: 484, sub: 'a person decides', subAt: 492},
  deploy: {cx: 1640, cy: 880, label: 'DEPLOYMENT', fill: CANVAS, at: 520},
  cron: {cx: 230, cy: 880, label: 'CRON', fill: SUN, at: 562},
  agent: {cx: 560, cy: 880, label: 'AGENT', fill: CANVAS, at: 570},
  alert: {cx: 930, cy: 880, label: 'ALERT', fill: CANVAS, at: 578},
};

/* edge endpoints, as [x1,y1,x2,y2] from node borders */
const right = (n: NodeDef) => n.cx + nw(n.label) / 2 + 8;
const left = (n: NodeDef) => n.cx - nw(n.label) / 2 - 14;
const bottom = (n: NodeDef) => n.cy + NH / 2 + 8;
const top = (n: NodeDef) => n.cy - NH / 2 - 14;

type Edge = {id: string; pts: [number, number, number, number, number, number, number, number]; at: number; dash?: boolean};
const line = (x1: number, y1: number, x2: number, y2: number): Edge['pts'] => [x1, y1, x1 + (x2 - x1) / 3, y1 + (y2 - y1) / 3, x1 + (2 * (x2 - x1)) / 3, y1 + (2 * (y2 - y1)) / 3, x2, y2];

const E: Edge[] = [
  {id: 'h-l', pts: line(right(N.human), 470, left(N.lead), 470), at: 18},
  {id: 'l-c', pts: line(right(N.lead), 470, left(N.coding), 470), at: 34},
  {id: 'c-p', pts: line(right(N.coding), 470, left(N.pr), 470), at: 350},
  {id: 'p-g', pts: line(right(N.pr), 470, left(N.gate), 470), at: 350},
  {id: 'p-r', pts: line(1300, bottom(N.pr), 1300, top(N.reviewer)), at: 376},
  {
    id: 'r-c',
    pts: [left(N.reviewer), 690, left(N.reviewer) - 220, 690, 930, bottom(N.coding) + 190, 930, bottom(N.coding) + 6],
    at: 392,
    dash: true,
  },
  {id: 'g-a', pts: line(1640, bottom(N.gate), 1640, top(N.approval)), at: 488},
  {id: 'a-d', pts: line(1640, bottom(N.approval), 1640, top(N.deploy)), at: 524},
  {id: 'k-a', pts: line(right(N.cron), 880, left(N.agent), 880), at: 574},
  {id: 'a-x', pts: line(right(N.agent), 880, left(N.alert), 880), at: 582},
];
const EDGE = Object.fromEntries(E.map((e) => [e.id, e]));

const bez = (e: Edge, t: number): [number, number] => {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = e.pts;
  const u = 1 - t;
  return [
    u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
    u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
  ];
};

/* packets travelling along edges: [edge, start, end, colour, label, reverse] */
const PACKETS: {edge: string; a: number; b: number; color: string; label?: string; rev?: boolean}[] = [
  {edge: 'h-l', a: 22, b: 46, color: PINK, label: 'brief + context'},
  {edge: 'l-c', a: 50, b: 82, color: PINK, label: 'brief + context'},
  {edge: 'l-c', a: 90, b: 108, color: MINT, label: 'reply, same thread', rev: true},
  {edge: 'l-c', a: 136, b: 160, color: MINT, label: 'verified', rev: true},
  {edge: 'c-p', a: 352, b: 378, color: PINK, label: 'pull request'},
  {edge: 'p-r', a: 380, b: 402, color: SUN, label: 'review'},
  {edge: 'r-c', a: 406, b: 440, color: '#ff5a4d', label: 'findings'},
  {edge: 'c-p', a: 444, b: 468, color: MINT, label: '1 commit'},
  {edge: 'p-g', a: 470, b: 490, color: MINT},
  {edge: 'g-a', a: 496, b: 520, color: SUN, label: 'ready'},
  {edge: 'a-d', a: 548, b: 572, color: MINT, label: 'go'},
  {edge: 'k-a', a: 590, b: 604, color: MINT},
  {edge: 'k-a', a: 616, b: 630, color: MINT},
  {edge: 'k-a', a: 642, b: 656, color: MINT},
  {edge: 'a-x', a: 660, b: 670, color: '#ff5a4d'},
];

/* beats: caption shown for each stretch */
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

const Pill: React.FC<{n: NodeDef; f: number; pop?: number}> = ({n, f, pop = 0}) => {
  const p = pf(f, n.at, n.at + 14);
  const w = nw(n.label);
  const scale = 1 + 0.07 * pop;
  return (
    <div style={{position: 'absolute', left: n.cx - w / 2, top: n.cy - NH / 2, width: w, height: NH, opacity: p, transform: `translateY(${(1 - p) * 20}px) scale(${scale})`}}>
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          background: n.fill,
          color: n.ink ?? INK,
          border: `3px solid ${INK}`,
          borderRadius: 999,
          boxShadow: `5px 5px 0 ${INK}`,
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: '0.08em',
          fontFamily: SANS,
        }}
      >
        {n.label}
      </div>
      {n.sub && f >= (n.subAt ?? 0) && (
        <div style={{position: 'absolute', top: NH + 14, left: 0, right: 0, textAlign: 'center', fontSize: 22, color: INK2, opacity: pf(f, n.subAt ?? 0, (n.subAt ?? 0) + 12) * (1 - (n.subEnd ? pf(f, n.subEnd, n.subEnd + 10) : 0)), whiteSpace: 'nowrap'}}>{n.sub}</div>
      )}
    </div>
  );
};

export const FlowScene: React.FC = () => {
  const f = useT();

  /* which node just received a packet: pop for 10 frames after arrival */
  const arrivals: Record<string, number> = {};
  const target: Record<string, string> = {'h-l': 'lead', 'l-c': 'coding', 'c-p': 'pr', 'p-g': 'gate', 'p-r': 'reviewer', 'g-a': 'approval', 'a-d': 'deploy', 'k-a': 'agent', 'a-x': 'alert'};
  PACKETS.forEach((p) => {
    const t = p.rev ? (p.edge === 'l-c' ? 'lead' : '') : p.edge === 'r-c' ? 'coding' : target[p.edge];
    if (!t) return;
    const since = f - p.b;
    if (since >= 0 && since < 12) arrivals[t] = Math.max(arrivals[t] ?? 0, 1 - since / 12);
  });

  const beat = BEATS.find((b) => f >= b.a && f < b.b) ?? BEATS[BEATS.length - 1];
  const cap = beat.m >= 0 ? MECHANISMS[beat.m] : approvalCaption;
  const capIn = pf(f, beat.a, beat.a + 12);
  const label = beat.m >= 0 ? `0${[1, 2, 3, 4, 5, 6][beat.m]}` : '→';

  const gateOn = f >= 490;
  const gate: NodeDef = {...N.gate, fill: gateOn ? COBALT : CANVAS, ink: gateOn ? '#fff' : INK};
  const deployOn = f >= 572;
  const deploy: NodeDef = {...N.deploy, fill: deployOn ? MINT : CANVAS};
  const alertOn = f >= 670 - 4;
  const alert: NodeDef = {...N.alert, fill: alertOn ? '#ff5a4d' : CANVAS};
  const approvalPress = f > 510 && f < 520 ? 0.4 : 0;

  /* mission box + tickets */
  const mission = pf(f, 252, 268);
  const missionOut = 1 - pf(f, 336, 346);

  return (
    <Frame left="agent infrastructure" right="how work moves" footer="six mechanisms in use">
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

      {/* mission box around the coding agent */}
      {mission > 0 && missionOut > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 930 - nw(N.coding.label) / 2 - 36,
            top: 470 - NH / 2 - 52,
            width: nw(N.coding.label) + 72,
            height: NH + 114 + 60,
            border: `3px dashed ${INK}`,
            borderRadius: 28,
            opacity: mission * missionOut,
          }}
        >
          <div style={{position: 'absolute', top: -20, left: 24, background: CANVAS, padding: '0 10px', fontSize: 20, letterSpacing: '0.12em', fontWeight: 600}}>MISSION · ONE WORKTREE</div>
          <div style={{position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10}}>
            {['T-1', 'T-2', 'T-3'].map((t, i) => {
              const done = f > 284 + i * 20;
              return (
                <span key={t} style={{fontSize: 20, fontWeight: 600, border: `2px solid ${INK}`, borderRadius: 999, padding: '2px 12px', background: done ? MINT : CANVAS}}>
                  {done ? '✔ ' : ''}
                  {t}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* one-owner tag */}
      {f >= 186 && (
        <div style={{position: 'absolute', left: 930 + nw(N.coding.label) / 2 - 150, top: 470 - NH / 2 - 54, opacity: pf(f, 186, 198) * (1 - pf(f, 244, 252)), display: 'flex', gap: 8}}>
          <span style={{border: `2px solid ${INK}`, borderRadius: 999, background: SUN, padding: '3px 14px', fontSize: 21, fontWeight: 600}}>1 agent · 1 branch</span>
        </div>
      )}

      {/* edges */}
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
        {E.map((e) => {
          const p = pf(f, e.at, e.at + 16);
          if (p <= 0) return null;
          const [x0, y0, x1, y1, x2, y2, x3, y3] = e.pts;
          const d = `M${x0} ${y0} C${x1} ${y1} ${x2} ${y2} ${x3} ${y3}`;
          const [ax, ay] = bez(e, 1);
          const [bx, by] = bez(e, 0.96);
          const ang = Math.atan2(ay - by, ax - bx);
          const ah = 14;
          const tip = `${ax},${ay} ${ax - ah * Math.cos(ang - 0.45)},${ay - ah * Math.sin(ang - 0.45)} ${ax - ah * Math.cos(ang + 0.45)},${ay - ah * Math.sin(ang + 0.45)}`;
          return (
            <g key={e.id} opacity={Math.min(1, p * 2)}>
              <path d={d} fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={e.dash ? '0.025 0.02' : 1} strokeDashoffset={e.dash ? 0 : 1 - p} />
              {p > 0.9 && <polygon points={tip} fill={INK} />}
            </g>
          );
        })}
      </svg>

      {/* packets */}
      {PACKETS.map((p, i) => {
        if (f < p.a || f > p.b + 8) return null;
        const t = lin(f, p.a, p.b);
        const e = EDGE[p.edge];
        const [x, y] = bez(e, p.rev ? 1 - t : t);
        const fade = f > p.b ? 1 - (f - p.b) / 8 : 1;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, opacity: fade}}>
            <div style={{position: 'absolute', left: -15, top: -15, width: 30, height: 30, borderRadius: 999, background: p.color, border: `3px solid ${INK}`, boxShadow: `3px 3px 0 ${INK}`}} />
            {p.label && (
              <div style={{position: 'absolute', left: 0, top: -58, transform: 'translateX(-50%)', whiteSpace: 'nowrap', background: CANVAS, border: `2px solid ${INK}`, borderRadius: 999, padding: '2px 14px', fontSize: 21, fontWeight: 600}}>{p.label}</div>
            )}
          </div>
        );
      })}

      {/* nodes */}
      <Pill n={N.human} f={f} pop={arrivals.human} />
      <Pill n={N.lead} f={f} pop={arrivals.lead} />
      <Pill n={N.coding} f={f} pop={arrivals.coding} />
      <Pill n={N.pr} f={f} pop={arrivals.pr} />
      <Pill n={gate} f={f} pop={arrivals.gate} />
      <Pill n={N.reviewer} f={f} pop={arrivals.reviewer} />
      <Pill n={N.approval} f={f} pop={Math.max(arrivals.approval ?? 0, approvalPress)} />
      <Pill n={deploy} f={f} pop={arrivals.deploy} />
      <Pill n={N.cron} f={f} />
      <Pill n={N.agent} f={f} pop={arrivals.agent} />
      <Pill n={alert} f={f} pop={arrivals.alert} />

      {/* small status notes */}
      {f >= 470 && <div style={{position: 'absolute', left: 1640 - 120, top: 470 + NH / 2 + 18, width: 240, textAlign: 'center', fontSize: 22, color: INK2, opacity: pf(f, 470, 484)}}>{gateOn ? '✔ gate passes' : ''}</div>}
      {f >= 590 && (
        <div style={{position: 'absolute', left: 560 - 150, top: 880 - NH / 2 - 44, width: 300, textAlign: 'center', fontSize: 22, color: INK2, opacity: pf(f, 590, 600) * (1 - pf(f, 654, 660))}}>
          {f > 632 ? '✔ ✔ ✔  all clear' : f > 610 ? '✔ ✔  all clear' : '✔  all clear'}
        </div>
      )}
      {f >= 578 && <div style={{position: 'absolute', left: 930 - 220, top: 880 + NH / 2 + 16, width: 440, textAlign: 'center', fontSize: 22, color: INK2, opacity: pf(f, 578, 590)}}>{alertOn ? 'speaks only when something is wrong' : 'silent'}</div>}
      {f >= 520 && <div style={{position: 'absolute', left: 1640 - 140, top: 880 + NH / 2 + 16, width: 280, textAlign: 'center', fontSize: 22, color: INK2, opacity: pf(f, 520, 532)}}>{deployOn ? '✔ deployed' : 'waits for approval'}</div>}
    </Frame>
  );
};
