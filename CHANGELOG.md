# Overseer changelog

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
