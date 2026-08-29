# Overseer changelog

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
