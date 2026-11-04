import React from 'react';
import {Easing, interpolate} from 'remotion';
import {Frame, useT} from './scenes';

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
      footer="seven public repositories"
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

/* ---------- 2. agenticform (from web/src/styles.css, approvals.css, App.tsx: dark CRT, square, red accent) ---------- */

const AF = {bg: '#0a0a0a', deep: '#070707', panel: '#101010', panel2: '#151515', panel3: '#1a1a1a', ink: '#eaeaea', dim: '#a3a3a3', faint: '#6d6d6d', line: '#2a2a2a', strong: '#3d3d3d', red: '#e61919', amber: '#e6b35c', green: '#4af626'};
const HEAD = `'Archivo Black', 'Helvetica Neue', Helvetica, Arial, sans-serif`;

const AgenticformApp = (f: number) => {
  const sel = pf(f, 10, 14) > 0.5;
  const press = f > 54 && f < 60;
  const approved = f >= 60;
  const hist = pf(f, 64, 74);
  const pending = approved ? 1 : 2;
  const cap = (t: string) => <div style={{fontSize: 10, letterSpacing: '0.2em', color: AF.faint, padding: '16px 18px 6px'}}>[{t}]</div>;
  const nav = (t: string, active = false, count?: number) => (
    <div style={{display: 'flex', justifyContent: 'space-between', padding: '7px 18px', fontSize: 13, background: active ? AF.red : 'transparent', color: active ? '#fff' : AF.dim, fontWeight: active ? 700 : 400, borderLeft: `3px solid ${active ? '#fff' : 'transparent'}`}}>
      <span>{active ? '# ' : ''}{t}</span>
      {count ? <span style={{color: active ? '#fff' : AF.amber}}>{count}</span> : null}
    </div>
  );
  const pill = (label: string, c: string) => (
    <span style={{fontSize: 11, letterSpacing: '0.06em', color: c}}>
      <span style={{color: AF.strong}}>&lt;</span>
      <span style={{display: 'inline-block', width: 7, height: 7, background: c, margin: '0 5px 1px 3px'}} />
      {label}
      <span style={{color: AF.strong}}>&gt;</span>
    </span>
  );
  const th: React.CSSProperties = {textAlign: 'left', fontSize: 10, letterSpacing: '0.16em', color: AF.faint, padding: '8px 12px', background: AF.deep, borderBottom: `1px solid ${AF.strong}`, fontWeight: 400};
  const td: React.CSSProperties = {padding: '11px 12px', fontSize: 12.5, borderBottom: `1px solid ${AF.line}`};
  const row = (name: string, agent: string, proj: string, risk: string, riskC: string, status: string, stC: string, selected: boolean) => (
    <tr style={{background: selected ? AF.panel3 : 'transparent', boxShadow: selected ? `inset 3px 0 0 ${AF.red}` : 'none'}}>
      <td style={td}>{name}</td>
      <td style={{...td, color: AF.dim}}>{agent}</td>
      <td style={{...td, color: AF.dim}}>{proj}</td>
      <td style={{...td, color: riskC}}>{risk}</td>
      <td style={td}>{pill(status, stC)}</td>
    </tr>
  );
  const kv = (k: string, v: React.ReactNode) => (
    <div style={{display: 'flex', gap: 12, fontSize: 12, padding: '5px 0', borderBottom: `1px solid ${AF.line}`}}>
      <span style={{width: 120, color: AF.faint, letterSpacing: '0.04em'}}>{k}</span>
      <span style={{flex: 1}}>{v}</span>
    </div>
  );
  return (
    <div style={{display: 'flex', width: W, height: H, background: AF.bg, fontFamily: MONO, color: AF.ink, position: 'relative'}}>
      <div style={{width: 212, background: AF.deep, borderRight: `2px solid ${AF.strong}`, display: 'flex', flexDirection: 'column'}}>
        <div style={{padding: '18px 18px 8px'}}>
          <div style={{fontFamily: HEAD, fontWeight: 900, textTransform: 'uppercase', fontSize: 19, letterSpacing: '-0.04em'}}>Agenticform</div>
          <div style={{fontSize: 10, color: AF.faint, marginTop: 4, letterSpacing: '0.14em'}}>Unit / CP-01</div>
        </div>
        {cap('Workspace')}
        {nav('Overview')}
        {nav('Projects')}
        {nav('Agents')}
        {nav('Tasks')}
        {cap('Supervision')}
        {nav('Messages')}
        {nav('Operations')}
        {nav('Approvals', true, pending)}
        {nav('Policy')}
        <div style={{marginTop: 'auto', padding: '14px 18px', borderTop: `1px solid ${AF.line}`, fontSize: 11}}>
          <div style={{color: AF.faint, letterSpacing: '0.14em', fontSize: 10}}>CONTROL PLANE</div>
          <div style={{marginTop: 4}}>Connected</div>
        </div>
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: 'flex', alignItems: 'center', padding: '16px 22px', borderBottom: `2px solid ${AF.strong}`}}>
          <div>
            <div style={{fontSize: 11, color: AF.red, letterSpacing: '0.1em'}}>/// All projects</div>
            <div style={{fontFamily: HEAD, fontWeight: 900, textTransform: 'uppercase', fontSize: 34, letterSpacing: '-0.05em', lineHeight: 0.95, marginTop: 4}}>Approvals</div>
          </div>
          <div style={{marginLeft: 'auto', display: 'flex', gap: 8, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase'}}>
            <span style={{border: `1px solid ${AF.strong}`, padding: '7px 10px'}}>All projects ▾</span>
            <span style={{border: `1px solid ${AF.strong}`, padding: '7px 10px'}}>Execution nodes</span>
            <span style={{border: `1px solid ${AF.strong}`, padding: '7px 10px'}}>New task</span>
            <span style={{background: AF.red, color: '#fff', padding: '8px 12px', fontWeight: 700}}>Spawn agent</span>
          </div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${AF.strong}`}}>
          <div style={{padding: '11px 22px', fontSize: 11.5, lineHeight: 1.5, color: AF.dim, borderRight: `1px solid ${AF.line}`}}>
            <b style={{color: AF.ink}}>Human-in-the-loop</b> Tightens configured ALLOW decisions into one-shot human review. DENY can never be weakened.
          </div>
          <div style={{padding: '11px 22px', fontSize: 11.5, lineHeight: 1.5, color: AF.dim}}>
            <b style={{color: AF.ink}}>Human-on-the-loop</b> Deterministic policy decides: ALLOW continues, REQUIRE HUMAN stops here, and DENY is rejected without an override.
          </div>
        </div>
        <div style={{display: 'flex', borderBottom: `1px solid ${AF.strong}`}}>
          <div style={{flex: 1.5, borderRight: `1px solid ${AF.strong}`}}>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: AF.panel2, borderBottom: `1px solid ${AF.strong}`, fontSize: 13, fontWeight: 700}}>
              <span><span style={{color: AF.red}}>[ ]</span> Pending decisions</span>
              <span style={{color: AF.amber}}>{pending}</span>
            </div>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr>
                  {['REQUEST', 'AGENT', 'PROJECT', 'RISK', 'STATUS'].map((h) => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!approved && row('Apply migration 0042 to production', 'mira', 'billing-api', 'high', AF.red, 'Needs approval', AF.amber, sel)}
                {row('Install dependency left-pad@1.3', 'kano', 'web-app', 'elevated', AF.amber, 'Needs approval', AF.amber, false)}
              </tbody>
            </table>
          </div>
          <div style={{flex: 1, padding: '12px 16px', background: AF.panel2, minHeight: 330}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
              <b style={{fontSize: 14}}>{approved ? 'Apply migration 0042' : 'Apply migration 0042 to production'}</b>
              <span style={{fontSize: 11, color: AF.red, border: `1px solid ${AF.red}`, padding: '1px 6px'}}>high</span>
            </div>
            <div style={{fontSize: 11, color: AF.faint, margin: '3px 0 8px'}}>billing-api / mira</div>
            {kv('Policy action', 'Require human')}
            {kv('Matched rule', 'destructive-schema-change')}
            {kv('Requested action', 'Run database migration')}
            {kv('Working directory', '/srv/billing-api')}
            <div style={{borderLeft: `6px solid ${AF.red}`, background: AF.deep, padding: '8px 12px', margin: '10px 0', fontSize: 12, minHeight: 36}}>{typed('psql -f 0042_add_settled_at.sql', f, 14, 1.3)}</div>
            <div style={{display: 'flex', gap: 8, opacity: approved ? 0.3 : 1}}>
              <span style={{background: AF.red, color: '#fff', padding: '8px 14px', fontSize: 11, letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase', transform: press ? 'scale(0.96)' : 'none'}}>Approve once</span>
              <span style={{border: `1px solid ${AF.red}`, color: AF.red, padding: '8px 14px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase'}}>Decline</span>
            </div>
            {approved && <div style={{marginTop: 10, fontSize: 12, color: AF.ink}}>{pill('approved', AF.ink)} <span style={{color: AF.dim}}>once · agent resumes</span></div>}
          </div>
        </div>
        <div style={{padding: '10px 14px', background: AF.panel2, fontSize: 13, fontWeight: 700, borderBottom: `1px solid ${AF.strong}`}}>
          <span style={{color: AF.red}}>[ ]</span> Decision history
        </div>
        {approved && (
          <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '9px 14px', fontSize: 12, borderBottom: `1px solid ${AF.line}`, opacity: hist, transform: `translateY(${(1 - hist) * -10}px)`, background: AF.panel3}}>
            <span style={{flex: 1}}>Apply migration 0042 <span style={{color: AF.faint}}>billing-api / mira</span></span>
            <span style={{color: AF.red}}>high</span>
            <span style={{border: `1px solid ${AF.strong}`, padding: '0 6px', fontSize: 10}}>REQUIRE_HUMAN</span>
            {pill('approved', AF.ink)}
          </div>
        )}
        {[
          ['Run unit test suite', 'billing-api / mira', 'low', 'ALLOW', 'Auto approved'],
          ['Push branch agent/mira', 'web-app / kano', 'elevated', 'REQUIRE_HUMAN', 'approved'],
        ].map(([a, b, c, d, e]) => (
          <div key={a} style={{display: 'flex', alignItems: 'center', gap: 14, padding: '9px 14px', fontSize: 12, borderBottom: `1px solid ${AF.line}`, color: AF.dim}}>
            <span style={{flex: 1, color: AF.ink}}>{a} <span style={{color: AF.faint}}>{b}</span></span>
            <span>{c}</span>
            <span style={{border: `1px solid ${AF.strong}`, padding: '0 6px', fontSize: 10}}>{d}</span>
            <span style={{fontSize: 11}}>{e}</span>
          </div>
        ))}
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

/* ---------- 4. routeweft (from ui/src/style.css, main.tsx, Combos.tsx: black rail, pink slab, hard shadows) ---------- */

const RW = {paper: '#f7f6f0', ink: '#111111', pink: '#ff5fa2', yellow: '#ffd60a', surface: '#ffffff', surface2: '#ecebe3', sub: '#d4d2c8', muted: '#45443f', ok: '#0b6b2e', warn: '#7a5200', rail: '#111111', railText: '#f7f6f0', railMuted: '#c9c7bd'};

const RouteweftApp = (f: number) => {
  const groups: [string, string[]][] = [
    ['Operate', ['Overview', 'Endpoint & Key', 'Providers']],
    ['Route', ['Combo & Capability Adapter', 'System One']],
    ['Observe', ['Usage', 'Quota Tracker', 'Token Saver']],
    ['System', ['Console Log', 'Settings']],
  ];
  const typedModel = typed('openai/gpt-4o-mini', f, 8, 1.4);
  const added = f >= 34;
  const pressAdd = f > 30 && f < 34;
  const saved = f >= 74;
  const pressSave = f > 68 && f < 74;
  const members: [string, string][] = [
    ['anthropic/claude-haiku', 'Selected'],
    ['google/gemini-flash', 'Selected'],
    ['groq/llama-3.3-70b', 'Deselected'],
  ];
  const all: [string, string][] = added ? [...members, ['openai/gpt-4o-mini', 'Selected']] : members;
  const pillBtn = (t: string, extra: React.CSSProperties = {}) => (
    <span style={{border: `2px solid ${RW.ink}`, borderRadius: 999, padding: '3px 12px', fontSize: 12, fontWeight: 600, background: RW.surface, ...extra}}>{t}</span>
  );
  const tag = (t: string, bg = RW.surface, rot = -3) => (
    <span style={{fontFamily: MONO, fontSize: 10, fontWeight: 700, border: `2px solid ${RW.ink}`, borderRadius: 999, padding: '1px 8px', background: bg, transform: `rotate(${rot}deg)`, display: 'inline-block'}}>{t}</span>
  );
  return (
    <div style={{display: 'flex', width: W, height: H, background: RW.paper, fontFamily: SANS, color: RW.ink}}>
      <div style={{width: 200, background: RW.rail, color: RW.railText, borderRight: `3px solid ${RW.railText}`, padding: '16px 12px', display: 'flex', flexDirection: 'column'}}>
        <div style={{padding: '0 8px 10px'}}>
          <div style={{fontSize: 17, fontWeight: 700}}>Routeweft</div>
          <div style={{fontSize: 9, letterSpacing: '0.18em', color: RW.railMuted, marginTop: 2}}>CONTROL PLANE</div>
        </div>
        {groups.map(([g, items]) => (
          <div key={g} style={{marginTop: 12}}>
            <div style={{fontFamily: MONO, fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', color: RW.railMuted, padding: '0 8px 4px'}}>{g}</div>
            {items.map((it) => {
              const act = it.startsWith('Combo');
              return (
                <div key={it} style={{height: 30, display: 'flex', alignItems: 'center', padding: '0 12px', borderRadius: 999, fontSize: 12, marginBottom: 2, background: act ? RW.yellow : 'transparent', color: act ? RW.ink : RW.railText, fontWeight: act ? 700 : 400, borderLeft: act ? `2px solid ${RW.ink}` : 'none', whiteSpace: 'nowrap', overflow: 'hidden'}}>
                  {it}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{flex: 1, minWidth: 0, padding: '20px 26px'}}>
        <div style={{background: RW.pink, border: `3px solid ${RW.ink}`, borderRadius: 32, boxShadow: `10px 6px 0 ${RW.ink}`, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14}}>
          <span style={{fontSize: 15, fontWeight: 700}}>{saved ? '3' : '3'} Combo(s)</span>
          <span style={{marginLeft: 'auto', display: 'flex', gap: 10}}>
            <span style={{background: RW.ink, color: RW.paper, border: `3px solid ${RW.ink}`, borderRadius: 999, padding: '6px 18px', fontWeight: 700, fontSize: 14, boxShadow: `5px 3px 0 rgba(17,17,17,0.35)`}}>New Combo</span>
            <span style={{background: RW.surface, border: `3px solid ${RW.ink}`, borderRadius: 999, padding: '6px 18px', fontWeight: 700, fontSize: 14, boxShadow: `5px 3px 0 ${RW.ink}`}}>Refresh</span>
          </span>
        </div>
        {saved && (
          <div style={{marginTop: 12, border: `2px solid ${RW.ink}`, background: '#d9f2e0', padding: '7px 14px', fontSize: 13, fontWeight: 600, opacity: pf(f, 74, 82)}}>Combo updated.</div>
        )}
        <div style={{display: 'flex', gap: 22, marginTop: saved ? 12 : 54}}>
          <div style={{width: 300}}>
            {[
              ['fast-chat', `${all.filter((m) => m[1] === 'Selected').length} selected · ${all.length} members`, 'fallback', true],
              ['long-context', '2 selected · 2 members', 'round-robin', false],
              ['vision', '1 selected · 1 member', 'fallback', false],
            ].map(([n, sub, st, cur]) => (
              <div key={n as string} style={{border: `2px solid ${RW.ink}`, background: cur ? RW.surface2 : RW.surface, padding: '12px 14px', marginBottom: 10}}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <b style={{fontSize: 17}}>{n as string}</b>
                  {tag(st as string)}
                </div>
                <div style={{fontSize: 12, color: RW.muted, margin: '4px 0 8px'}}>{sub as string}</div>
                <div style={{display: 'flex', gap: 8}}>
                  {pillBtn('Edit')}
                  {pillBtn('Delete', {color: '#b0001a', borderColor: '#b0001a'})}
                </div>
              </div>
            ))}
          </div>
          <div style={{flex: 1, border: `2px solid ${RW.ink}`, background: RW.surface, padding: '16px 20px', minWidth: 0}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <div style={{fontSize: 22, fontWeight: 700}}>Edit Combo</div>
                <div style={{fontSize: 12, color: RW.muted, marginTop: 2}}>Ordered members route first-to-last; deselecting keeps a member without routing it.</div>
              </div>
              {pillBtn('Close')}
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '14px 0'}}>
              {[
                ['Name', 'fast-chat'],
                ['Strategy', 'Ordered fallback'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{fontSize: 11, fontWeight: 700, marginBottom: 3}}>{k}</div>
                  <div style={{border: `2px solid ${RW.ink}`, padding: '6px 10px', fontSize: 13}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{display: 'flex', gap: 10}}>
              <div style={{flex: 1, border: `2px solid ${RW.ink}`, padding: '7px 10px', fontSize: 13, fontFamily: MONO, minHeight: 20}}>
                {added ? <span style={{color: '#777'}}>provider/model, alias or Combo name</span> : typedModel || <span style={{color: '#777'}}>provider/model, alias or Combo name</span>}
                {!added && typedModel.length > 0 && typedModel.length < 18 && <span style={{opacity: Math.floor(f / 5) % 2}}>▍</span>}
              </div>
              <span style={{background: RW.ink, color: RW.paper, border: `3px solid ${RW.ink}`, borderRadius: 999, padding: '5px 16px', fontWeight: 700, fontSize: 13, transform: pressAdd ? 'translate(3px,3px)' : 'none'}}>Add member</span>
            </div>
            <div style={{marginTop: 12}}>
              {all.map(([m, st], i) => {
                const fresh = added && i === all.length - 1;
                const p1 = fresh ? pf(f, 34, 44) : 1;
                return (
                  <div key={m} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 4px', borderTop: `1px solid ${RW.sub}`, opacity: (st === 'Deselected' ? 0.66 : 1) * p1, transform: `translateY(${(1 - p1) * 10}px)`}}>
                    <span style={{width: 26, height: 26, border: `2px solid ${RW.ink}`, display: 'grid', placeItems: 'center', fontFamily: MONO, fontSize: 12, fontWeight: 700}}>{i + 1}</span>
                    <span style={{fontFamily: MONO, fontSize: 13, flex: 1}}>{m}</span>
                    {tag(st, st === 'Selected' ? '#bfeccf' : '#ffe08a', 0)}
                    <span style={{fontSize: 13}}>↑ ↓</span>
                    {pillBtn(st === 'Selected' ? 'Deselect' : 'Select')}
                    {pillBtn('Remove', {color: '#b0001a', borderColor: '#b0001a'})}
                  </div>
                );
              })}
            </div>
            <div style={{marginTop: 12}}>
              <span style={{display: 'inline-block', background: RW.pink, border: `3px solid ${RW.ink}`, borderRadius: 999, padding: '7px 22px', fontWeight: 700, fontSize: 14, boxShadow: pressSave ? 'none' : `5px 3px 0 ${RW.ink}`, transform: pressSave ? 'translate(5px,3px)' : 'none'}}>{saved ? 'Save Combo' : 'Save Combo'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- 5. antares (from web/src/styles.css + Chat.tsx: cream paper, 3px ink, hard shadows) ---------- */

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

/* ---------- 6. sorot (from frontend/src/app/studio + tailwind tokens: pink desktop, cream windows, 3px black) ---------- */

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

/* ---------- 7. agents (from web/src/index.css + components: paper, 2px ink, square, rivets, graph-paper) ---------- */

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
  {key: 'agenticform', title: 'agenticform · approvals', app: AgenticformApp},
  {key: 'literouter', title: 'literouter · dashboard', app: LiterouterApp},
  {key: 'routeweft', title: 'routeweft · operator console', app: RouteweftApp},
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
  const s = SCENES[index];
  return (
    <UiScene index={index} total={SCENES.length} name={name} say={say} lang={lang} url={url} title={s.title}>
      {s.app}
    </UiScene>
  );
};
