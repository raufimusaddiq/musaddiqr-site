/* Content for both compositions. Copy comes from the page; no figure here is a
   measurement, and nothing here is an event in time. */

export const PROJECTS = [
  {name: 'richmod', say: 'Household finance dashboard. Go + React + Postgres, containerised, deployed through CI.', lang: 'Go', year: '2026', url: 'github.com/raufimusaddiq/richmod'},
  {name: 'literouter', say: 'A lighter router over many LLM providers, forked from 9router and reworked.', lang: 'JavaScript', year: '2026', url: 'github.com/raufimusaddiq/literouter'},
  {name: 'routeweft', say: 'A routing control plane, in parity tracking against the router it replaces.', lang: 'Go', year: '2026', url: 'github.com/raufimusaddiq/routeweft'},
  {name: 'antares', say: 'Google-authenticated chat UI for a deployed agent, per-user private profile binding.', lang: 'Go', year: '2026', url: 'github.com/raufimusaddiq/antares'},
  {name: 'sorot', say: 'Long video to vertical 9:16 clips with word-timed captions, for Indonesian short-form.', lang: 'TypeScript', year: '2026', url: 'github.com/raufimusaddiq/sorot'},
  {name: 'agenticform', say: 'Control plane for orchestrating coding agents across projects, tasks and reviews.', lang: 'Java', year: '2026', url: 'github.com/raufimusaddiq/agenticform'},
  {name: 'agents', say: 'The agent UI and its terminal-multiplexer wrapper.', lang: 'Python', year: '2026', url: 'github.com/raufimusaddiq/agents'},
  {name: 'raufimusaddiq', say: 'The GitHub profile itself, as a small card.', lang: '', year: '2026', url: 'github.com/raufimusaddiq'},
];

export const MECHANISMS = [
  {
    title: 'Agent-to-agent handoff',
    say: 'One agent passes a piece of work to another through a call that carries its own context and its own chat, so the receiving agent starts with the whole brief and answers in the same thread.',
    prevents: 'work arriving as a bare sentence with the reasoning stripped off.',
  },
  {
    title: 'Missions',
    say: 'A multi-ticket job runs inside one worktree, in its own turns, for as long as it takes, instead of one ticket per invocation.',
    prevents: 'a long job dying halfway with its state only in a chat log.',
  },
  {
    title: 'Scheduled cron jobs',
    say: 'A job runs on a schedule and speaks only when something is wrong.',
    prevents: 'a silent failure being found by a person weeks later.',
  },
  {
    title: 'Delegation to a coding agent in its own terminal pane',
    say: 'Code is written by a coding agent with its own session and its own working tree, briefed by a lead that routes and verifies.',
    prevents: 'two agents editing one file, and a claim of “done” going unchecked.',
  },
  {
    title: 'The review gate',
    say: 'Every pull request is reviewed by a reviewer agent on the exact commit, findings go back to the authoring agent, fixes are batched into one commit per round, and nothing merges until the gate is satisfied.',
    prevents: 'an unreviewed change reaching a deployed service.',
  },
  {
    title: 'One owner per thing',
    say: 'Each piece of work is assigned to exactly one agent and one branch.',
    prevents: 'a merge conflict discovered at merge time.',
  },
];
