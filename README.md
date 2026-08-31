# 👁️ Overseer

[![CI](https://github.com/Nembz3/Overseer/actions/workflows/check.yml/badge.svg)](https://github.com/Nembz3/Overseer/actions/workflows/check.yml)
[![Version](https://img.shields.io/badge/version-3.0.0-blue)](https://github.com/Nembz3/Overseer/releases)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20Overseer-ff5e5b)](https://ko-fi.com/nembz)

Overseer is an AI-powered Discord administration and moderation bot built with Discord.js, Gemini, and SQLite.

The project is designed to bring several server-management tools together in one place. Overseer can answer questions about a server, assist with moderation, manage tickets, monitor unusual activity, keep persistent records, and provide staff with operational controls and reports.

> **Current release:** V3.0.0  
> **Project status:** Final planned feature release

## Support the project

If you enjoy Overseer and would like to support the project, you can make an optional donation through Ko-fi.

☕ **[Support Overseer on Ko-fi](https://ko-fi.com/nembz)**

Thank you for supporting the project.

---

## Features

### AI assistance

- Gemini-powered conversations
- Natural-language activation by addressing the bot as `Overseer`
- Bot mention support
- Traditional `/overseer` command support
- Server, member, role, and permission context
- Supported AI-assisted server-management actions
- Local handling for simple questions to reduce unnecessary AI requests
- Friendly handling of Gemini quota and rate-limit errors
- Runtime diagnostics and request counters

### Moderation and AutoMod

- Warning history and moderation records
- Timeout, kick, and ban support
- Permission-aware moderation actions
- Discord role hierarchy protection
- Confirmation controls for higher-impact actions
- Emergency stop for AI actions
- Smart AutoMod
- Supervised and autonomous moderation modes
- Persistent AutoMod incident history

### Tickets

- Member-facing **Open Ticket** button
- Private ticket channels
- One open ticket per member
- Configurable ticket category
- AI assistance inside tickets
- Cooldowns to reduce unnecessary AI usage
- Staff escalation support
- Ticket close button
- `/ticket open`, `/ticket close`, and `/ticket panel`

### Proactive intelligence

- Join-flood detection
- Activity-spike detection
- Persistent proactive alerts
- Member activity tracking
- Most-active-member reporting
- Daily and weekly intelligence reports
- Configurable report channels and UTC delivery times
- Proactive monitoring controls through `/overseer-intelligence`
- Moderation and audit history through `/overseer-cases`

### Server intelligence and memory

- Persistent SQLite-backed server memory
- Structured memory management
- Member, channel, and role context
- Activity reporting without requiring an AI request when the answer is deterministic

### Operations

- Staff control panel
- Server setup command
- Runtime diagnostics
- AI availability reporting
- Persistent operational logs
- GitHub-based update and rollback tooling
- GitHub Actions validation

### Giveaways

- Persistent giveaway data
- Giveaway management through Overseer's supported tools and commands

---

## Commands

Common commands include:

```text
/overseer
/overseer-setup
/overseer-panel
/overseer-status
/overseer-diagnostics
/overseer-report
/overseer-memory
/overseer-intelligence
/overseer-cases
/overseer-update
/automod
/warnings
/ticket open
/ticket close
/ticket panel
```

Run `/overseer-setup` when configuring Overseer in a new server. It creates and configures the server-side resources required by the current version.

---

## Natural-language activation

Overseer can be addressed directly in chat.

Examples:

```text
Overseer, what can you do?
Overseer, how many members are in the server?
Overseer, check my roles and permissions.
Hey Overseer, help me with my ticket.
```

Bot mentions also work, and the `/overseer` slash command remains available.

---

## Installation

### Requirements

- Node.js **20 or newer**
- A Discord application and bot token
- A Gemini API key

### 1. Clone the repository

```bat
git clone https://github.com/Nembz3/Overseer.git
cd Overseer
```

### 2. Install dependencies

```bat
npm install
```

### 3. Configure the environment

Copy `.env.example` to `.env` and add your own credentials:

```env
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_discord_application_client_id
DISCORD_GUILD_ID=your_test_guild_id
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
DB_PATH=overseer.sqlite
```

**Never commit your `.env` file or share your API keys.**

### 4. Deploy slash commands

```bat
npm run deploy
```

### 5. Start Overseer

```bat
npm start
```

### 6. Validate the source

```bat
npm run check
```

---

## Updating

Overseer is maintained through GitHub.

To update an existing installation:

```bat
update.bat
npm run check
npm start
```

The updater follows the repository's currently checked-out branch and installs the matching dependencies.

Your local `.env` file and SQLite database are intentionally excluded from Git, so they remain on your machine during normal updates.

---

## First-time setup

After the bot is online, a good starting point is:

1. Run `/overseer-setup`
2. Open `/overseer-panel`
3. Run `/overseer-status`
4. Check `/automod status`
5. Run `/overseer-report days:1`
6. Open a ticket from `#open-a-ticket`
7. Run `/overseer-diagnostics` as an administrator

This provides a quick overview of Overseer's administration, moderation, reporting, ticketing, and operational tools.

---

## Project structure

```text
Overseer/
├── src/
│   ├── ai.js
│   ├── automod.js
│   ├── database.js
│   ├── deploy-commands.js
│   ├── events.js
│   ├── index.js
│   ├── proactive.js
│   ├── runtime.js
│   ├── server-intelligence.js
│   ├── tickets.js
│   ├── tools.js
│   └── update-manager.js
├── scripts/
│   └── overseer-updater.js
├── .github/
├── CHANGELOG.md
├── VERSION
├── package.json
└── update.bat
```

---

## Versioning and maintenance

**V3.0.0 is Overseer's final planned feature release.**

Future updates are expected to focus on:

- Bug fixes
- Security fixes
- Dependency compatibility
- Critical reliability improvements

Major new features are not currently planned unless the direction of the project deliberately changes.

For release history, see [CHANGELOG.md](CHANGELOG.md).

---

## Security and permissions

Only grant Overseer the Discord permissions it actually needs.

Discord's role hierarchy still applies. Overseer cannot reliably moderate members or manage roles above its highest role, regardless of the permissions requested by an AI command.

For destructive or high-impact actions, keep confirmation controls enabled and review the bot's permissions regularly.

---

## License

This project is released under the MIT License.

---

Built by **Nembz3**.

👁️ **The Overseer is watching.**
