import React from 'react';
import {Easing, interpolate} from 'remotion';
import {Frame, useT} from './scenes';
import {REPO_LINE} from './data';

/* Recreated UIs for the projects video. Layout and palette follow each app's own
   screens; every name, number and message here is invented. Nothing is captured
   from a running app. */

const INK = '#0b0b0b';
const INK2 = '#4f4a40';
const SANS = `'Space Grotesk', system-ui, sans-serif`;
const MONO = `'DejaVu Sans Mono', ui-monospace, monospace`;

/* progress of f between a and b, eased, clamped 0..1 */
const pf = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
const lin = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const typed = (s: string, f: number, a: number, cps = 1.1) =>
  s.slice(0, Math.max(0, Math.min(s.length, Math.floor((f - a) * cps))));
const idr = (n: number) => 'Rp ' + Math.round(n).toLocaleString('de-DE');
const num = (n: number) => Math.round(n).toLocaleString('en-US');

/* ---------- shared scene: caption column + app window ---------- */

const W = 1240;
const H = 716;

const UiScene: React.FC<{
  index: number;
  total: number;
  name: string;
  say: string;
  lang: string;
  url: string;
  title: string;
  children: (f: number) => React.ReactNode;
}> = ({index, total, name, say, lang, url, title, children}) => {
  const f = useT();
  const a = pf(f, 0, 14);
  const b = pf(f, 6, 20);
  return (
    <Frame
      left="projects"
      right={`${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`}
      footer={REPO_LINE}
    >
      <div style={{position: 'absolute', left: 120, top: 150, width: 400, opacity: b, transform: `translateY(${(1 - b) * 30}px)`}}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            border: `2px solid ${INK}`,
            background: ['#ff6fae', '#ffd42e', '#7bffbf', '#ff6fae', '#ffd42e', '#7bffbf', '#ff6fae'][index],
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
            fontSize: 24,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>
        <div style={{fontSize: name.length > 9 ? 72 : 88, fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 1, marginTop: 28}}>
          {name}
        </div>
        <div style={{fontSize: 28, lineHeight: 1.4, color: INK2, marginTop: 26}}>{say}</div>
        <div style={{display: 'flex', gap: 14, alignItems: 'center', marginTop: 32}}>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              border: `2px solid ${INK}`,
              borderRadius: 999,
              padding: '6px 16px',
              background: '#f4f1e8',
            }}
          >
            {lang}
          </span>
          <span style={{fontSize: 22, color: INK2}}>Public</span>
        </div>
        <div style={{fontSize: 20, color: INK2, marginTop: 18, letterSpacing: '0.02em'}}>{url}</div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 560,
          top: 130,
          width: W,
          height: H + 44,
          opacity: a,
          transform: `translateY(${(1 - a) * 40}px)`,
          border: `2px solid ${INK}`,
          borderRadius: 20,
          boxShadow: `8px 8px 0 ${INK}`,
          background: '#fff',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: 44,
            background: '#e9e4d4',
            borderBottom: `2px solid ${INK}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 18px',
          }}
        >
          {[0, 1, 2].map((i) => (
            <span key={i} style={{width: 12, height: 12, borderRadius: 999, border: `2px solid ${INK}`, background: '#f4f1e8'}} />
          ))}
          <span style={{marginLeft: 14, fontSize: 18, color: INK2, letterSpacing: '0.04em'}}>{title}</span>
        </div>
        <div style={{position: 'relative', width: W, height: H, overflow: 'hidden'}}>{children(f)}</div>
      </div>
      <div style={{position: 'absolute', left: 560, top: 130 + H + 44 + 22, fontSize: 20, color: INK2, letterSpacing: '0.04em'}}>
        Recreated interface · illustrative data
      </div>
    </Frame>
  );
};

/* ---------- 1. richmod (from apps/web/app/styles: "Retro Ledger" tokens, origin/main) ---------- */

const RICH = {canvas: '#f7f3e8', surface: '#fffcf4', mint: '#e7eedf', ink: '#253a36', accent: '#245c54', soft: '#dceae2', peach: '#fae9de', butter: '#f5ebc3', income: '#315b3f', expense: '#8b4437', warn: '#73561e', line: '#d5d9c8', muted: '#4c5a50'};

const RichmodApp = (f: number) => {
  const countUp = pf(f, 6, 40);
  const hit = pf(f, 70, 82); // the receipt lands
  const income = 15200000;
  const spend = 3860000 + 48500 * hit;
  const net = income - spend;
  const alloc = 4000000;
  const toast = pf(f, 54, 64) * (1 - pf(f, 96, 102));
  const press = f > 46 && f < 54 ? 0.96 : 1;
  const pts = [10, 38, 30, 62, 44, 70, 52, 84, 66, 74, 58, 92];
  const path = pts.map((y, i) => `${i === 0 ? 'M' : 'L'}${i * 40} ${116 - y}`).join(' ');
  const draw = pf(f, 20, 60);
  const cats: [string, number, string][] = [
    ['Makan di luar', 0.38, '#245c54'],
    ['Belanja bulanan', 0.29, '#3a5867'],
    ['Transportasi', 0.15, '#73561e'],
    ['Lainnya', 0.18, '#8b4437'],
  ];
  const R = 62;
  const circ = 2 * Math.PI * R;
  let off = 0;
  const nav = ['Ringkasan', 'Transaksi', 'Analisis', 'Kekayaan', 'Tinjauan', 'Dokumen', 'Keluarga', 'Pengaturan'];
  const shadow = `3px 4px 0 rgba(37,58,54,.16)`;
  const surface: React.CSSProperties = {border: `2px solid ${RICH.ink}`, borderRadius: 18, background: RICH.surface, boxShadow: shadow};
  return (
    <div style={{display: 'flex', width: W, height: H, background: RICH.canvas, fontFamily: SANS, color: RICH.ink}}>
      <div style={{width: 244, background: RICH.mint, borderRight: `2px solid ${RICH.ink}`, padding: '24px 16px 16px', display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24}}>
          <span style={{width: 34, height: 34, borderRadius: 12, border: `2px solid ${RICH.ink}`, background: RICH.peach, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 18}}>R</span>
          <div>
            <div style={{fontSize: 19, fontWeight: 600, lineHeight: 1}}>Richmod</div>
            <div style={{fontSize: 12, color: RICH.muted, marginTop: 3}}>Keuangan keluarga</div>
          </div>
        </div>
        {nav.map((n, i) => (
          <div
            key={n}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: 44,
              padding: '0 14px',
              marginBottom: 4,
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              background: i === 0 ? RICH.soft : 'transparent',
              border: `2px solid ${i === 0 ? RICH.ink : 'transparent'}`,
              boxShadow: i === 0 ? `2px 2px 0 ${RICH.ink}` : 'none',
            }}
          >
            {n}
            {n === 'Tinjauan' && <span style={{background: RICH.warn, color: '#fff', borderRadius: 999, fontSize: 12, fontWeight: 800, padding: '1px 9px'}}>{hit > 0.5 ? 3 : 2}</span>}
          </div>
        ))}
        <div style={{marginTop: 'auto', fontSize: 12, color: RICH.muted}}>Ruang kerja</div>
        <div style={{fontSize: 13, fontWeight: 700}}>Keuangan keluarga</div>
        <div style={{fontSize: 12, color: RICH.muted}}>IDR · Asia/Jakarta</div>
      </div>
      <div style={{flex: 1, padding: '26px 34px', position: 'relative'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <div>
            <div style={{fontSize: 14, color: RICH.muted}}>Ringkasan</div>
            <div style={{fontSize: 40, fontWeight: 500, letterSpacing: '-0.02em'}}>Keuangan keluarga</div>
          </div>
          <div style={{...surface, boxShadow: 'none', borderRadius: 12, padding: '9px 16px', fontWeight: 600, fontSize: 15, transform: `scale(${press})`, background: press < 1 ? RICH.soft : RICH.surface}}>⬆ Unggah bukti</div>
        </div>
        <div style={{...surface, marginTop: 16, overflow: 'hidden'}}>
          <div style={{padding: '14px 22px', borderBottom: `1px solid ${RICH.line}`, display: 'flex', justifyContent: 'space-between'}}>
            <div>
              <div style={{fontSize: 13, color: RICH.muted}}>Posisi saat ini</div>
              <div style={{fontSize: 20, fontWeight: 600}}>Arus kas rumah tangga</div>
            </div>
            <div style={{fontSize: 13, textAlign: 'right', color: RICH.muted}}>
              <b style={{color: RICH.ink}}>Siklus gaji</b>
              <div>1 Nov 2026 · masih berjalan</div>
            </div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr'}}>
            <div style={{background: RICH.peach, padding: '20px 22px'}}>
              <div style={{fontSize: 14, fontWeight: 600}}>Arus kas bersih · siklus ini</div>
              <div style={{fontSize: 44, fontWeight: 600, letterSpacing: '-0.03em', marginTop: 10}}>{idr(net * countUp)}</div>
              <div style={{fontSize: 13, color: RICH.income, marginTop: 8}}>✔ Hanya transaksi terkonfirmasi</div>
            </div>
            {[
              [['Pemasukan', income, RICH.income], ['Pengeluaran', spend, RICH.expense]],
              [['Tabungan dialokasikan', alloc, RICH.income], ['Surplus belum dialokasikan', net - alloc, RICH.income]],
            ].map((col, ci) => (
              <div key={ci} style={{borderLeft: `1px solid ${RICH.line}`}}>
                {col.map(([k, v, c], i) => (
                  <div key={i} style={{padding: '12px 18px', borderTop: i ? `1px solid ${RICH.line}` : 'none'}}>
                    <div style={{fontSize: 13, fontWeight: 600}}>{k as string}</div>
                    <div style={{fontSize: 22, fontWeight: 600, color: c as string, marginTop: 3}}>{idr((v as number) * countUp)}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{marginTop: 14, background: RICH.butter, border: `2px solid ${RICH.ink}`, borderRadius: 12, boxShadow: `2px 2px 0 ${RICH.ink}`, padding: '11px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 15}}>
          <span>
            <b>{hit > 0.5 ? 3 : 2} transaksi membutuhkan keputusan</b> · Belum masuk analisis sampai kamu mengonfirmasi interpretasinya.
          </span>
          <b>Buka tinjauan →</b>
        </div>
        <div style={{display: 'flex', gap: 16, marginTop: 14}}>
          <div style={{...surface, flex: 1.45, padding: '14px 18px'}}>
            <div style={{fontSize: 13, color: RICH.muted}}>Siklus gaji · harian</div>
            <div style={{fontSize: 20, fontWeight: 600}}>Pengeluaran harian</div>
            <svg width={440} height={124} style={{marginTop: 4}}>
              <path d={path} fill="none" stroke={RICH.expense} strokeWidth={3.5} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
            </svg>
          </div>
          <div style={{...surface, flex: 0.9, padding: '14px 18px', background: RICH.mint, display: 'flex', gap: 14, alignItems: 'center'}}>
            <div>
              <div style={{fontSize: 13, color: RICH.muted}}>Tiga bulan</div>
              <div style={{fontSize: 20, fontWeight: 600, marginBottom: 6}}>Ke mana uang pergi</div>
              {cats.slice(0, 3).map(([k, v, c]) => (
                <div key={k} style={{fontSize: 13, marginTop: 3}}>
                  <span style={{color: c}}>■</span> {k} {Math.round(v * 100)}%
                </div>
              ))}
            </div>
            <svg width={150} height={150} viewBox="0 0 150 150">
              <g transform="rotate(-90 75 75)">
                {cats.map(([k, v, c], i) => {
                  const len = v * circ * pf(f, 24 + i * 5, 52 + i * 5);
                  const el = <circle key={k} cx={75} cy={75} r={R} fill="none" stroke={c} strokeWidth={22} strokeDasharray={`${len} ${circ}`} strokeDashoffset={-off} />;
                  off += v * circ;
                  return el;
                })}
              </g>
            </svg>
          </div>
        </div>
        <div style={{position: 'absolute', right: 30, top: 92, width: 330, background: RICH.surface, border: `2px solid ${RICH.ink}`, borderRadius: 12, boxShadow: `4px 4px 0 ${RICH.ink}`, padding: '12px 16px', opacity: toast, transform: `translateY(${(1 - toast) * -16}px)`}}>
          <div style={{fontWeight: 700, fontSize: 15}}>✔ Struk terbaca</div>
          <div style={{fontSize: 14, marginTop: 4}}>Kopi Senja · Rp 48.500 · Makan di luar</div>
        </div>
      </div>
    </div>
  );
};

/* ---------- 2. agenticform (from packages/hub/src/ui: index.html, app.css, app.js: the night-shift ops console, dark theme) ---------- */

/* app.css dark tokens */
const AF = {ground: '#080c0a', panel: '#0d1311', sunk: '#050807', ink: '#d4efdb', ink2: '#9fbfa8', ink3: '#7b987f', line: '#2b4234', soft: '#1a2a20', ok: '#5df08a', run: '#5cc8ff', warn: '#ffb000', bad: '#ff6159'};
const AFM = `ui-monospace, 'Cascadia Code', 'DejaVu Sans Mono', monospace`;

/* illustrative machines and one run, in the console's own row and line formats */
type AfNode = {name: string; id: string; status: string; harnesses: [string, string][]; used: number; slots: number; hb: string};
const AF_NODES: AfNode[] = [
  {name: 'devbox-a', id: '7c1e9a42-5d3', status: 'online', harnesses: [['claude', 'ready'], ['codex', 'ready'], ['opencode', 'ready']], used: 1, slots: 2, hb: '3s ago'},
  {name: 'devbox-b', id: 'e04b7f19-a2c', status: 'online', harnesses: [['codex', 'ready'], ['hermes', 'ready'], ['pi', 'missing']], used: 0, slots: 1, hb: '5s ago'},
  {name: 'ci-runner', id: '91d3c8e5-6f0', status: 'offline', harnesses: [['codex', 'ready']], used: 0, slots: 1, hb: '23m ago'},
];
const AF_RUN = '3f2b9c1e-8a4d-4c7e-9b21-6d0e5a7f4c13';
const AF_NODE_ID = '7c1e9a42-5d3b-4f8e-a1c0-2b6d9e3f7a15';
const AF_EVENTS: [string, string][] = [
  ['run.started', '{"harness":"codex"}'],
  ['run.capabilities', '{"streaming":true}'],
  ['turn.started', '{}'],
  ['message.delta', 'Reading the failing test first.'],
  ['tool.call', '{"name":"bash","input":"bun test packages/hub"}'],
  ['tool.update', '{"status":"completed"}'],
  ['message.delta', 'The lease check compared the wrong clock.'],
  ['tool.call', '{"name":"edit","path":"packages/hub/src/runs.ts"}'],
  ['turn.finished', '{}'],
  ['run.finished', '{"status":"completed"}'],
];

/* status lamps: shape + word, never colour alone (app.css) */
const AF_LAMP: Record<string, [string, string]> = {
  online: ['●', AF.ok], ready: ['●', AF.ok], completed: ['●', AF.ok],
  running: ['◐', AF.run], missing: ['▲', AF.warn],
};
const afBadge = (status: string, label: React.ReactNode = status) => {
  const [glyph, color] = AF_LAMP[status] ?? ['◌', AF.ink2];
  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.35em', fontSize: '0.78rem', fontWeight: 700, padding: '0.05rem 0.5rem', border: '1px solid currentColor', color, whiteSpace: 'nowrap'}}>
      <span>{glyph}</span>
      <span>{label}</span>
    </span>
  );
};
const afBtn = (t: string, kind: 'secondary' | 'ghost' | 'danger' = 'secondary', small = false, dim = false) => {
  const base: React.CSSProperties = {display: 'inline-block', fontWeight: 700, fontSize: small ? '0.8rem' : '0.85rem', padding: small ? '0.2rem 0.6rem' : '0.45rem 0.9rem', color: AF.ink, background: AF.panel, border: `1px solid ${AF.line}`, boxShadow: `3px 3px 0 ${AF.line}`, whiteSpace: 'nowrap', opacity: dim ? 0.45 : 1};
  if (kind === 'ghost') Object.assign(base, {background: 'transparent', border: '1px solid transparent', boxShadow: 'none', textDecoration: 'underline', textUnderlineOffset: 3});
  if (kind === 'danger') Object.assign(base, {color: AF.bad, borderColor: AF.bad, boxShadow: dim ? 'none' : `3px 3px 0 ${AF.bad}`});
  return <span style={base}>{t}</span>;
};
const afPill = (t: string, strong = false) => (
  <span style={{fontSize: '0.75rem', padding: '0 0.4rem', border: `1px solid ${strong ? AF.ink : AF.soft}`, color: strong ? AF.ink : AF.ink2, fontWeight: 400}}>{t}</span>
);
/* the instrument-panel corner brackets */
const afBrackets = (
  <>
    <div style={{position: 'absolute', top: -1, left: -1, width: 14, height: 14, borderTop: `3px solid ${AF.ink}`, borderLeft: `3px solid ${AF.ink}`}} />
    <div style={{position: 'absolute', bottom: -1, right: -1, width: 14, height: 14, borderBottom: `3px solid ${AF.ink}`, borderRight: `3px solid ${AF.ink}`}} />
  </>
);

const AgenticformApp = (f: number) => {
  const runView = f >= 40;
  const shown = runView ? Math.max(0, Math.min(AF_EVENTS.length, Math.floor((f - 44) / 4.6) + 1)) : 0;
  const done = shown >= AF_EVENTS.length;
  const beat = Math.floor(f / 18) % 2 === 0; // the lamps blink in steps, as the console's `beat` keyframes do
  const tab = (label: string, extra: React.ReactNode, active: boolean) => (
    <span style={{fontWeight: 700, color: active ? AF.ink : AF.ink3, padding: '0.55rem 1rem', display: 'inline-flex', gap: '0.5rem', alignItems: 'center', border: `1px solid ${active ? AF.line : 'transparent'}`, borderBottom: 0, marginBottom: -1, background: active ? AF.panel : 'none', boxShadow: active ? `inset 0 3px 0 ${AF.ok}` : 'none'}}>
      {label} {extra}
    </span>
  );
  const th: React.CSSProperties = {textAlign: 'left', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: AF.ink3, padding: '0.55rem 0.8rem', borderBottom: `2px solid ${AF.line}`, whiteSpace: 'nowrap', background: AF.sunk};
  const td: React.CSSProperties = {padding: '0.7rem 0.8rem', borderBottom: `1px solid ${AF.soft}`, verticalAlign: 'top'};
  const time = (i: number) => `12:04:${String(12 + Math.floor(i * 1.7)).padStart(2, '0')}.${String((i * 137 + 41) % 1000).padStart(3, '0')}`;
  const typeColor = (t: string) => (t.startsWith('message.') ? AF.run : t === 'run.finished' ? AF.ok : AF.ink2);
  return (
    <div style={{width: W, height: H, overflow: 'hidden', fontFamily: AFM, fontSize: 14, lineHeight: 1.5, color: AF.ink, backgroundColor: AF.ground, backgroundImage: 'repeating-linear-gradient(0deg, rgba(93,240,138,0.035) 0, rgba(93,240,138,0.035) 1px, transparent 1px, transparent 3px)'}}>
      <div style={{zoom: 1}}>
        {/* header: the wordmark is a prompt */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 1.5rem', background: AF.sunk, borderBottom: `2px solid ${AF.line}`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.7rem'}}>
            <svg viewBox="0 0 32 32" width={24} height={24}>
              <circle cx="10" cy="11" r="3" fill="#38bdf8" />
              <circle cx="22" cy="11" r="3" fill="#10b981" />
              <circle cx="16" cy="22" r="3.2" fill="#6366f1" />
              <path d="M10 11 L16 22 L22 11" stroke={AF.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 3" fill="none" />
            </svg>
            <span style={{fontWeight: 700, fontSize: '1.05rem', letterSpacing: '0.02em'}}><span style={{color: AF.ok}}>$ </span>Agenticform</span>
            <span style={{fontSize: '0.75rem', color: AF.ink3}}>// hub operator console</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.6rem'}}>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.6rem', border: `1px solid ${AF.line}`, fontSize: '0.8rem'}}>
              <span style={{width: '0.6rem', height: '0.6rem', background: AF.ok, opacity: beat ? 1 : 0.15, display: 'inline-block'}} />
              Connected (Admin)
            </span>
            <span style={{padding: '0.3rem 0.6rem', border: `1px solid ${AF.line}`, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', background: AF.panel}}>THEME</span>
            {afBtn('Sign out', 'ghost')}
          </div>
        </div>

        <div style={{padding: '1.25rem 1.5rem 0'}}>
          <div style={{display: 'flex', borderBottom: `1px solid ${AF.line}`, marginBottom: '1.25rem'}}>
            {tab('Machines', afPill('3', !runView), !runView)}
            {tab('Runs', afPill(runView ? '1' : '0', runView), runView)}
            {tab('Tokens', afPill('Admin'), false)}
          </div>

          {!runView ? (
            <div style={{opacity: pf(f, 0, 8)}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem'}}>
                <div>
                  <div style={{fontSize: '1.25rem', fontWeight: 700}}><span style={{color: AF.ink3}}>## </span>Machines</div>
                  <div style={{color: AF.ink2, fontSize: '0.85rem', marginTop: '0.15rem'}}>Enrolled nodes executing harnesses across the cluster.</div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.8rem'}}>
                  <span style={{color: AF.ink3, fontSize: '0.8rem'}}>2/3 online · 1/4 capacity slots in use</span>
                  {afBtn('↻ Refresh')}
                </div>
              </div>
              <div style={{border: `1px solid ${AF.line}`, background: AF.panel}}>
                <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem'}}>
                  <thead>
                    <tr>{['Node', 'Status', 'Harnesses & Health', 'Isolation', 'Capacity', 'Last Heartbeat', 'Actions'].map((h, i) => <th key={h} style={{...th, textAlign: i === 6 ? 'right' : 'left'}}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {AF_NODES.map((n, i) => (
                      <tr key={n.name} style={{opacity: pf(f, 6 + i * 5, 14 + i * 5)}}>
                        <td style={td}>
                          <div style={{fontWeight: 700}}>{n.name}</div>
                          <div style={{color: AF.ink3, fontSize: '0.75rem', whiteSpace: 'nowrap'}}>{n.id}... <span style={{marginLeft: '0.4rem'}}>{afPill('v1')}</span></div>
                        </td>
                        <td style={td}>{afBadge(n.status)}</td>
                        <td style={td}>
                          <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.35rem'}}>
                            {n.harnesses.map(([h, st]) => (
                              <React.Fragment key={h}>{afBadge(st, <><b>{h}</b><span style={{fontWeight: 400}}> ({st}{st === 'missing' ? ': not_installed' : ''})</span></>)}</React.Fragment>
                            ))}
                          </div>
                        </td>
                        <td style={td}>{afBadge('ready', 'bwrap (self-test: pass)')}</td>
                        <td style={td}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <div style={{width: '4.5rem', height: '0.8rem', border: `1px solid ${AF.line}`, background: AF.sunk, overflow: 'hidden'}}>
                              <div style={{height: '100%', width: `${Math.round((n.used / n.slots) * 100)}%`, background: `repeating-linear-gradient(90deg, ${AF.ok} 0, ${AF.ok} 6px, transparent 6px, transparent 8px)`}} />
                            </div>
                            <span style={{fontSize: '0.75rem'}}>{n.used}/{n.slots}</span>
                          </div>
                        </td>
                        <td style={{...td, whiteSpace: 'nowrap'}}>{n.hb}</td>
                        <td style={{...td, textAlign: 'right'}}>{afBtn('Disable', 'ghost', true)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{opacity: pf(f, 40, 46)}}>
              <div style={{position: 'relative', background: AF.panel, border: `1px solid ${AF.line}`, padding: '1.1rem 1.25rem', marginBottom: '1.25rem'}}>
                {afBrackets}
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem'}}>
                  {afBtn('← Back to Runs', 'ghost')}
                  <div style={{display: 'flex', gap: '0.6rem'}}>
                    {afBtn('↻ Resume Stream')}
                    {afBtn('Cancel Run', 'danger', false, done)}
                  </div>
                </div>
                <div style={{fontSize: '1.25rem', fontWeight: 700, display: 'flex', gap: '0.6rem', alignItems: 'baseline'}}>
                  Run <span style={{fontSize: '0.9rem', color: AF.ink2, fontWeight: 400}}>{AF_RUN}</span>
                </div>
                <div style={{display: 'flex', gap: '1.2rem', marginTop: '0.6rem', color: AF.ink2, fontSize: '0.82rem', alignItems: 'center'}}>
                  <span>Status: {afBadge(done ? 'completed' : 'running')}</span>
                  <span>Node: {AF_NODE_ID}</span>
                  <span>Gen: 1</span>
                </div>
              </div>
              <div style={{position: 'relative', background: AF.panel, border: `1px solid ${AF.line}`}}>
                {afBrackets}
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 1.25rem', borderBottom: `1px solid ${AF.line}`, background: AF.sunk}}>
                  <div style={{display: 'flex', gap: '0.8rem', alignItems: 'center'}}>
                    <span style={{fontWeight: 700, fontSize: '0.8rem'}}>
                      <span style={{color: AF.ok}}>$ tail -f </span>
                      <span style={{letterSpacing: '0.14em', textTransform: 'uppercase'}}>run events</span>
                    </span>
                    <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', padding: '0 0.5rem', border: '1px solid currentColor', color: AF.ok}}>
                      <span style={{width: '0.55rem', height: '0.55rem', background: 'currentColor', opacity: beat ? 1 : 0.15}} /> LIVE
                    </span>
                    <span style={{color: AF.ink3, fontSize: '0.8rem'}}>{shown} events</span>
                  </div>
                  <span style={{fontSize: '0.8rem', color: AF.ink2, display: 'inline-flex', alignItems: 'center', gap: '0.4rem'}}>
                    <span style={{width: 13, height: 13, background: AF.ok, display: 'inline-block'}} /> Auto-scroll
                  </span>
                </div>
                <div style={{padding: '0.6rem 0', background: AF.sunk, fontSize: '0.82rem', minHeight: 290}}>
                  {AF_EVENTS.slice(0, shown).map(([t, d], i) => (
                    <div key={i} style={{display: 'grid', gridTemplateColumns: '3.2rem 7.5rem 11rem minmax(0, 1fr)', gap: '0 0.8rem', alignItems: 'baseline', padding: '0.12rem 1.25rem', background: i === shown - 1 && !done ? AF.panel : 'transparent'}}>
                      <span style={{color: AF.ink3, textAlign: 'right'}}>#{i + 1}</span>
                      <span style={{color: AF.ink3}}>{time(i)}</span>
                      <span style={{fontWeight: 700, color: typeColor(t)}}>{t}</span>
                      <span style={{color: t === 'message.delta' ? AF.ink : AF.ink2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{d}</span>
                    </div>
                  ))}
                  <div style={{padding: '0 1.25rem', color: AF.ok, opacity: beat ? 1 : 0.15}}>{'█'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------- 3. literouter (from globals.css + DashboardOverview/UsageStats/RequestLogger: neutral dark instrument panel) ---------- */

const LR = {bg: '#121314', side: '#1a1b1d', surface: '#1b1c1e', surface2: '#232426', border: '#37383b', sub: '#292a2d', text: '#f1f0ec', muted: '#a3a29c', subtle: '#74746f', primary: '#e9e9e5', ok: '#22c55e', warn: '#fbbf24', err: '#ef4444', info: '#60a5fa'};

const LiterouterApp = (f: number) => {
  const c = pf(f, 4, 40);
  const groups: [string, string[]][] = [
    ['Operate', ['Overview', 'Endpoint & Key', 'Providers']],
    ['Route', ['Combo & Vision Adapter', 'System One']],
    ['Observe', ['Usage', 'Quota Tracker', 'Token Saver']],
    ['System', ['Console Log', 'Settings']],
  ];
  const logs: [string, string, string, string, string, 'OK' | 'FAILED'][] = [
    ['11/04 12:04:11', 'gpt-4o-mini', 'OPENAI', 'acct-a', '812 / 140', 'OK'],
    ['11/04 12:04:12', 'claude-sonnet', 'ANTHROPIC', 'acct-b', '1,940 / 388', 'OK'],
    ['11/04 12:04:14', 'gpt-4o-mini', 'OPENAI', 'acct-a', '640 / 0', 'FAILED'],
    ['11/04 12:04:14', 'gpt-4o-mini', 'OPENAI', 'acct-d', '640 / 122', 'OK'],
    ['11/04 12:04:17', 'gemini-flash', 'GOOGLE', 'acct-c', '2,204 / 417', 'OK'],
  ];
  const tile = (k: string, v: string, d: string) => (
    <div style={{flex: 1, background: LR.surface, borderRadius: 14, boxShadow: `0 0 0 1px ${LR.sub}`, padding: '14px 18px'}}>
      <div style={{fontSize: 11, color: LR.muted}}>{k}</div>
      <div style={{fontSize: 30, fontWeight: 600, letterSpacing: '-0.04em', marginTop: 4}}>{v}</div>
      <div style={{fontSize: 11, color: LR.subtle, marginTop: 2}}>{d}</div>
    </div>
  );
  return (
    <div style={{display: 'flex', width: W, height: H, background: LR.bg, color: LR.text, fontFamily: SANS}}>
      <div style={{width: 248, background: LR.side, borderRight: `1px solid ${LR.sub}`, padding: '18px 14px', display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: `1px solid ${LR.sub}`}}>
          <span style={{width: 40, height: 40, borderRadius: 10, background: LR.primary, color: '#202225', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 18}}>⇢</span>
          <div>
            <div style={{fontSize: 17, fontWeight: 600, letterSpacing: '-0.05em'}}>LiteRouter</div>
            <div style={{fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: LR.muted}}>Control plane</div>
          </div>
        </div>
        {groups.map(([g, items]) => (
          <div key={g} style={{marginTop: 14}}>
            <div style={{fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: LR.subtle, padding: '0 10px 4px'}}>{g}</div>
            {items.map((it) => {
              const act = it === 'Usage';
              return (
                <div key={it} style={{padding: '6px 10px', borderRadius: 12, fontSize: 13, fontWeight: 500, color: act ? LR.primary : LR.muted, background: act ? 'rgba(233,233,229,0.1)' : 'transparent', borderLeft: `2px solid ${act ? LR.primary : 'transparent'}`}}>
                  {it}
                </div>
              );
            })}
          </div>
        ))}
        <div style={{marginTop: 'auto', fontSize: 12}}>
          <span style={{color: LR.ok}}>●</span> Workspace online
          <div style={{fontSize: 11, color: LR.subtle, marginTop: 3}}>Routes, keys, and provider state stay local.</div>
        </div>
      </div>
      <div style={{flex: 1, minWidth: 0, padding: '18px 28px'}}>
        <div style={{fontSize: 11, color: LR.muted, letterSpacing: '0.04em'}}>LiteRouter / workspace</div>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 2}}>
          <span style={{fontSize: 26, fontWeight: 600, letterSpacing: '-0.05em'}}>See what moved through the router.</span>
        </div>
        <div style={{fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: LR.primary, margin: '6px 0 12px'}}>Observability</div>
        <div style={{display: 'flex', gap: 14}}>
          {tile('Total requests', num(12480 * c), 'Across the selected period')}
          {tile('Input tokens', `${(9.4 * c).toFixed(1)}M`, 'Across the selected period')}
          {tile('Output tokens', `${(2.1 * c).toFixed(1)}M`, 'Across the selected period')}
          {tile('Estimated cost', `~$${(38.4 * c).toFixed(2)}`, 'Not actual billing')}
        </div>
        <div style={{display: 'flex', gap: 14, marginTop: 14}}>
          <div style={{flex: 1, background: LR.surface, borderRadius: 10, boxShadow: `0 0 0 1px ${LR.sub}`, padding: '14px 18px'}}>
            <div style={{fontSize: 14, fontWeight: 600, marginBottom: 10}}>Request logs</div>
            <div style={{fontFamily: MONO, fontSize: 12, border: `1px solid ${LR.border}`}}>
              <div style={{display: 'grid', gridTemplateColumns: '150px 150px 120px 90px 120px 90px', background: LR.surface2, color: LR.muted, borderBottom: `1px solid ${LR.border}`}}>
                {['DateTime', 'Model', 'Provider', 'Account', 'In / Out', 'Status'].map((h) => (
                  <span key={h} style={{padding: '7px 10px', borderRight: `1px solid ${LR.border}`}}>{h}</span>
                ))}
              </div>
              {logs.map((r, i) => {
                const p1 = pf(f, 18 + i * 10, 26 + i * 10);
                const bad = r[5] === 'FAILED';
                return (
                  <div key={i} style={{display: 'grid', gridTemplateColumns: '150px 150px 120px 90px 120px 90px', borderBottom: `1px solid ${LR.sub}`, opacity: p1, background: bad ? 'rgba(239,68,68,0.08)' : 'transparent'}}>
                    <span style={{padding: '7px 10px', color: LR.muted}}>{r[0]}</span>
                    <span style={{padding: '7px 10px'}}>{r[1]}</span>
                    <span style={{padding: '7px 10px'}}><span style={{background: LR.surface2, borderRadius: 4, padding: '1px 6px', fontSize: 10}}>{r[2]}</span></span>
                    <span style={{padding: '7px 10px', color: LR.muted}}>{r[3]}</span>
                    <span style={{padding: '7px 10px'}}>{r[4]}</span>
                    <span style={{padding: '7px 10px', fontWeight: 700, color: bad ? LR.err : LR.ok}}>{r[5]}</span>
                  </div>
                );
              })}
            </div>
            <div style={{fontSize: 11, color: LR.subtle, marginTop: 8}}>Logs are loaded from the request history database.</div>
          </div>
        </div>
        <div style={{marginTop: 14, background: '#111214', borderRadius: 10, boxShadow: `0 0 0 1px ${LR.sub}`, padding: '10px 16px', fontFamily: MONO, fontSize: 12, lineHeight: 1.7, height: 92, overflow: 'hidden'}}>
          {[
            ['WARN', '#facc15', 'acct-a rate limited, rotating to acct-d'],
            ['INFO', '#60a5fa', 'fallback ok · gpt-4o-mini · 356ms'],
            ['LOG', '#4ade80', 'POST /v1/chat/completions 200'],
          ].map(([l, col, m], i) => (
            <div key={i} style={{opacity: pf(f, 44 + i * 14, 52 + i * 14)}}>
              <span style={{color: col}}>[{l}] {m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- 4. antares (from web/src/styles.css + Chat.tsx: cream paper, 3px ink, hard shadows) ---------- */

const AN = {canvas: '#f4f1e8', rail: '#e9e4d4', card: '#ffffff', ink: '#0b0b0b', ink2: '#4f4a40', cobalt: '#2d4bff', mark: '#ff6fae', peri: '#b3c1ff', mint: '#8ef0c0'};

const AntaresApp = (f: number) => {
  const q = 'What needs me before the release?';
  const a1 = [
    'Two things. The ledger migration is waiting for your approval, and the nightly reconcile passed with no drift.',
    'Everything else on the release is green, so once the migration is approved you can ship.',
  ];
  const qCps = 2.4;
  const qDone = 6 + q.length / qCps;
  const typing = typed(q, f, 6, qCps);
  const sent = f > qDone + 6;
  const t0 = qDone + 14;
  const r1 = typed(a1[0], f, t0, 4.2);
  const r2 = typed(a1[1], f, t0 + a1[0].length / 4.2 + 4, 4.2);
  const chats = ['Release checklist', 'Weekly digest', 'Draft: runbook notes'];
  const tileBg = [AN.mark, AN.peri, AN.mint];
  const dots = `radial-gradient(circle at 1.5px 1.5px, rgba(11,11,11,0.16) 1.1px, transparent 1.2px)`;
  const hard = `6px 6px 0 ${AN.ink}`;
  const hardSm = `3px 3px 0 ${AN.ink}`;
  return (
    <div style={{display: 'flex', width: W, height: H, background: AN.canvas, fontFamily: SANS, color: AN.ink}}>
      <div style={{width: 272, background: AN.rail, backgroundImage: dots, backgroundSize: '14px 14px', borderRight: `3px solid ${AN.ink}`, display: 'flex', flexDirection: 'column', padding: '0 14px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '18px 4px 12px', fontSize: 29, fontWeight: 700, letterSpacing: '-0.05em'}}>
          <span style={{width: 34, height: 34, background: AN.mark, border: `2px solid ${AN.ink}`, borderRadius: 11, boxShadow: hardSm, display: 'grid', placeItems: 'center', fontSize: 19, letterSpacing: 0}}>A</span>
          Antares
        </div>
        <div style={{marginTop: 8, background: AN.cobalt, color: '#fff', border: `2px solid ${AN.ink}`, borderRadius: 14, boxShadow: hardSm, padding: '10px 14px', fontWeight: 700, fontSize: 17}}>＋ New chat</div>
        <div style={{fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', margin: '20px 4px 8px'}}>Chats</div>
        {chats.map((c, i) => {
          const cur = i === 0;
          return (
            <div
              key={c}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '4px 10px 4px 6px',
                marginBottom: 4,
                height: 44,
                borderRadius: cur ? 999 : 14,
                background: cur ? AN.ink : 'transparent',
                color: cur ? AN.canvas : AN.ink,
                fontWeight: cur ? 700 : 500,
                fontSize: 16,
                boxShadow: cur ? hardSm : 'none',
              }}
            >
              <span style={{width: 32, height: 32, display: 'grid', placeItems: 'center', fontFamily: MONO, fontSize: 12, fontWeight: 700, color: AN.ink, background: cur ? AN.mark : tileBg[i], border: `2px solid ${cur ? AN.canvas : AN.ink}`, borderRadius: 9, boxShadow: cur ? 'none' : hardSm}}>
                {String(i + 1).padStart(2, '0')}
              </span>
              {c}
            </div>
          );
        })}
        <div style={{marginTop: 'auto', padding: '10px 4px 14px', display: 'flex', alignItems: 'center', gap: 8}}>
          <span style={{flex: 1, fontFamily: MONO, fontSize: 12, color: AN.ink2}}>ada@example.com</span>
          <span style={{border: `2px solid ${AN.ink}`, borderRadius: 14, padding: '6px 10px', fontFamily: MONO, fontSize: 12, fontWeight: 700}}>Menu ⌃</span>
        </div>
      </div>
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', padding: '0 32px', position: 'relative'}}>
        <div style={{width: 704, margin: '34px auto 0'}}>
          {sent && (
            <div style={{fontSize: 34, fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.045em', marginBottom: 26, opacity: pf(f, qDone + 6, qDone + 14)}}>{q}</div>
          )}
          {f > t0 - 8 && (
            <div style={{opacity: pf(f, t0 - 8, t0)}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6}}>
                <span style={{width: 26, height: 26, background: AN.cobalt, border: `2px solid ${AN.ink}`, borderRadius: 8, boxShadow: hardSm}} />
                Assistant
              </div>
              <div style={{fontSize: 18, lineHeight: 1.7}}>
                <p style={{margin: '5px 0'}}>{r1}</p>
                {r2.length > 0 && <p style={{margin: '5px 0'}}>{r2}</p>}
                {r1.length + r2.length < a1[0].length + a1[1].length && <span style={{opacity: Math.floor(f / 6) % 2}}>▍</span>}
              </div>
            </div>
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            left: 32,
            right: 32,
            bottom: 22,
            width: 704,
            margin: '0 auto',
            background: AN.card,
            border: `3px solid ${AN.ink}`,
            borderRadius: 28,
            boxShadow: hard,
            padding: '5px 6px 5px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{flex: 1, fontSize: 18, color: sent ? AN.ink2 : AN.ink}}>
            {sent ? 'Write a message' : typing}
            {!sent && <span style={{opacity: Math.floor(f / 6) % 2}}>▍</span>}
          </span>
          <span style={{fontFamily: MONO, fontSize: 13, fontWeight: 600, padding: '0 8px'}}>Attach image</span>
          <span style={{background: sent ? 'transparent' : AN.cobalt, color: sent ? AN.ink2 : '#fff', borderRadius: 999, border: `2px solid ${sent ? AN.ink2 : AN.ink}`, boxShadow: sent ? 'none' : hardSm, padding: '9px 22px', fontWeight: 700, fontSize: 17}}>Send →</span>
        </div>
      </div>
    </div>
  );
};

/* ---------- 5. sorot (from frontend/src/app/studio + tailwind tokens: pink desktop, cream windows, 3px black) ---------- */

const SO = {bg: '#FF9EC0', cream: '#FBF3EA', white: '#fff', black: '#000', sun: '#FFD21F', hot: '#FF3D8B', aqua: '#4FD8E0', mint: '#14D99A', mintTint: '#9EF0C8', tang: '#FF7A3D', ok: '#0A7F50'};
const STAGES = ['Import Video', 'Extract Audio', 'Transcribe', 'Segment', 'Score', 'Render Clips', 'Add Subtitles', 'Generate Variations', 'Analytics'];

const SoWindow: React.FC<{title: string; bar: string; right?: string; style?: React.CSSProperties; children: React.ReactNode}> = ({title, bar, right, style, children}) => (
  <div style={{position: 'absolute', background: SO.cream, border: `3px solid ${SO.black}`, boxShadow: `6px 6px 0 ${SO.black}`, borderRadius: 8, overflow: 'hidden', ...style}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 10, background: bar, borderBottom: `3px solid ${SO.black}`, padding: '5px 10px', fontWeight: 800, fontSize: 15, letterSpacing: '0.06em', textTransform: 'uppercase'}}>
      <span style={{width: 16, height: 16, background: SO.hot, border: `2px solid ${SO.black}`}} />
      <span>{title}</span>
      <span style={{marginLeft: 'auto', fontWeight: 600}}>{right}</span>
    </div>
    {children}
  </div>
);

const SorotApp = (f: number) => {
  const url = 'youtube.com/watch?v=wayang-kontemporer';
  const prog = lin(f, 32, 72); // processing 0..1
  const stage = Math.min(8, Math.floor(prog * 9));
  const done = f >= 74;
  const press = f > 26 && f < 32;
  const clips = [
    {r: 1, sc: 84, tier: 'VIRAL', c: SO.mint, t: 'Kenapa cerita lama masih laku', time: '2:10 → 2:52', pick: 'Jev pick'},
    {r: 2, sc: 71, tier: 'POTENTIAL', c: SO.sun, t: 'Dalang muda dan algoritma', time: '8:41 → 9:20', pick: 'LLM pick'},
    {r: 3, sc: 63, tier: 'POTENTIAL', c: SO.sun, t: 'Tiga detik yang menentukan', time: '14:05 → 14:49', pick: 'LLM pick'},
  ];
  return (
    <div style={{width: W, height: H, background: SO.bg, backgroundImage: 'radial-gradient(rgba(0,0,0,.13) 1px, transparent 1.2px)', backgroundSize: '5px 5px', fontFamily: SANS, color: SO.black, position: 'relative'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 36, background: SO.cream, borderBottom: `3px solid ${SO.black}`, display: 'flex', alignItems: 'center', fontSize: 14}}>
        <span style={{background: SO.black, color: '#fff', height: '100%', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800}}>
          <span style={{width: 0, height: 0, borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderBottom: `14px solid ${SO.sun}`}} />
          Sorot
        </span>
        <span style={{marginLeft: 16, color: '#4A4038'}}>Long videos → vertical clips with word-timed captions, for Indonesian short-form</span>
        <span style={{marginLeft: 'auto', marginRight: 16, fontWeight: 700}}>RAB 28 OKT 2026 · 03:14</span>
      </div>

      <SoWindow title="Import" bar={SO.aqua} style={{left: 40, top: 62, width: 1160}}>
        <div style={{display: 'flex', gap: 30, padding: '16px 22px', alignItems: 'center'}}>
          <div style={{fontSize: 46, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, width: 420}}>
            Long video in,{' '}
            <span style={{display: 'inline-block', background: SO.sun, border: `3px solid ${SO.black}`, padding: '0 10px', transform: 'rotate(-2deg)', boxShadow: `3px 3px 0 ${SO.black}`}}>clips out</span>
          </div>
          <div style={{flex: 1}}>
            <div style={{display: 'flex', gap: 12}}>
              <div style={{flex: 1, background: '#fff', border: `3px solid ${SO.black}`, padding: '10px 14px', fontSize: 18, boxShadow: 'inset 3px 3px 0 #efe4d6', fontFamily: MONO}}>
                {f < 26 ? (url.slice(0, Math.floor(f * 1.7)) || '') : url}
                {f < 26 && f > 0 && <span style={{opacity: Math.floor(f / 5) % 2}}>▍</span>}
                {f === 0 && <span style={{color: '#6E6259'}}>Paste YouTube URL...</span>}
              </div>
              <div style={{background: SO.hot, border: `3px solid ${SO.black}`, padding: '10px 20px', fontWeight: 800, fontSize: 18, boxShadow: press ? 'none' : `4px 4px 0 ${SO.black}`, transform: press ? 'translate(3px,3px)' : 'none'}}>
                {f < 28 ? 'Import & Process' : done ? 'Import & Process' : 'Processing...'}
              </div>
            </div>
            <div style={{marginTop: 10, fontSize: 15}}>▸ Options</div>
          </div>
        </div>
      </SoWindow>

      <SoWindow title="Library" bar={SO.mint} right={f > 30 ? '1 videos' : '0 videos'} style={{left: 40, top: 238, width: 1160, height: 440}}>
        {f <= 30 ? (
          <div style={{padding: 26, fontSize: 18, color: '#4A4038'}}>No videos yet. Import a YouTube URL above to get started.</div>
        ) : (
          <div style={{padding: '16px 22px', opacity: pf(f, 30, 38)}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <span style={{width: 40, height: 40, background: SO.tang, border: `3px solid ${SO.black}`, borderRadius: 8}} />
              <span style={{width: 12, height: 12, borderRadius: 999, background: done ? SO.ok : SO.sun, border: `2px solid ${SO.black}`}} />
              <div style={{flex: 1}}>
                <div style={{fontWeight: 800, fontSize: 20}}>Wayang kontemporer: kenapa cerita lama masih laku</div>
                <div style={{fontSize: 14, color: '#4A4038'}}>just now · {done ? 'completed' : 'processing'}{done ? ' · 3 clips · 1 viral · 2 potential' : ` · ${Math.round(prog * 100)}% complete`}</div>
              </div>
              <span style={{border: `3px solid ${SO.black}`, padding: '5px 14px', fontWeight: 700, fontSize: 15, background: '#fff'}}>{done ? 'Collapse' : 'Cancel'}</span>
            </div>
            {!done ? (
              <div style={{marginTop: 20}}>
                <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, marginBottom: 6}}>
                  <span>{STAGES[stage]}</span>
                  <span>{Math.round(prog * 100)}%</span>
                </div>
                <div style={{height: 24, border: `3px solid ${SO.black}`, background: '#fff', position: 'relative', overflow: 'hidden'}}>
                  <div style={{height: '100%', width: `${prog * 100}%`, backgroundImage: `repeating-linear-gradient(45deg, ${SO.sun} 0 10px, ${SO.black} 10px 20px)`, backgroundPosition: `${f * 3}px 0`}} />
                </div>
                <div style={{marginTop: 10, background: '#1D2B1D', color: '#9CFF9C', fontFamily: MONO, fontSize: 14, padding: '6px 12px'}}>{STAGES[stage] === 'Transcribe' ? `Transcribing ${Math.round(((prog * 9) % 1) * 100)}%` : `${STAGES[stage]}…`}</div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 6, marginTop: 14}}>
                  {STAGES.map((st, i) => {
                    const isDone = i < stage;
                    const cur = i === stage;
                    return (
                      <div key={st} style={{border: `3px solid ${SO.black}`, background: isDone ? SO.mintTint : cur ? SO.sun : '#fff', padding: '6px 4px', textAlign: 'center', fontSize: 12, fontWeight: 700, lineHeight: 1.2, minHeight: 62}}>
                        <div style={{fontSize: 16}}>{isDone ? '✓' : cur ? '●' : '○'}</div>
                        {st}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{marginTop: 16}}>
                <div style={{display: 'flex', gap: 10, marginBottom: 14}}>
                  <span style={{border: `3px solid ${SO.black}`, background: SO.sun, padding: '5px 14px', fontWeight: 800, fontSize: 15}}>Clips (3)</span>
                  <span style={{border: `3px solid ${SO.black}`, background: '#fff', padding: '5px 14px', fontWeight: 700, fontSize: 15}}>Transcript</span>
                  {['All', 'VIRAL', 'POTENTIAL', 'SKIP'].map((x, i) => (
                    <span key={x} style={{marginLeft: i === 0 ? 'auto' : 0, border: `2px solid ${SO.black}`, borderRadius: 999, padding: '4px 12px', fontSize: 13, fontWeight: 700, background: i === 0 ? SO.black : '#fff', color: i === 0 ? '#fff' : SO.black}}>{x}</span>
                  ))}
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18}}>
                  {clips.map((c, i) => {
                    const p1 = pf(f, 76 + i * 4, 84 + i * 4);
                    return (
                      <div key={c.r} style={{position: 'relative', border: `3px solid ${SO.black}`, boxShadow: `6px 6px 0 ${SO.black}`, borderRadius: 8, background: SO.cream, padding: '14px 16px', opacity: p1, transform: `translateY(${(1 - p1) * 22}px)`}}>
                        <span style={{position: 'absolute', right: -8, top: -14, transform: 'rotate(6deg)', background: c.c, border: `3px solid ${SO.black}`, padding: '2px 10px', fontWeight: 800, fontSize: 13}}>{c.tier}</span>
                        <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
                          <span style={{fontWeight: 700, fontSize: 16}}>#{c.r}</span>
                          <span style={{fontSize: 46, fontWeight: 900, letterSpacing: '-0.03em'}}>{Math.round(c.sc * pf(f, 78 + i * 4, 90 + i * 4))}</span>
                          <span style={{fontSize: 14}}>/100</span>
                        </div>
                        <div style={{fontWeight: 800, fontSize: 18, marginTop: 4}}>{c.t}</div>
                        <div style={{display: 'flex', gap: 8, marginTop: 8, fontSize: 12, fontWeight: 700}}>
                          <span style={{border: `2px solid ${SO.black}`, background: SO.mintTint, padding: '1px 8px'}}>Gate PASS</span>
                          <span style={{border: `2px solid ${SO.black}`, background: c.pick === 'Jev pick' ? SO.aqua : '#A98BFF', padding: '1px 8px'}}>{c.pick}</span>
                        </div>
                        <div style={{fontSize: 14, marginTop: 8, color: '#4A4038'}}>{c.time}</div>
                        <div style={{display: 'flex', gap: 8, marginTop: 10}}>
                          <span style={{background: SO.hot, border: `3px solid ${SO.black}`, padding: '3px 12px', fontWeight: 800, fontSize: 14}}>Render</span>
                          <span style={{background: SO.aqua, border: `3px solid ${SO.black}`, padding: '3px 12px', fontWeight: 800, fontSize: 14}}>Preview</span>
                          <span style={{background: '#fff', border: `3px solid ${SO.black}`, padding: '3px 12px', fontWeight: 800, fontSize: 14}}>Score</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </SoWindow>
    </div>
  );
};

/* ---------- 6. agents (from web/src/index.css + components: paper, 2px ink, square, rivets, graph-paper) ---------- */

const AG = {ink: '#1b1a17', paper: '#f2e4c7', panel: '#fbf3e0', card: '#fdf8ec', soft: '#5b5344', red: '#e4572e', redDeep: '#b23a17', teal: '#2e7d6f', gold: '#f4a93c', green: '#7bb662', sky: '#5aa9c9', idle: '#e3d7ba', review: '#b48ad1', rivet: '#c9b892', codex: '#0b6b5c', opencode: '#6b2fa0', claude: '#9a3b06'};
const BUNGEE = `'Bungee', 'Arial Black', ${SANS}`;

const AgentsApp = (f: number) => {
  /* stage index of ticket A: 0 to do .. 3 review; ticket B parked in progress */
  const st = f < 18 ? 0 : f < 40 ? 1 : f < 62 ? 2 : 3;
  const move = f < 18 ? 0 : f < 40 ? pf(f, 18, 30) : f < 62 ? 1 + pf(f, 40, 52) : 2 + pf(f, 62, 74);
  const needs = f >= 78;
  const stages = [
    ['To do', AG.idle],
    ['In progress', AG.gold],
    ['Testing', AG.sky],
    ['Review', AG.review],
    ['Ready to push', AG.teal],
    ['Shipped', AG.green],
  ];
  const colW = 188;
  const gap = 10;
  const x0 = 24;
  const colX = (i: number) => x0 + i * (colW + gap);
  const cardX = colX(0) + move * (colW + gap) + 10;
  const rivets = (
    <>
      {[10, undefined].map((_, i) => (
        <span key={i} style={{position: 'absolute', top: 6, [i === 0 ? 'left' : 'right']: 6, width: 5, height: 5, borderRadius: 999, background: AG.rivet, border: `1px solid ${AG.ink}`}} />
      ))}
    </>
  );
  const panel: React.CSSProperties = {position: 'relative', background: AG.panel, border: `2px solid ${AG.ink}`, boxShadow: `4px 4px 0 ${AG.ink}`};
  const btn = (t: string, extra: React.CSSProperties = {}) => (
    <span style={{border: `2px solid ${AG.ink}`, background: AG.card, boxShadow: `2px 2px 0 ${AG.ink}`, padding: '0 11px', height: 34, display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', ...extra}}>{t}</span>
  );
  const chip = (name: string, kind: string, kc: string, pct: string, red?: boolean) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 6, border: `2px solid ${AG.ink}`, padding: '3px 6px', fontSize: 12, marginTop: 6, background: AG.card}}>
      <span style={{width: 9, height: 9, borderRadius: 999, background: red ? AG.red : AG.gold, border: `1px solid ${AG.ink}`}} />
      <b>{name}</b>
      <span style={{color: kc, fontWeight: 700, fontSize: 11}}>{kind}</span>
      <span style={{marginLeft: 'auto', color: AG.soft}}>{pct}</span>
    </div>
  );
  const ticket = (name: string, branch: string, repo: string, extra: React.ReactNode, shadowC = AG.ink) => (
    <div style={{background: AG.card, border: `2px solid ${AG.ink}`, boxShadow: `2px 2px 0 ${shadowC}`, padding: '9px 10px', width: colW - 20}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <b style={{fontSize: 14}}>{name}</b>
        {extra}
      </div>
      <div style={{fontSize: 11, color: AG.soft, marginTop: 3}}>work · <span style={{fontFamily: MONO}}>{repo}</span></div>
      <div style={{fontSize: 11, fontFamily: MONO, marginTop: 2}}>⎇ {branch}</div>
    </div>
  );
  return (
    <div style={{width: W, height: H, background: AG.paper, backgroundImage: `linear-gradient(rgba(201,184,146,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(201,184,146,.35) 1px, transparent 1px)`, backgroundSize: '28px 28px', fontFamily: SANS, color: AG.ink, position: 'relative'}}>
      <div style={{...panel, margin: '16px 24px 0', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 14}}>
        {rivets}
        <span style={{fontFamily: BUNGEE, fontWeight: 900, fontSize: 26, letterSpacing: '0.02em', whiteSpace: 'nowrap'}}>Agent Board</span>
        <span style={{fontSize: 12}}><span style={{color: AG.green}}>●</span> Live</span>
        <span style={{whiteSpace: 'nowrap', background: needs ? AG.redDeep : AG.idle, color: needs ? '#fff' : AG.ink, border: `2px solid ${AG.ink}`, padding: '4px 12px', fontFamily: BUNGEE, fontSize: 13, boxShadow: `2px 2px 0 ${AG.ink}`}}>
          ▮ {needs ? 1 : 0} agent{needs ? '' : 's'} {needs ? 'needs' : 'need'} you
        </span>
        <span style={{marginLeft: 'auto', display: 'flex', gap: 8}}>
          {btn('repo ▾', {boxShadow: 'none'})}
          {btn('harness ▾', {boxShadow: 'none'})}
          {btn('Only needs you')}
          {btn('Crew')}
          {btn('Night shift')}
          {btn('Hire an agent', {background: AG.teal, color: '#fff'})}
        </span>
      </div>
      <div style={{...panel, margin: '12px 24px 0', padding: '8px 18px', fontSize: 13, display: 'flex', justifyContent: 'space-between'}}>
        {rivets}
        <span>▸ <b>While you were away</b> · 3 agents, 1 waiting on you</span>
        <span style={{color: AG.soft}}>2 commits landed</span>
      </div>
      <div style={{position: 'absolute', left: 0, top: 144, width: W, height: 560}}>
        {stages.map(([t, c], i) => {
          const count = (st === i ? 1 : 0) + (i === 1 ? 1 : 0);
          return (
            <div key={t} style={{position: 'absolute', left: colX(i), top: 0, width: colW, height: 540, background: AG.panel, border: `2px solid ${AG.ink}`, borderTop: `6px solid ${c}`}}>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderBottom: `2px solid ${AG.ink}`, fontFamily: BUNGEE, fontSize: 13, letterSpacing: '0.02em'}}>
                <span>{t}</span>
                <span style={{background: AG.ink, color: AG.paper, padding: '0 7px', fontFamily: SANS, fontSize: 12}}>{count}</span>
              </div>
            </div>
          );
        })}
        <div style={{position: 'absolute', left: colX(1) + 10, top: 56}}>
          {ticket('MAIN', 'main', 'agents', null)}
          {chip('kano', 'opencode', AG.opencode, '31%')}
        </div>
        <div style={{position: 'absolute', left: cardX, top: st === 1 ? 170 : 56}}>
          {ticket('AGENT/MIRA', 'agent/mira', 'billing-api', needs ? <span style={{background: AG.redDeep, color: '#fff', fontSize: 10, padding: '1px 6px', fontWeight: 700}}>needs you</span> : null, needs ? AG.red : AG.ink)}
          {chip('mira', 'codex', AG.codex, st === 0 ? '4%' : st === 1 ? '38%' : '62%', needs)}
          {st >= 2 && <div style={{fontSize: 11, color: AG.soft, marginTop: 5}}>2 unpushed</div>}
        </div>
      </div>
    </div>
  );
};

/* ---------- exports ---------- */

const SCENES = [
  {key: 'richmod', title: 'richmod · household finance', app: RichmodApp},
  {key: 'agenticform', title: 'agenticform · hub', app: AgenticformApp},
  {key: 'literouter', title: 'literouter · dashboard', app: LiterouterApp},
  {key: 'antares', title: 'antares · chat', app: AntaresApp},
  {key: 'sorot', title: 'sorot · studio', app: SorotApp},
  {key: 'agents', title: 'agents · board', app: AgentsApp},
];

export const UI_COUNT = SCENES.length;

export const UiProjectScene: React.FC<{
  index: number;
  name: string;
  say: string;
  lang: string;
  url: string;
}> = ({index, name, say, lang, url}) => {
  /* matched by name, so the project list and the scenes can't drift apart */
  const s = SCENES.find((x) => x.key === name);
  if (!s) throw new Error(`no UI scene for project "${name}"`);
  return (
    <UiScene index={index} total={SCENES.length} name={name} say={say} lang={lang} url={url} title={s.title}>
      {s.app}
    </UiScene>
  );
};
