import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {PROJECTS, MECHANISMS} from './data';

/* tokens: antares geometry, cream canvas */
const C = {
  canvas: '#f4f1e8',
  rail: '#e9e4d4',
  card: '#ffffff',
  ink: '#0b0b0b',
  ink2: '#4f4a40',
  pink: '#ff6fae',
  sun: '#ffd42e',
  cobalt: '#2d4bff',
  mint: '#7bffbf',
  rSm: 8,
  rMd: 14,
  rLg: 20,
  rPill: 999,
};

const FILLS = [C.pink, C.sun, C.cobalt, C.mint];
const fillFor = (i: number) => FILLS[i % FILLS.length];
const inkOn = (c: string) => (c === C.cobalt ? '#ffffff' : C.ink);

const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E")`;

const MONO = `'Space Grotesk', system-ui, sans-serif`;
const SANS = `'Space Grotesk', system-ui, sans-serif`;

/* fonts: bundled woff2, loaded before the first frame.
   Space Grotesk is not installed on this host; without this it silently
   renders DejaVu and every rounded card looks wrong. */
export const useFonts = () => {
  const [handle] = useState(() => delayRender('loading bundled fonts'));
  useEffect(() => {
    const faces = [
      new FontFace('Space Grotesk', `url(${staticFile('fonts/space-grotesk-latin.woff2')})`, {weight: '300 700'}),
    ];
    Promise.all(faces.map((face) => face.load().then((loaded) => document.fonts.add(loaded))))
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

/* time in 30fps frames, whatever the composition's fps: every timing in these scenes
   was authored at 30fps, so a 60fps render keeps the same speed with twice the frames */
export const useT = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (frame * 30) / fps;
};

/* frame */
const Header: React.FC<{left: string; right: string}> = ({left, right}) => (
  <div
    style={{
      position: 'absolute',
      top: 56,
      left: 120,
      right: 120,
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: MONO,
      fontSize: 22,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: C.ink2,
    }}
  >
    <span>{left}</span>
    <span>{right}</span>
  </div>
);

const Footer: React.FC<{text: string}> = ({text}) => (
  <div
    style={{
      position: 'absolute',
      bottom: 52,
      left: 120,
      right: 120,
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: MONO,
      fontSize: 20,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: C.ink2,
    }}
  >
    <span>{text}</span>
    <span>musaddiqr.com</span>
  </div>
);

export const Frame: React.FC<{
  left: string;
  right: string;
  footer: string;
  children: React.ReactNode;
}> = ({left, right, footer, children}) => (
  <AbsoluteFill style={{backgroundColor: C.canvas, fontFamily: SANS, color: C.ink}}>
    <AbsoluteFill style={{backgroundImage: GRAIN, opacity: 0.12}} />
    <Header left={left} right={right} />
    {children}
    <Footer text={footer} />
  </AbsoluteFill>
);

/* motion helpers */
const useIn = (start = 0, dur = 16) => {
  const f = useT();
  return interpolate(f, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

const rise = (p: number, px = 42) => ({
  opacity: p,
  transform: `translateY(${(1 - p) * px}px)`,
});

/* scenes */
export const OpenScene: React.FC<{
  eyebrow: string;
  line1: string;
  line2: string;
  highlight: string;
  sub: string;
}> = ({eyebrow, line1, line2, highlight, sub}) => {
  const a = useIn(0, 18);
  const b = useIn(10, 18);
  const c = useIn(22, 18);
  return (
    <Frame left={eyebrow} right="26s" footer="agents do the work">
      <div style={{position: 'absolute', left: 120, right: 120, top: 300}}>
        <div style={{...rise(b), fontSize: 116, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.06}}>
          {line1}
        </div>
        <div style={{...rise(b), fontSize: 116, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.06}}>
          {line2}{' '}
          <span
            style={{
              display: 'inline-block',
              background: C.pink,
              border: `2px solid ${C.ink}`,
              borderRadius: C.rMd,
              padding: '0 22px 8px',
              boxShadow: `6px 6px 0 ${C.ink}`,
            }}
          >
            {highlight}
          </span>
          .
        </div>
        <div
          style={{
            ...rise(c, 24),
            marginTop: 56,
            fontFamily: MONO,
            fontSize: 26,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: C.ink2,
          }}
        >
          {sub}
        </div>
        <div
          style={{
            marginTop: 40,
            height: 3,
            width: 260 * a,
            background: C.ink,
          }}
        />
      </div>
    </Frame>
  );
};

export const ProjectScene: React.FC<{index: number; total: number}> = ({index, total}) => {
  const p = PROJECTS[index];
  const f = useT();
  const fps = 30;
  const card = spring({frame: f - 4, fps, config: {damping: 200, mass: 0.7}});
  const t1 = useIn(10, 14);
  const t2 = useIn(18, 14);
  const t3 = useIn(26, 14);
  const fill = fillFor(index);

  return (
    <Frame
      left="projects"
      right={`${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`}
      footer="seven public repositories"
    >
      <div style={{position: 'absolute', inset: '140px 120px 110px', display: 'flex', alignItems: 'center'}}>
      <div
        style={{
          width: '100%',
          background: C.card,
          border: `2px solid ${C.ink}`,
          borderRadius: C.rLg,
          boxShadow: `6px 6px 0 ${C.ink}`,
          padding: '64px 72px 56px',
          opacity: card,
          transform: `translateY(${(1 - card) * 70}px)`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
          <span
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 64,
              height: 64,
              borderRadius: C.rPill,
              background: fill,
              color: inkOn(fill),
              border: `2px solid ${C.ink}`,
              fontFamily: MONO,
              fontSize: 20,
              fontWeight: 700,
              flex: 'none',
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <div style={{fontSize: 104, fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 1}}>
            {p.name}
          </div>
        </div>

        <p
          style={{
            ...rise(t1, 24),
            marginTop: 40,
            fontSize: 40,
            lineHeight: 1.35,
            color: C.ink2,
            maxWidth: 1420,
          }}
        >
          {p.say}
        </p>

        <div
          style={{
            ...rise(t2, 20),
            marginTop: 52,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            fontFamily: MONO,
          }}
        >
          {p.lang ? (
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                border: `2px solid ${C.ink}`,
                borderRadius: C.rPill,
                padding: '10px 22px',
                background: fill,
                color: inkOn(fill),
              }}
            >
              {p.lang}
            </span>
          ) : null}
          <span style={{fontSize: 22, color: C.ink2, letterSpacing: '0.08em'}}>{p.vis}</span>
          <span style={{flex: 1, height: 2, background: C.rail}} />
          <span style={{...rise(t3), fontSize: 22, color: C.ink2, letterSpacing: '0.02em'}}>{p.url}</span>
        </div>
      </div>
      </div>
    </Frame>
  );
};

export const AgentScene: React.FC<{index: number; total: number}> = ({index, total}) => {
  const m = MECHANISMS[index];
  const f = useT();
  const fps = 30;
  const card = spring({frame: f - 4, fps, config: {damping: 200, mass: 0.7}});
  const t1 = useIn(10, 14);
  const t2 = useIn(18, 14);
  const fill = fillFor(index);

  return (
    <Frame
      left="agent integrations"
      right={`${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`}
      footer="six mechanisms"
    >
      <div style={{position: 'absolute', inset: '140px 120px 110px', display: 'flex', alignItems: 'center'}}>
      <div
        style={{
          width: '100%',
          background: C.card,
          border: `2px solid ${C.ink}`,
          borderRadius: C.rLg,
          boxShadow: `6px 6px 0 ${C.ink}`,
          padding: '64px 72px 60px',
          opacity: card,
          transform: `translateY(${(1 - card) * 70}px)`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 28}}>
          <span
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 64,
              height: 64,
              borderRadius: C.rPill,
              background: fill,
              color: inkOn(fill),
              border: `2px solid ${C.ink}`,
              fontFamily: MONO,
              fontSize: 20,
              fontWeight: 700,
              flex: 'none',
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <h2
            style={{
              fontSize: m.title.length > 30 ? 76 : 92,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              maxWidth: 1400,
            }}
          >
            {m.title}
          </h2>
        </div>

        <p
          style={{
            ...rise(t1, 24),
            marginTop: 40,
            fontSize: 38,
            lineHeight: 1.4,
            color: C.ink2,
            maxWidth: 1480,
          }}
        >
          {m.say}
        </p>

        <div
          style={{
            ...rise(t2, 20),
            marginTop: 44,
            borderTop: `2px solid ${C.ink}`,
            paddingTop: 26,
            display: 'flex',
            gap: 18,
            alignItems: 'baseline',
            fontFamily: MONO,
            fontSize: 25,
            lineHeight: 1.45,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              fontSize: 20,
              background: fill,
              color: inkOn(fill),
              border: `2px solid ${C.ink}`,
              borderRadius: C.rPill,
              padding: '8px 18px',
              flex: 'none',
            }}
          >
            prevents
          </span>
          <span>{m.prevents}</span>
        </div>
      </div>
      </div>
    </Frame>
  );
};

export const CloseScene: React.FC<{sub: string; title: string; accent: string}> = ({sub, title, accent}) => {
  const a = useIn(0, 18);
  const b = useIn(12, 18);
  const c = useIn(22, 18);
  return (
    <Frame left="musaddiqr.com" right="2026" footer="built to hold">
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <div style={{...rise(a), fontSize: 96, fontWeight: 700, letterSpacing: '-0.04em'}}>{title}</div>
        <div style={{marginTop: 30, height: 6, width: 180 * b, background: accent, border: `2px solid ${C.ink}`, borderRadius: C.rPill}} />
        <div
          style={{
            ...rise(c, 18),
            marginTop: 30,
            fontFamily: MONO,
            fontSize: 24,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: C.ink2,
          }}
        >
          {sub}
        </div>
      </div>
    </Frame>
  );
};
