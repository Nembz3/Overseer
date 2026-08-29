# Overseer changelog

## 2.0.0 — Proactive Intelligence Major Update

### Proactive monitoring
- Added proactive join-flood detection for potential raids or unusual invite spikes.
- Added server-wide message activity spike detection.
- Added persistent proactive alert history with severity levels.
- Added configurable proactive intelligence enable/disable controls.
- Added configurable join-flood and activity-spike thresholds in the server settings layer.

### Activity intelligence
- Added persistent per-member message activity tracking.
- Added most-active-member reporting.
- Expanded event recording for joins, leaves, edits and deletions.
- Added richer local intelligence reports combining warnings, AutoMod incidents, proactive alerts and event activity.

### Scheduled reporting
- Added daily and weekly automatic intelligence reports.
- Added configurable destination channels.
- Added configurable UTC delivery hours.
- Added persistent schedule state so reports do not duplicate after restarts.

### Moderation intelligence
- Added /overseer-cases recent for audit/case review.
- Added /overseer-cases member for per-member case history.
- Added /overseer-cases stats for action statistics.
- Expanded the foundation for a unified moderation timeline.

### New commands
- /overseer-intelligence status
- /overseer-intelligence enable
- /overseer-intelligence disable
- /overseer-intelligence alerts
- /overseer-intelligence report
- /overseer-intelligence schedule
- /overseer-cases recent
- /overseer-cases member
- /overseer-cases stats

### Upgrade
Run `update.bat`, `npm run check`, `npm run deploy`, then `npm start`.

## 1.9.0 — Moderation Intelligence

- Added warning history, recent warnings, warning leaderboards and warning clearing.
- Added warning-count based escalation guidance.
- Added moderation database helpers and staff-facing warning intelligence.

## 1.8.0 — Moderation & Server Intelligence

- Added member join/leave logs and message edit/delete logs.
- Added Discord partial support and activity audit records.
- Fixed live Discord integration issues discovered during testing.

## 1.7.0 — Runtime Intelligence & Diagnostics

- Expanded local question routing.
- Added AI/local request counters and runtime uptime.
- Added /overseer-diagnostics.

## 1.6.0 — AI Resilience

- Added Gemini quota/rate-limit protection and friendly cooldown handling.

## 1.5.0 — Natural Interaction

- Added normal-chat activation by addressing Overseer directly while keeping /overseer.

## 1.4.0 — Update & Validation Foundation

- Added GitHub updates, update.bat workflow, validation and version tracking.

## 1.3.0 — Core Administration Expansion

- Expanded setup, control panel, tickets, moderation, confirmations, memory, giveaways, AutoMod and SQLite persistence.

## 1.2.0 and earlier — Original Overseer Foundation

- Initial Discord/Gemini AI administrator, moderation, permissions and server context.

---
Every release is documented here as part of Overseer's release process.
