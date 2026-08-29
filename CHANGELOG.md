# Overseer changelog

## 2.0.0 — Proactive Intelligence Major Update
- Added proactive join-flood detection for possible raids or unusual invite spikes.
- Added server-wide message activity-spike detection.
- Added persistent proactive alert history with severity levels.
- Added persistent per-member message activity tracking and most-active-member reporting.
- Added daily and weekly scheduled intelligence reports with configurable UTC delivery time and destination channel.
- Added `/overseer-intelligence` status, enable, disable, alerts, report and schedule commands.
- Added `/overseer-cases` recent, member and stats commands.
- Expanded event recording for joins, leaves, edits and deletions.
- Updated validation, README, version metadata and changelog.

### Upgrade
Run `update.bat`, `npm run check`, `npm run deploy`, then `npm start`.

## 1.9.0 — Moderation Intelligence
- Added warning history, recent warnings, leaderboards, clearing and escalation guidance.

## 1.8.0 — Moderation & Server Intelligence
- Added member join/leave and message edit/delete logging.

## 1.7.0 — Runtime Intelligence & Diagnostics
- Added local routing, runtime metrics and diagnostics.

## 1.6.0 — AI Resilience
- Added Gemini quota/rate-limit protection.

## 1.5.0 — Natural Interaction
- Added normal-chat activation by addressing Overseer directly.

## 1.4.0 — Update & Validation Foundation
- Added GitHub update workflow and validation.

## 1.3.0 — Core Administration Expansion
- Expanded setup, panel, tickets, moderation, memory, giveaways, AutoMod and persistence.

## 1.2.0 and earlier — Original Overseer Foundation
- Initial Discord/Gemini AI administration and moderation foundation.

---
Every release is documented here as part of Overseer's release process.
