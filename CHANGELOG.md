# 👁️ Overseer — Complete Changelog

# Version 3.0.0 — Final Release Candidate & Reliability Hardening

V3 is Overseer's planned final release. This stage focuses on consolidating the existing feature set, hardening reliability, and improving maintainability rather than expanding the bot with unnecessary new systems.

## 🧱 Architecture
- Moved Discord event handling into `src/events.js` to reduce the size and responsibility of the main runtime file.
- Preserved existing natural-language activation, ticket AI, AutoMod, proactive monitoring, and activity logging during the event-handler refactor.
- Expanded `npm run check` to validate the new event-handler module.

## 🛡️ Reliability hardening
- Removed duplicated intelligence and case handlers discovered during the V2.0 integration cleanup.
- Removed duplicated member, message, and scheduled-report event processing.
- Added protection against update checks running from a detached Git HEAD.
- Improved scheduled intelligence reporting so an unavailable or non-text destination channel records a `REPORT_DELIVERY_FAILED` audit event.
- Added optional Overseer log alerts for scheduled report delivery failures.

## 🤖 AI safety
- Preserved planning-mode behaviour that disables Gemini action tools while planning.
- Kept destructive moderation actions behind the existing permission, role-hierarchy, cooldown, and confirmation controls.

## 📋 Release policy
- V3 is intended to be the final planned feature release.
- Further work should be limited to bug fixes, security fixes, dependency compatibility, and critical reliability maintenance unless the project direction is intentionally changed.

## 📝 Documentation
- Updated the changelog to track V3 audit and reliability work as it was completed.
- Updated project documentation and version references for the V3 final-release track.

---

This changelog records the development history of Overseer from the original project through the current release. Earlier versions have been reconstructed from the documented development and testing history so the release history is not reduced to one-line summaries.

---

# Version 2.1.1 — Update System Reliability & Feedback

V2.1.1 completed the update-system release by improving its runtime feedback, status reporting, and recovery visibility.

## 🔄 Update command improvements
- Updated the startup log to read and display the current version dynamically.
- Improved `/overseer-update status` so the most recent update action, outcome, and before/after commits are displayed reliably.
- Improved `/overseer-update check` with clearer current-version, local-commit, remote-commit, and automatic-update status information.
- Improved `/overseer-update history` so completed, skipped, and failed update actions are easier to interpret.
- Improved the queued-update and queued-rollback responses to explain that the bot may briefly restart while the action completes.

## 🛠️ Fixes
- Fixed Discord embed field validation for update-status results.
- Fixed formatting of update-status result fields when commit details are absent or stored under rollback data.
- Improved rollback reporting to show the restored commit rather than implying the rollback did not change anything.

## ✅ Verification
- Confirmed update status, update history, update checks, and automatic-update status in Discord.
- Confirmed manual rollback restores the previous Git commit and records a successful result.
- Confirmed the local and GitHub commits can be compared to verify the deployment is up to date.

---

# Version 2.1.0 — Automated Update & Recovery System

V2.1 introduced Overseer's self-managed update pipeline, allowing authorised administrators to safely check for, install, and recover from GitHub-based updates.

## 📦 Update management
- Added GitHub commit checking to detect available updates.
- Added administrator-only `/overseer-update` commands for update status, checks, installation, rollback, history, and automatic-update configuration.
- Added manual update installation through the background updater.
- Added configurable automatic update checks and enable/disable controls.
- Added persistent update state, including check times, results, and update history.

## 🛡️ Safe installation and recovery
- Added a backup before each update.
- Added manual rollback to restore the latest available backup.
- Added automatic rollback when an update fails validation or installation.
- Added source validation after updates.
- Added automatic dependency installation with `npm ci`.
- Added Discord slash-command deployment after installation.
- Added PM2 restart support so the updated bot returns to service automatically.

## 📜 Operational visibility
- Added persistent update history with action, result, commit, and timestamp details.
- Added update-status reporting for current version, automatic-update settings, check interval, and latest result.
- Added GitHub/local commit comparison to confirm whether a deployment is current.

---

# Version 2.0.0 — Proactive Intelligence Major Update

## 🧠 Proactive intelligence
- Added a new proactive intelligence layer so Overseer can detect unusual server activity instead of only responding when explicitly asked.
- Added join-flood detection for rapid member joins that may indicate a raid, invite spike, or unusual growth event.
- Added configurable join-flood thresholds.
- Added server-wide message activity-spike detection.
- Added configurable activity-spike thresholds.
- Added persistent proactive alerts with alert type, severity, details, and timestamp.
- Added staff-facing proactive alert history.
- Proactive alerts are also written into Overseer's audit/log system.

## 📊 Server activity intelligence
- Added persistent per-member message activity tracking.
- Added tracking of message counts and latest message activity.
- Added most-active-member reporting.
- Expanded intelligence reports to combine:
  - warnings
  - AutoMod incidents
  - proactive alerts
  - server events
  - active-member information
- Expanded event recording for member joins.
- Expanded event recording for member leaves.
- Expanded event recording for message edits.
- Expanded event recording for message deletions.

## ⏰ Scheduled intelligence reports
- Added persistent scheduled-report configuration.
- Added daily intelligence reports.
- Added weekly intelligence reports.
- Added configurable report destination channels.
- Added configurable UTC delivery hours.
- Added protection against duplicate reports on the same scheduled date.
- Scheduled report state persists through normal bot restarts.

## 🧠 New /overseer-intelligence command suite
Added:
- `/overseer-intelligence status`
- `/overseer-intelligence enable`
- `/overseer-intelligence disable`
- `/overseer-intelligence alerts`
- `/overseer-intelligence report`
- `/overseer-intelligence schedule`

These commands provide staff with control over proactive monitoring and reporting.

## 📁 New case intelligence
Added:
- `/overseer-cases recent`
- `/overseer-cases member`
- `/overseer-cases stats`

The new case system provides:
- recent Overseer action history
- member-specific action history
- action statistics
- a stronger foundation for a unified moderation timeline

## 🗄️ Database
- Added new proactive intelligence tables.
- Added scheduled-report persistence.
- Added member-activity persistence.
- Added database migration support for existing Overseer installations.
- Existing local data, including warnings, tickets, memory and settings, is intended to remain intact during upgrade.

## 🔧 Reliability and release work
- Added `src/proactive.js`.
- Expanded the `npm run check` validation chain.
- Updated slash-command deployment.
- Updated version metadata to 2.0.0.
- Updated README documentation.
- Rebuilt the changelog structure.
- Fixed duplicate declaration issues discovered immediately after the initial V2.0 deployment.
- Tested startup, database migration, slash-command deployment, proactive intelligence, reports, case commands, and existing functionality.

## Upgrade procedure
```bat
update.bat
npm run check
npm run deploy
npm start
```

---

# Version 1.9.0 — Moderation Intelligence

V1.9 focused on making moderation information easier for staff to inspect and manage.

## ⚠️ Warning intelligence
- Added warning history.
- Added recent-warning viewing.
- Added warning leaderboards.
- Added warning counts.
- Added warning clearing.
- Added per-member warning information.
- Added warning-based escalation guidance.
- Improved the connection between warnings and the persistent moderation database.

## 📊 Staff visibility
Added moderation-focused views so staff could inspect warning activity rather than treating warnings as isolated actions.

Included commands/features for:
- warning history
- recent warnings
- warning leaderboards
- clearing warning records

## 🗄️ Persistence
- Expanded database helpers for moderation records.
- Improved warning retrieval and counting.
- Preserved moderation history locally.

## Release goal
The purpose of V1.9 was to move Overseer toward a more intelligent moderation system that understands accumulated history, rather than only performing one-off moderation actions.

---

# Version 1.8.0 — Moderation & Server Intelligence

V1.8 expanded Overseer's awareness of activity happening in the Discord server.

## 📝 Message logging
Added logging for:
- message deletions
- message edits

This made it possible for staff to investigate changes and deleted content through Overseer's local records.

## 👥 Member event logging
Added logging for:
- member joins
- member leaves

This gave Overseer a broader server activity history.

## 🔧 Discord event reliability
- Added and adjusted Discord event handling.
- Improved support for Discord partial objects where required.
- Fixed issues discovered during real testing where logging events were not initially reaching the database.
- Corrected a runtime issue caused by an intelligence API mismatch (`intelligence.record is not a function`).
- Re-tested message edit and deletion logging after the fix.

## 📊 Server intelligence foundation
V1.8 established the event data later expanded in V2.0:
- member lifecycle events
- message changes
- server activity records
- local reporting data

## Release goal
The goal was to make Overseer aware of what happens in the server even when nobody directly asks it a question.

---

# Version 1.7.0 — Runtime Intelligence & Diagnostics

V1.7 focused on understanding Overseer's own health and reducing unnecessary AI usage.

## 🔍 Runtime diagnostics
Added:
- `/overseer-diagnostics`

Diagnostics report information such as:
- bot readiness
- uptime
- Gemini availability
- AI requests during the current session
- local requests during the current session
- Manage Guild permission status
- Moderate Members permission status
- ticket category configuration

## ⚡ Local request routing
Expanded deterministic local handling for questions that do not require Gemini.

Examples include questions about:
- member counts
- roles
- server information
- other directly available Discord data

This reduced unnecessary Gemini API usage.

## 📈 Runtime metrics
Added session-level tracking for:
- AI requests
- locally handled requests
- uptime/runtime state

## 🔧 Interaction reliability
- Investigated and fixed an early slash-command response issue where diagnostics initially showed “The application did not respond”.
- Confirmed diagnostics worked correctly after the fix.

## Release goal
V1.7 made Overseer more observable and more efficient.

---

# Version 1.6.0 — AI Resilience & Gemini Quota Handling

V1.6 focused on preventing Gemini API problems from making Overseer feel broken.

## 🤖 Gemini availability handling
Added handling for:
- rate limits
- request-per-day exhaustion
- quota errors
- temporary Gemini unavailability

## 🛡️ Friendly failure behaviour
Instead of exposing raw API failures to Discord users, Overseer gained more controlled responses when Gemini was unavailable.

## 📊 Status awareness
Gemini availability became visible through Overseer's operational/status tooling.

## Release goal
The aim was for the bot to remain understandable and operational even when its external AI provider temporarily reached a limit.

---

# Version 1.5.0 — Natural Interaction

V1.5 made Overseer feel less like a collection of slash commands and more like a conversational server assistant.

## 💬 Natural-language activation
Added the ability to activate Overseer by addressing it naturally in chat.

Examples:
- “Overseer, what can you do?”
- “Overseer, how many members are there?”
- “Overseer, what roles do I have?”

## 🤖 Conversation improvements
- Reduced the need to use `/overseer` for every question.
- Continued supporting bot mentions.
- Kept the slash-command interface available.
- Connected natural-language requests to server context and AI handling.

## 🔧 Startup and environment work
During this period:
- startup logging was reviewed
- environment loading output was cleaned up
- the bot was tested after changes to ensure it was actually online despite reduced console output

## Release goal
Make Overseer easier and more natural to talk to.

---

# Version 1.4.0 — GitHub Updating, Versioning & Validation Foundation

V1.4 changed how Overseer was distributed and maintained.

## 🔄 GitHub-based updates
Moved away from repeatedly downloading replacement project files.

Established a Git-based workflow using the Overseer repository.

## 📦 update.bat
Added an update workflow that:
1. checks GitHub
2. pulls the latest version
3. checks dependencies with npm
4. keeps local configuration and database files untouched

The updater was tested and later improved after Git detected that a local untracked `update.bat` would be overwritten by a pull.

## 🔐 Local data protection
Configured Git ignore behaviour for files that should remain local, including:
- `.env`
- `node_modules/`
- local SQLite database files

This protected:
- Discord credentials
- Gemini credentials
- local server data

## 🧪 Validation
Added a repeatable source validation workflow through:
- `npm run check`

## 📚 Project maintenance
- Added version tracking.
- Improved repository structure.
- Added/maintained README documentation.
- Established CHANGELOG documentation.
- Began using GitHub as the main update source.

## 🔧 Setup history
The repository workflow also required:
- initial Git configuration
- setting author identity
- first commit
- pushing the project to GitHub
- browser authentication for GitHub

## Release goal
Allow Overseer to be updated safely without repeatedly downloading and replacing the entire project.

---

# Version 1.3.0 — Core Administration Expansion

V1.3 was a major expansion of Overseer's original functionality.

## 🛠️ Server setup
Added:
- `/overseer-setup`

The setup system was designed to configure Overseer-related server resources more quickly.

## 🎛️ Control panel
Added:
- `/overseer-panel`

The control panel exposed operational controls for:
- AI behaviour
- actions
- moderation
- AutoMod
- logging and server settings

## 🛡️ Moderation
Expanded Overseer's moderation capabilities, including support for:
- warnings
- timeouts
- kicks
- bans
- permission-aware actions
- moderation logging

## ⚠️ Confirmation and safety
Added safety/confirmation mechanisms for higher-impact actions.

## 🤖 AI server administration
Expanded AI-assisted server management so Overseer could help with supported actions such as:
- creating channels
- creating roles
- answering questions about the server
- managing supported server information

## 🧠 Persistent memory
Added SQLite-backed server memory.

Added structured memory management through:
- `/overseer-memory`

This allowed useful non-sensitive server information to persist.

## 🎫 Ticket system
Added a more complete ticket system including:
- reusable ticket opener/panel
- Open Ticket button
- private ticket channels
- permission overwrites
- one-open-ticket-per-member protection
- ticket closing
- staff access
- AI ticket assistance
- AI cooldown controls to reduce Gemini usage

Relevant commands/features included:
- `/ticket open`
- `/ticket close`
- `/ticket panel`

## 🎁 Giveaways
Added persistent giveaway functionality and management support.

## 🤖 AutoMod
Added smart AutoMod capabilities.

Included supervised/autonomous moderation modes and persistent incident information.

## 🗄️ SQLite persistence
Expanded the local database to store multiple operational systems, including:
- settings
- memory
- moderation information
- tickets
- giveaways
- AutoMod incidents
- operational logs

## Release goal
Transform Overseer from a basic AI Discord bot into a broader server administration platform.

---

# Version 1.2.0 and Earlier — Original Overseer Foundation

These versions represent the original project foundation before the larger documented release structure was established.

## 👁️ Core identity
Created Overseer as a Discord AI administrator and moderation assistant.

## 🤖 AI integration
Integrated Gemini for natural-language assistance.

## 💬 Discord interaction
Established the initial Discord bot functionality and command-based interaction.

## 🛡️ Administration concept
The original purpose of Overseer included helping with:
- answering server questions
- member information
- role information
- moderation assistance
- server administration

## 📦 Technical foundation
Established the original Node.js project structure using:
- Discord.js
- Gemini
- environment configuration
- local persistence

## Evolution
The later V1.x releases progressively expanded this foundation into:
- persistent memory
- server administration
- moderation systems
- AutoMod
- tickets
- giveaways
- GitHub updating
- diagnostics
- server intelligence
- proactive intelligence

---

## Changelog policy

From V2.0 onward, every release should document:

- the purpose of the release
- all major new features
- important command additions
- database/schema changes
- fixes discovered during development
- migration or upgrade requirements
- significant testing outcomes

The changelog should not be reduced to a single-line summary for a major release.

