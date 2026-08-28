# Overseer V1.3.0

A Discord AI administrator/moderator built around Gemini and Discord.js.

## V1.3 features
- Live server intelligence injected into AI context
- `/overseer-status` live status
- `/overseer-report` local activity reports (no Gemini request)
- Structured `/overseer-memory` management
- Smart AutoMod with supervised/autonomous timeout mode
- AI ticket agent with cooldown and staff escalation
- Persistent ticket/giveaway/moderation/memory data
- Member/channel/role event monitoring stored locally
- Existing V1.2 moderation, permissions, tool calling, tickets, giveaways, logging and emergency stop
- Gemini is only used when AI reasoning is needed; deterministic reporting and AutoMod are local

## Install
1. Copy `.env.example` to `.env` and fill in `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID` (optional), and `GEMINI_API_KEY`.
2. Keep `GEMINI_MODEL=gemini-3.6-flash` if that is the model available to your key.
3. Run `npm install`. If your npm blocks native install scripts, approve/rebuild `better-sqlite3` as you did for the working V1.2.
4. Run `npm run deploy`.
5. Run `npm start`.

## First checks
- `/overseer-setup`
- `/overseer-panel`
- `/overseer-status`
- `/overseer-report days:1`
- `/overseer-memory list`
- `/automod status`

AutoMod is disabled by default and supervised mode is the safe default. Ticket AI is enabled by default with an 8-second per-channel cooldown; disable it from the control panel if you want to conserve Gemini quota.


## Natural-language activation
You can talk directly to Overseer in a server channel without `/overseer`. Start the message with `Overseer`, for example `Overseer, what can you do?` or `Hey Overseer create a channel called general`. Mentioning the bot still works too, and `/overseer` remains available.
