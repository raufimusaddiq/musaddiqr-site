import React from 'react';
import {Composition, Series} from 'remotion';
import {AgentScene, CloseScene, OpenScene, useFonts} from './scenes';
import {UiProjectScene} from './uiscenes';
import {FlowScene, FLOW_FRAMES} from './flow';
import {Flow3DScene, FLOW3D_FRAMES} from './flow3d';
import {PROJECTS} from './data';

/* Scene durations in one list, at 30fps. 26.0s per piece. */
const FPS = 60;
/* durations below are authored in 30fps frames; X scales them to the render fps */
const X = FPS / 30;
const OPEN = 84; // 2.8s
const PROJECT = 102; // 3.4s
const CLOSE = 88; // 2.93s

const PROJECTS_FRAMES = OPEN + PROJECTS.length * PROJECT + CLOSE; // 886 = 29.5s
const AGENTS_FRAMES = OPEN + FLOW_FRAMES + CLOSE; // 842 = 28s

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
          sub="seven public repositories"
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

const Agents3DVideo: React.FC = () => {
  useFonts();
  return (
    <Series>
      <Series.Sequence durationInFrames={(OPEN3) * X}>
        <OpenScene eyebrow="agent infrastructure" line1="Six mechanisms." line2="Each one says what it" highlight="prevents" sub="how work moves, and what stops it" />
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
    <Composition id="agents3d" component={Agents3DVideo} durationInFrames={(OPEN3 + FLOW3D_FRAMES + CLOSE3) * X} fps={FPS} width={1920} height={1080} />
  </>
);
