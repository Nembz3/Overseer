# Overseer changelog

## 1.8.0

- Added member join/leave logging when a log channel is configured.
- Added deleted-message logging with available message content.
- Added edited-message logging with before/after previews.
- Expanded server event intelligence recording for moderation activity.
- Added database helpers for recent warnings and warning leaderboards.
- Updated runtime versioning and documentation.

### Upgrade

Run `update.bat`, `npm run check`, then `npm start`. No slash-command redeploy is required.


## 1.7.0

- Made local question routing more flexible, including natural variations of role and permission questions.
- Added local answers for server role count and server owner questions.
- Added session counters for Gemini-backed and local requests.
- Added uptime tracking to runtime health.
- Added `/overseer-diagnostics` for administrators with bot readiness, uptime, AI state, request counters, permission checks and ticket configuration status.
- Updated documentation and versioning.

### Upgrade

Run `update.bat`, `npm run check`, `npm run deploy`, then `npm start`.


## 1.6.0

- Added Gemini quota/rate-limit protection with a temporary cooldown after quota errors.
- Added friendlier AI outage/quota messages instead of exposing raw API failures to members.
- Added local request routing for common deterministic questions (member count, the user's roles, permissions, channel count, and identity) to save Gemini requests.
- `/overseer-status` now reports AI availability/cooldown state.
- Added `src/runtime.js` for AI runtime health and request routing.
- Updated startup version, README, changelog, package version and validation checks.

### Upgrade

Run `update.bat`, `npm run check`, then `npm start`. No slash-command redeploy is required.


## 1.5.0

- Added a member-facing ticket opener with an **Open Ticket** button.
- `/overseer-setup` now creates an `#open-a-ticket` channel when needed and posts the ticket panel.
- Added `/ticket panel` for manually posting a ticket opener.
- Added a Close Ticket button inside newly created tickets.
- Centralised ticket creation/closing logic in `src/tickets.js`.
- Added one-open-ticket-per-member protection.
- Updated README and code validation for the new ticket module.

### Upgrade

Run `update.bat`, then `npm run check`, then `npm run deploy` once to register the new `/ticket panel` command.


## 1.4.0

- Added a `VERSION` marker.
- Added `npm run check` to syntax-check all JavaScript source files before starting the bot.
- Kept the existing V1.3 moderation, AutoMod, tickets, memory, server intelligence and control-panel architecture intact.

### Upgrade

From an existing installation:

```bat
git pull --ff-only origin main
npm install
npm run check
npm start
```

Your local `.env` and SQLite database are intentionally not tracked by Git.
