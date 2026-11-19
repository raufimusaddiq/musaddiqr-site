import React from 'react';
import {Composition, Series} from 'remotion';
import {AgentScene, CloseScene, OpenScene, useFonts} from './scenes';
import {UiProjectScene} from './uiscenes';
import {FlowScene, FLOW_FRAMES} from './flow';
import {Flow3DScene, FLOW3D_FRAMES} from './flow3d';
import {PROJECTS, REPO_LINE} from './data';

/* Scene durations in one list, at 30fps. */
const FPS = 60;
/* durations below are authored in 30fps frames; X scales them to the render fps */
const X = FPS / 30;
const OPEN = 84; // 2.8s
const PROJECT = 102; // 3.4s
const CLOSE = 88; // 2.93s

const PROJECTS_FRAMES = OPEN + PROJECTS.length * PROJECT + CLOSE; // 784 = 26.1s with six projects
const AGENTS_FRAMES = OPEN + FLOW_FRAMES + CLOSE; // 842 = 28s

/* running time for the title card, from the same 30fps frame counts */
const secs = (frames30: number) => `${Math.round(frames30 / 30)}s`;

const ProjectsVideo: React.FC = () => {
  useFonts();
  return (
    <Series>
      <Series.Sequence durationInFrames={(OPEN) * X}>
        <OpenScene
          eyebrow="projects"
          line1="Agents do the work."
          line2="I build what"
          highlight="holds them"
          sub={REPO_LINE}
          length={secs(PROJECTS_FRAMES)}
        />
      </Series.Sequence>
      {PROJECTS.map((project, i) => (
        <Series.Sequence key={project.name} durationInFrames={(PROJECT) * X}>
          <UiProjectScene index={i} name={project.name} say={project.say} lang={project.lang} url={project.url} />
        </Series.Sequence>
      ))}
      <Series.Sequence durationInFrames={(CLOSE) * X}>
        <CloseScene
          title="I build what holds them."
          sub="musaddiqr.com · agents do the work"
          accent="#ff6fae"
        />
      </Series.Sequence>
    </Series>
  );
};

const AgentsVideo: React.FC = () => {
  useFonts();
  return (
    <Series>
      <Series.Sequence durationInFrames={(OPEN) * X}>
        <OpenScene
          eyebrow="agent infrastructure"
          line1="Six mechanisms."
          line2="Each one says what it"
          highlight="prevents"
          sub="how work moves, and what stops it"
          length={secs(AGENTS_FRAMES)}
          size={108}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={(FLOW_FRAMES) * X}>
        <FlowScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={(CLOSE) * X}>
        <CloseScene
          title="I build what holds them."
          sub="musaddiqr.com · agents do the work"
          accent="#ffd42e"
        />
      </Series.Sequence>
    </Series>
  );
};

/* the 3D piece runs slower: ~52.7s */
const OPEN3 = 120;
const CLOSE3 = 120;
const AGENTS3D_FRAMES = OPEN3 + FLOW3D_FRAMES + CLOSE3;

const Agents3DVideo: React.FC = () => {
  useFonts();
  return (
    <Series>
      <Series.Sequence durationInFrames={(OPEN3) * X}>
        <OpenScene eyebrow="agent infrastructure" line1="Six mechanisms." line2="Each one says what it" highlight="prevents" sub="how work moves, and what stops it" length={secs(AGENTS3D_FRAMES)} size={108} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={(FLOW3D_FRAMES) * X}>
        <Flow3DScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={(CLOSE3) * X}>
        <CloseScene title="I build what holds them." sub="musaddiqr.com · agents do the work" accent="#ffd42e" />
      </Series.Sequence>
    </Series>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="projects"
      component={ProjectsVideo}
      durationInFrames={(PROJECTS_FRAMES) * X}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="agents"
      component={AgentsVideo}
      durationInFrames={(AGENTS_FRAMES) * X}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition id="agents3d" component={Agents3DVideo} durationInFrames={(AGENTS3D_FRAMES) * X} fps={FPS} width={1920} height={1080} />
  </>
);
