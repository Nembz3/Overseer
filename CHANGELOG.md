# Changelog

All notable changes to Overseer are documented in this file.

The project follows a simple versioned release history. Major releases describe the purpose of the update as well as the most important changes made to the project.

---

## [3.0.0] — Final planned feature release

V3.0.0 is the final planned feature release for Overseer.

The focus of this release was not to add another large system. Instead, the goal was to consolidate the existing feature set, clean up parts of the codebase, improve reliability, and leave the project in a stable state for future maintenance.

### Architecture

- Moved Discord event handling into `src/events.js`.
- Reduced the size and responsibility of the main runtime file.
- Preserved natural-language activation, ticket AI, AutoMod, proactive monitoring, and activity logging during the refactor.
- Updated `npm run check` to validate the new event module.

### Reliability

- Removed duplicate intelligence and case handlers.
- Removed duplicate member and message event processing.
- Removed duplicate scheduled-report processing.
- Improved handling when a scheduled report cannot be delivered.
- Added a `REPORT_DELIVERY_FAILED` audit event for unavailable or invalid report channels.
- Added optional Overseer log alerts for report delivery failures.
- Added protection against update checks running from a detached Git HEAD.

### Update system

- Enabled the automatic update scheduler during Overseer startup.
- Replaced stale hard-coded version strings with the version stored in `VERSION`.
- Allowed automatic-update interval changes to take effect without restarting the bot.
- Updated package metadata for V3.0.0.

### Safety

- Preserved planning mode, which prevents Gemini action tools from running while planning.
- Retained permission checks for moderation actions.
- Retained Discord role hierarchy protections.
- Retained cooldown and confirmation controls for higher-impact actions.

### Documentation

- Updated project documentation for the V3 release.
- Consolidated the final-release policy.
- Removed stale version references.

### Maintenance policy

V3 is the final planned feature release.

Future work should be limited to:

- Bug fixes
- Security fixes
- Dependency compatibility
- Critical reliability improvements

Major new features are not currently planned unless the direction of the project deliberately changes.

---

## [2.1.1] — Update system reliability and feedback

V2.1.1 focused on making Overseer's update system easier to understand and recover from.

### Improved

- Improved `/overseer-update status` with clearer information about the latest update action and before/after commits.
- Improved `/overseer-update check` with clearer version and commit information.
- Improved `/overseer-update history` so successful, skipped, and failed actions are easier to interpret.
- Improved queued update and rollback messages to explain that the bot may briefly restart.

### Fixed

- Fixed Discord embed validation issues in update status responses.
- Improved handling when commit information is missing.
- Improved rollback reporting.

### Verified

- Update status and history.
- Manual update checks.
- Automatic update configuration.
- Rollback recovery.
- Local and remote commit comparison.

---

## [2.1.0] — Automated updates and recovery

V2.1 introduced Overseer's GitHub-based update and recovery system.

### Added

- Update checks against GitHub.
- Administrator-only `/overseer-update` commands.
- Manual update installation.
- Configurable automatic update checks.
- Persistent update state and history.
- Pre-update backups.
- Manual rollback support.
- Automatic rollback when validation or installation fails.
- Dependency installation with `npm ci`.
- Slash-command deployment after successful updates.
- PM2 restart support.

### Operational visibility

- Persistent update history.
- Update status reporting.
- Commit comparison between local and remote versions.

---

## [2.0.0] — Proactive intelligence

V2.0 added a proactive intelligence layer to Overseer.

Instead of only responding to requests, the bot gained the ability to monitor server activity and report unusual behaviour.

### Added

- Join-flood detection.
- Activity-spike detection.
- Configurable detection thresholds.
- Persistent proactive alerts.
- Per-member activity tracking.
- Most-active-member reporting.
- Daily intelligence reports.
- Weekly intelligence reports.
- Configurable report channels.
- Configurable UTC delivery times.
- Duplicate-report protection.

### Commands

Added the `/overseer-intelligence` command suite:

- `status`
- `enable`
- `disable`
- `alerts`
- `report`
- `schedule`

Added `/overseer-cases`:

- `recent`
- `member`
- `stats`

### Database

- Added proactive intelligence tables.
- Added scheduled-report persistence.
- Added member activity persistence.
- Added migration support for existing installations.

### Reliability

- Added `src/proactive.js`.
- Expanded source validation.
- Updated slash-command deployment.
- Fixed duplicate declarations discovered during the initial V2 integration.
- Tested startup, migrations, reports, case commands, and existing functionality.

---

## [1.9.0] — Moderation intelligence

V1.9 improved the way staff could inspect moderation history.

### Added

- Warning history.
- Recent warnings.
- Warning leaderboards.
- Warning counts.
- Warning clearing.
- Per-member moderation history.
- Warning-based escalation guidance.

The goal was to move Overseer away from isolated moderation actions and towards a system with persistent moderation context.

---

## [1.8.0] — Server activity awareness

V1.8 expanded Overseer's awareness of activity across a Discord server.

### Added logging for

- Member joins.
- Member leaves.
- Message edits.
- Message deletions.

### Improved

- Discord partial-object handling.
- Event reliability.
- Database recording for server activity.

This release established much of the event data later used by the proactive intelligence system in V2.0.

---

## [1.7.0] — Runtime intelligence and diagnostics

V1.7 focused on Overseer's own health and reducing unnecessary AI usage.

### Added

- `/overseer-diagnostics`
- Session AI request tracking.
- Local request tracking.
- Runtime uptime information.
- Local handling for simple deterministic server questions.

The release made Overseer easier to monitor and reduced unnecessary Gemini requests.

---

## [1.6.0] — AI resilience

V1.6 focused on handling Gemini API availability problems more gracefully.

### Added

- Rate-limit handling.
- Daily quota handling.
- Temporary AI availability handling.
- Friendlier error messages.
- AI availability information in operational tooling.

The goal was to ensure that Overseer remained understandable and useful even when Gemini temporarily reached a limit.

---

## [1.5.0] — Natural interaction

V1.5 made Overseer easier to talk to directly.

### Added

Natural-language activation, allowing messages such as:

```text
Overseer, what can you do?
Overseer, how many members are there?
Overseer, what roles do I have?
```

### Improved

- Reduced reliance on slash commands for everyday questions.
- Maintained bot mention support.
- Kept the traditional slash-command interface.
- Connected natural-language requests to existing server context.

---

## [1.4.0] — GitHub updates and validation

V1.4 established GitHub as the main distribution and maintenance workflow for Overseer.

### Added

- Git-based project updates.
- `update.bat`.
- Version tracking.
- `npm run check`.
- Git ignore rules for local secrets and data.
- Project documentation and changelog maintenance.

### Protected

The update workflow was designed to leave the following files local:

- `.env`
- `node_modules/`
- SQLite database files

This helped protect credentials and server data during normal updates.

---

## [1.3.0] — Core administration expansion

V1.3 significantly expanded Overseer's original functionality.

### Added

- `/overseer-setup`
- `/overseer-panel`
- AI-assisted server administration
- Warnings
- Timeouts
- Kicks
- Bans
- Moderation logging
- Confirmation controls
- Persistent server memory
- Ticket system
- AI ticket assistance
- Giveaways
- Smart AutoMod
- SQLite-backed persistence

This release transformed Overseer from a basic AI Discord bot into a broader server administration platform.

---

## [1.2.0 and earlier] — Project foundation

The earliest versions established the core idea behind Overseer:

- A Discord bot with Gemini-powered AI assistance.
- Server and member context.
- Basic moderation assistance.
- Command-based interaction.
- Node.js project infrastructure.
- Environment-based configuration.
- Local persistence.

Later releases expanded this foundation into the administration, moderation, ticketing, intelligence, and update systems used today.

---

## Changelog policy

For future maintenance releases, entries should clearly describe:

- The purpose of the release.
- Important changes.
- Bug fixes.
- Security fixes.
- Migration requirements, where relevant.
- Significant compatibility changes.

The goal is to keep the history useful and readable without turning every release into a full development diary.
