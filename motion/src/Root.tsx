import React from 'react';
import {Composition, Series} from 'remotion';
import {AgentScene, CloseScene, OpenScene, ProjectScene, useFonts} from './scenes';
import {MECHANISMS, PROJECTS} from './data';

/* Scene durations in one list, at 30fps. 26.0s per piece. */
const FPS = 30;
const OPEN = 84; // 2.8s
const PROJECT = 76; // 2.53s
const MECHANISM = 102; // 3.4s
const CLOSE = 88; // 2.93s

const PROJECTS_FRAMES = OPEN + PROJECTS.length * PROJECT + CLOSE; // 780 = 26s
const AGENTS_FRAMES = OPEN + MECHANISMS.length * MECHANISM + CLOSE; // 780 = 26s

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
          sub="eight public repositories · newest last commit first"
        />
      </Series.Sequence>
      {PROJECTS.map((project, i) => (
        <Series.Sequence key={project.name} durationInFrames={PROJECT}>
          <ProjectScene index={i} total={PROJECTS.length} />
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
          eyebrow="agent integrations"
          line1="Six mechanisms."
          line2="Each one says what it"
          highlight="prevents"
          sub="no log · no timeline · no timestamps"
        />
      </Series.Sequence>
      {MECHANISMS.map((mechanism, i) => (
        <Series.Sequence key={mechanism.title} durationInFrames={MECHANISM}>
          <AgentScene index={i} total={MECHANISMS.length} />
        </Series.Sequence>
      ))}
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
