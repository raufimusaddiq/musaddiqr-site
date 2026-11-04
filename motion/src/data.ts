/* Content for both compositions. Copy comes from the page; no figure here is a
   measurement, and nothing here is an event in time. */

export const PROJECTS = [
  {name: 'richmod', say: 'Self-hosted household finance system. Emails, Telegram messages and documents become an auditable ledger; the model interprets evidence, deterministic code owns the financial state.', lang: 'Go', vis: 'Public', url: 'github.com/raufimusaddiq/richmod'},
  {name: 'agenticform', say: 'Control plane for coding agents across projects, tasks and reviews, with approvals, policy gates and isolated workspaces.', lang: 'Java', vis: 'Public', url: 'github.com/raufimusaddiq/agenticform'},
  {name: 'literouter', say: 'A lighter router over many LLM providers, forked from 9router and reworked.', lang: 'JavaScript', vis: 'Public', url: 'github.com/raufimusaddiq/literouter'},
  {name: 'routeweft', say: 'Routing control plane, tracked for behavioural parity against the router it replaces.', lang: 'Go', vis: 'Public', url: 'github.com/raufimusaddiq/routeweft'},
  {name: 'antares', say: 'Google-authenticated chat UI for a deployed agent, with a private profile bound to each user.', lang: 'Go', vis: 'Public', url: 'github.com/raufimusaddiq/antares'},
  {name: 'sorot', say: 'Turns long videos into vertical 9:16 clips with word-timed captions, built for Indonesian short-form.', lang: 'TypeScript', vis: 'Public', url: 'github.com/raufimusaddiq/sorot'},
  {name: 'agents', say: 'Agent UI with a wrapper around the terminal multiplexer the agents run in.', lang: 'Python', vis: 'Public', url: 'github.com/raufimusaddiq/agents'},
];

export const MECHANISMS = [
  {
    title: 'Agent-to-agent handoff',
    say: 'One agent passes work to another through a call that carries its own context and chat. The receiving agent starts with the whole brief and replies in the same thread, not in a blank session.',
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
    title: 'Delegation to a coding agent',
    say: 'Code is written by a coding agent in its own session and working tree. A lead agent briefs it, routes the work and verifies the result.',
    prevents: 'two agents editing one file, and a claim of “done” going unchecked.',
  },
  {
    title: 'The review gate',
    say: 'A reviewer agent reviews every pull request on the exact commit. Findings go back to the authoring agent, fixes land as one commit per round, and nothing merges until the gate passes.',
    prevents: 'an unreviewed change reaching a deployed service.',
  },
  {
    title: 'One owner per task',
    say: 'Each task is assigned to exactly one agent and one branch.',
    prevents: 'a merge conflict discovered at merge time.',
  },
];
