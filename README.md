# 👁️ Overseer V3.0

A Discord AI administrator and moderator built around **Gemini**, **Discord.js**, and a persistent local **SQLite** database.

Overseer is designed to act as a server's AI operations layer: it can answer members, inspect server context, moderate users, manage server resources, operate tickets, run giveaways, remember important information, and provide staff with control and reporting tools.

## ✨ Current capabilities

### 🤖 AI administrator
- Gemini-powered natural-language conversations
- Ask Overseer questions directly in chat
- Start a message with `Overseer` instead of using a slash command
- Bot mentions can also activate Overseer
- `/overseer` remains available
- Server/member/role/permission context can be supplied to the AI
- Tool-based actions for supported server-management tasks
- Gemini quota/rate-limit protection with friendly errors
- Expanded local routing for simple server questions to save Gemini requests
- Session request counters and admin diagnostics

### 🛡️ Moderation
- Warnings and moderation records
- Timeout/moderation actions
- Permission-aware actions
- Logging of important moderation activity
- Emergency-stop/safety controls
- Smart AutoMod with supervised/autonomous timeout modes

### 🎫 Tickets
- Member-facing **Open Ticket** button
- `/overseer-setup` creates a reusable `#open-a-ticket` entry point
- Private ticket channels with permission overwrites
- One-open-ticket-per-member protection
- AI ticket agent with cooldown to reduce Gemini usage
- Staff escalation support
- Close button and `/ticket close`
- `/ticket panel` for manually posting an additional ticket opener

### 🚨 Proactive intelligence
- Proactive join-flood detection and raid-style activity alerts
- Activity-spike detection based on live message volume
- Persistent proactive alert history
- Member activity tracking and most-active-member reporting
- Daily or weekly scheduled intelligence reports
- Configurable UTC report delivery time and destination channel
- `/overseer-intelligence` command suite for proactive monitoring
- `/overseer-cases` command suite for audit and moderation case history

### 🧠 Memory & server intelligence
- Persistent SQLite memory
- Structured `/overseer-memory` management
- Server activity intelligence
- Member/channel/role event monitoring
- Local activity reporting without requiring a Gemini request for deterministic reports

### 🎁 Giveaways
- Persistent giveaway data
- Giveaway management through Overseer tools/commands

### 🎛️ Control panel
- `/overseer-panel`
- AI/action controls
- Moderation controls
- AutoMod configuration
- Logging and operational settings
- `/overseer-status` with AI availability/cooldown information
- `/overseer-diagnostics` for admin runtime health checks
- `/warnings history`, `/warnings recent`, `/warnings leaderboard`, and `/warnings clear` for moderation intelligence
- `/overseer-report`

## 📋 Commands

Useful commands include:

```text
/overseer
/overseer-setup
/overseer-panel
/overseer-status
/overseer-report
/overseer-memory
/automod
/ticket open
/ticket close
/ticket panel
```

Run `/overseer-setup` when setting up a new server. It creates/configures the server-side resources supported by the current version.

## 💬 Natural-language activation

You don't have to use `/overseer` every time.

Examples:

```text
Overseer, what can you do?
Overseer, check my roles and permissions.
Overseer, how many members are in the server?
Hey Overseer, help me with my ticket.
```

Mentions still work, and `/overseer` remains available.

## 🔑 Configuration

Copy `.env.example` to `.env` and configure your own credentials:

```env
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_application_id
DISCORD_GUILD_ID=your_test_guild_id
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
```

**Never commit `.env` or expose your Discord/Gemini keys.** `.env`, `node_modules`, and local SQLite database files should remain outside Git.

## 🛠️ Installation

Requirements:

- Node.js **20+**
- A Discord application/bot
- A Gemini API key

Install dependencies:

```bat
npm install
```

Deploy slash commands:

```bat
npm run deploy
```

Start Overseer:

```bat
npm start
```

Run the source validation check:

```bat
npm run check
```

## 🔄 Updating

The project is maintained through GitHub rather than separate ZIP releases.

If you have the repository locally, run:

```bat
update.bat
npm run check
npm start
```

The updater follows the repository's currently checked-out release branch and installs the matching dependencies. The standard release branch is `v3-foundation`.

Your local `.env` and SQLite database are intentionally not tracked by Git, so they remain on your machine during normal updates.

## 🧪 Recommended first checks

After installation/update, test:

```text
/overseer-setup
/overseer-panel
/overseer-status
/overseer-report days:1
/overseer-memory list
/automod status
```

Then test natural-language messages beginning with `Overseer`, simple local questions such as `Overseer, how many members are there?`, and click **Open Ticket** in `#open-a-ticket`.

## 📦 Versioning

Current release track: **V3.0 — Final planned release**

See `CHANGELOG.md` for the release history.

## 🧭 V3 release policy

V3 is Overseer's final planned feature release. Future changes should focus on bug fixes, security fixes, dependency compatibility, and critical reliability maintenance unless the project direction is deliberately changed.



## ⚠️ Safety & permissions

Overseer should only be given the Discord permissions it actually needs. Discord role hierarchy still applies: the bot cannot reliably moderate members or manage roles above its highest role, regardless of what the AI is asked to do.

For destructive or high-impact actions, use the available confirmation/safety controls and keep the bot's permissions appropriately limited.
