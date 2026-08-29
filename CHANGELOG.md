# Overseer changelog

## 1.9.0 — Moderation Intelligence

- Added `/warnings history` to inspect a member's warning history.
- Added `/warnings recent` for recent moderation activity.
- Added `/warnings leaderboard` to identify repeated offenders.
- Added `/warnings clear` for authorised staff to clear a member's warning history.
- Added warning-count based escalation guidance for staff review.
- Added database helpers for per-member warning counts and warning clearing.
- Updated command deployment, README, package version and VERSION marker.

### Upgrade
Run `update.bat`, `npm run check`, `npm run deploy`, then `npm start`.

## 1.8.0 — Moderation & Server Intelligence

- Added configured server activity logging.
- Added member join and leave logs.
- Added message edit logging with before/after previews.
- Added deleted-message logging with available content.
- Added Discord partial support for more reliable edit/delete events.
- Added console diagnostics for logging failures.
- Added database audit records for activity events.
- Added foundations for warning intelligence and server event statistics.
- Fixed activity logging integration issues discovered during live Discord testing.

## 1.7.0 — Runtime Intelligence & Diagnostics

- Expanded local routing for deterministic server questions.
- Added flexible role and permission question detection.
- Added local answers for member, role, channel and server-owner information.
- Added AI and local request counters.
- Added runtime uptime tracking.
- Added `/overseer-diagnostics`.
- Added Gemini availability and cooldown diagnostics.
- Fixed command deployment and diagnostics handler routing issues discovered during testing.

## 1.6.0 — AI Resilience

- Added Gemini quota and rate-limit protection.
- Added temporary cooldown handling after quota failures.
- Added friendly AI outage messages instead of exposing raw API failures.
- Added local routing for simple deterministic server questions.
- Expanded `/overseer-status` with AI health information.
- Added runtime health infrastructure.

## 1.5.0 — Natural Interaction

- Added natural-language activation by addressing Overseer in normal chat.
- Kept the `/overseer` slash command available.
- Improved startup and runtime behaviour.
- Expanded ticket support behaviour and AI ticket assistance.
- Continued improving server-management workflow reliability.

## 1.4.0 — Update & Validation Foundation

- Added the GitHub-based update workflow.
- Added `update.bat` support for pulling future releases.
- Added local validation through `npm run check`.
- Added automatic syntax/validation checks in the repository.
- Added version tracking and early release documentation improvements.

## 1.3.0 — Core Administration Expansion

- Established the GitHub repository workflow for Overseer.
- Added richer server setup infrastructure.
- Expanded control-panel functionality.
- Added ticket infrastructure and ticket opener support.
- Added moderation tooling, confirmations and server memory.
- Added giveaways and configurable AutoMod foundations.
- Improved natural-language AI administration and Discord permission awareness.
- Added persistent SQLite storage for server configuration and state.

## 1.2.0 and earlier — Original Overseer Foundation

- Initial Discord bot and Gemini AI integration.
- `/overseer` AI command.
- Core moderation and administration actions.
- Role and permission awareness.
- Server context for AI responses.
- Control-panel foundations.
- Confirmation safeguards for sensitive actions.
- Persistent configuration groundwork.

---

This changelog was reconstructed from the Overseer repository history and implemented feature set. From V1.9 onward, every release should be added here as part of the update.
