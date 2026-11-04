import React from 'react';
import {Composition, Series} from 'remotion';
import {AgentScene, CloseScene, OpenScene, useFonts} from './scenes';
import {UiProjectScene} from './uiscenes';
import {FlowScene, FLOW_FRAMES} from './flow';
import {PROJECTS} from './data';

/* Scene durations in one list, at 30fps. 26.0s per piece. */
const FPS = 30;
const OPEN = 84; // 2.8s
const PROJECT = 102; // 3.4s
const CLOSE = 88; // 2.93s

const PROJECTS_FRAMES = OPEN + PROJECTS.length * PROJECT + CLOSE; // 886 = 29.5s
const AGENTS_FRAMES = OPEN + FLOW_FRAMES + CLOSE; // 842 = 28s

const ProjectsVideo: React.FC = () => {
  useFonts();
  return (
    <Series>
      <Series.Sequence durationInFrames={OPEN}>
        <OpenScene
          eyebrow="projects"
          line1="Agents do the work."
          line2="I build what"
          highlight="holds them"
          sub="seven public repositories"
        />
      </Series.Sequence>
      {PROJECTS.map((project, i) => (
        <Series.Sequence key={project.name} durationInFrames={PROJECT}>
          <UiProjectScene index={i} name={project.name} say={project.say} lang={project.lang} url={project.url} />
        </Series.Sequence>
      ))}
      <Series.Sequence durationInFrames={CLOSE}>
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
      <Series.Sequence durationInFrames={OPEN}>
        <OpenScene
          eyebrow="agent infrastructure"
          line1="Six mechanisms."
          line2="Each one says what it"
          highlight="prevents"
          sub="how work moves, and what stops it"
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={FLOW_FRAMES}>
        <FlowScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={CLOSE}>
        <CloseScene
          title="I build what holds them."
          sub="musaddiqr.com · agents do the work"
          accent="#ffd42e"
        />
      </Series.Sequence>
    </Series>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="projects"
      component={ProjectsVideo}
      durationInFrames={PROJECTS_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="agents"
      component={AgentsVideo}
      durationInFrames={AGENTS_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
);
