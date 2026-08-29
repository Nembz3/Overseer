require("dotenv").config();
const {
  Client, GatewayIntentBits, Events, EmbedBuilder, ActionRowBuilder,
  ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType, MessageFlags
} = require("discord.js");
const { ask } = require("./ai");
const db = require("./database");
const automod = require("./automod");
const intelligence = require("./server-intelligence");
const tickets = require("./tickets");
const runtime = require("./runtime");

if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CLIENT_ID || !process.env.GEMINI_API_KEY) {
  throw new Error("Missing DISCORD_TOKEN, DISCORD_CLIENT_ID or GEMINI_API_KEY in .env");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once(Events.ClientReady, c => console.log(`🟢 Overseer V1.7.0 online as ${c.user.tag}`));

async function sendLog(guild, embed) {
  const s = db.settings(guild.id);
  if (!s.log_channel_id) return;
  const channel = guild.channels.cache.get(s.log_channel_id) || await guild.channels.fetch(s.log_channel_id).catch(() => null);
  if (channel?.isTextBased()) await channel.send({ embeds: [embed] }).catch(() => {});
}

function staff(member) {
  return member?.permissions.has(PermissionFlagsBits.ManageGuild) || member?.permissions.has(PermissionFlagsBits.Administrator);
}

const ticketAiCooldown = new Map();

client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.guild || !client.user) return;
  const s = db.settings(message.guild.id);
  if (s.automod_enabled) {
    automod.handle(message).catch(e => console.error("AutoMod error:", e));
  }
  // AI ticket agent: only runs inside an open Overseer ticket, ignores staff and bot messages, and is rate-limited.
  const ticket = db.ticketByChannel(message.channel.id);
  if (ticket?.status === "open" && s.ticket_ai_enabled && !staff(message.member)) {
    const now = Date.now();
    const last = ticketAiCooldown.get(message.channel.id) || 0;
    if (now - last >= Math.max(3, Number(s.ticket_ai_cooldown || 8)) * 1000) {
      ticketAiCooldown.set(message.channel.id, now);
      try {
        await message.channel.sendTyping();
        const answer = await ask({ guild: message.guild, actorId: message.author.id, text: `TICKET SUPPORT MODE. The user is speaking in ticket #${ticket.id}. Help solve the issue. Do not perform moderation or server-management actions unless a staff member explicitly requests it. If the issue requires staff authority, clearly escalate it. User message: ${message.content}` });
        if (answer) await message.reply(answer.slice(0, 2000));
      } catch (e) { console.error("Ticket AI error:", e); }
      return;
    }
  }
  if (!s.ai_enabled) return;

  // Natural-language activation: users can address Overseer by name instead of using /overseer.
  // Examples: "Overseer, what can you do?", "Hey Overseer create a channel", "Overseer help".
  // The /overseer slash command remains available.
  const mentionRegex = new RegExp(`<@!?${client.user.id}>`, "g");
  const withoutMention = message.content.replace(mentionRegex, "").trim();
  const nameTrigger = /^(?:(?:hey|hi|hello|yo|ok|okay|please)\s*[,:-]?\s*)?overseer\b/i;
  const addressedByName = nameTrigger.test(withoutMention);
  const mentioned = message.mentions.has(client.user);
  if (!addressedByName && !mentioned) return;

  const text = withoutMention.replace(nameTrigger, "").trim();
  if (!text) return message.reply("👋 I'm here. Ask me something or give me a request.");
  try {
    const local = runtime.routeLocal(message.guild, message.member, text);
    if (local) { runtime.markLocalRequest(); return await message.reply(local); }
    if (!runtime.aiAvailable()) return await message.reply(runtime.friendlyAiError(new Error("quota cooldown")));
    await message.channel.sendTyping();
    runtime.markAiRequest();
    const answer = await ask({ guild: message.guild, actorId: message.author.id, text });
    runtime.clearAiError();
    await message.reply(answer.slice(0, 2000));
  } catch (e) {
    runtime.markAiError(e);
    console.error("Overseer AI error:", e);
    await message.reply(runtime.friendlyAiError(e)).catch(() => {});
  }
});

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "overseer") return await handleOverseer(interaction);
      if (interaction.commandName === "overseer-panel") return await handlePanel(interaction);
      if (interaction.commandName === "overseer-confirm") return await handleConfirm(interaction);
      if (interaction.commandName === "overseer-setup") return await handleSetup(interaction);
      if (interaction.commandName === "ticket") return await handleTicket(interaction);
      if (interaction.commandName === "giveaway") return await handleGiveaway(interaction);
      if (interaction.commandName === "automod") return await handleAutomod(interaction);
      if (interaction.commandName === "overseer-status") return await handleStatus(interaction);
      if (interaction.commandName === "overseer-report") return await handleReport(interaction);
      if (interaction.commandName === "overseer-memory") return await handleMemory(interaction);
    }
    if (interaction.isButton() && interaction.customId === "ticket_open") return await handleTicketButton(interaction);
    if (interaction.isButton() && interaction.customId === "ticket_close") return await handleTicketCloseButton(interaction);
    if (interaction.isButton()) return await handleButton(interaction);
  } catch (e) {
    console.error("Interaction error:", e);
    const msg = "❌ Something went wrong. Check the bot console.";
    if (interaction.replied || interaction.deferred) await interaction.followUp({ content: msg, flags: MessageFlags.Ephemeral }).catch(() => {});
    else await interaction.reply({ content: msg, flags: MessageFlags.Ephemeral }).catch(() => {});
  }
});

async function handleOverseer(i) {
  const s = db.settings(i.guild.id);
  if (!s.ai_enabled) return i.reply({ content: "🔴 Overseer AI is disabled.", flags: MessageFlags.Ephemeral });
  await i.deferReply();
  const text = i.options.getString("question", true);
  try {
    const local = runtime.routeLocal(i.guild, i.member, text);
    if (local) { runtime.markLocalRequest(); return await i.editReply(local); }
    if (!runtime.aiAvailable()) return await i.editReply(runtime.friendlyAiError(new Error("quota cooldown")));
    runtime.markAiRequest();
    const answer = await ask({ guild: i.guild, actorId: i.user.id, text });
    runtime.clearAiError();
    await i.editReply(answer.slice(0, 2000));
  } catch (e) {
    runtime.markAiError(e);
    console.error("Overseer AI error:", e);
    await i.editReply(runtime.friendlyAiError(e));
  }
}

async function handleConfirm(i) {
  if (!staff(i.member)) return i.reply({ content: "❌ You need Manage Server.", flags: MessageFlags.Ephemeral });
  const id = i.options.getString("id", true).trim().toUpperCase();
  const pending = db.getPending(id);
  if (!pending || pending.guild_id !== i.guild.id) return i.reply({ content: "❌ That confirmation ID is invalid or expired.", flags: MessageFlags.Ephemeral });
  if (pending.actor_id !== i.user.id) return i.reply({ content: "❌ Only the staff member who requested this action can confirm it.", flags: MessageFlags.Ephemeral });
  const member = await i.guild.members.fetch(pending.payload.user_id).catch(() => null);
  const me = i.guild.members.me;
  if (!member || !me || member.id === i.guild.ownerId || member.roles.highest.position >= me.roles.highest.position) {
    db.deletePending(id);
    return i.reply({ content: "❌ The target can no longer be moderated because of Discord role hierarchy or availability.", flags: MessageFlags.Ephemeral });
  }
  try {
    if (pending.action === "ban") {
      if (!me.permissions.has(PermissionFlagsBits.BanMembers)) throw new Error("I need Ban Members permission.");
      await member.ban({ reason: pending.payload.reason });
      db.log(i.guild.id, i.user.id, member.id, "BAN", pending.payload.reason);
    } else if (pending.action === "kick") {
      if (!me.permissions.has(PermissionFlagsBits.KickMembers)) throw new Error("I need Kick Members permission.");
      await member.kick(pending.payload.reason);
      db.log(i.guild.id, i.user.id, member.id, "KICK", pending.payload.reason);
    } else throw new Error("Unknown pending action.");
    db.deletePending(id);
    return i.reply({ content: `✅ **${pending.action.toUpperCase()}** completed for <@${member.id}>.`, flags: MessageFlags.Ephemeral });
  } catch (e) {
    db.deletePending(id);
    return i.reply({ content: `❌ Action failed: ${e.message}`, flags: MessageFlags.Ephemeral });
  }
}

async function handleSetup(i) {
  if (!staff(i.member)) return i.reply({ content: "❌ You need Manage Server.", flags: MessageFlags.Ephemeral });
  await i.deferReply({ flags: MessageFlags.Ephemeral });
  const existingLog = db.settings(i.guild.id).log_channel_id ? i.guild.channels.cache.get(db.settings(i.guild.id).log_channel_id) : null;
  const existingMod = db.settings(i.guild.id).mod_channel_id ? i.guild.channels.cache.get(db.settings(i.guild.id).mod_channel_id) : null;
  const existingCategory = db.settings(i.guild.id).ticket_category_id ? i.guild.channels.cache.get(db.settings(i.guild.id).ticket_category_id) : null;
  const category = existingCategory || await i.guild.channels.create({ name: "🎫 TICKETS", type: ChannelType.GuildCategory, reason: "Overseer setup" });
  const logChannel = existingLog || await i.guild.channels.create({ name: "overseer-logs", type: ChannelType.GuildText, reason: "Overseer setup" });
  const modChannel = existingMod || await i.guild.channels.create({ name: "mod-logs", type: ChannelType.GuildText, reason: "Overseer setup" });
  db.update(i.guild.id, { ticket_category_id: category.id, log_channel_id: logChannel.id, mod_channel_id: modChannel.id });
  db.log(i.guild.id, i.user.id, null, "SETUP", "Created/configured Overseer infrastructure");
  const ticketPanel = i.guild.channels.cache.find(c => c.name === "open-a-ticket" && c.type === ChannelType.GuildText)
    || await i.guild.channels.create({ name: "open-a-ticket", type: ChannelType.GuildText, reason: "Overseer ticket panel" });
  await ticketPanel.send(tickets.ticketPanelPayload()).catch(() => {});
  await i.editReply(`✅ **Overseer setup complete.**\n\n🎫 Ticket category: ${category}\n🎟️ Ticket opener: ${ticketPanel}\n📋 Overseer logs: ${logChannel}\n🛡️ Mod logs: ${modChannel}\n\nMembers can now click **Open Ticket** in ${ticketPanel}.`);
}

async function handleDiagnostics(i) {
  if (!staff(i.member)) return i.reply({ content: "❌ You need Manage Server.", flags: MessageFlags.Ephemeral });
  const h = runtime.health();
  const fmt = n => n < 60 ? `${n}s` : `${Math.floor(n / 60)}m ${n % 60}s`;
  const lines = [
    "👁️ **Overseer Diagnostics**",
    `🟢 Bot: ${client.isReady() ? "Ready" : "Not ready"}`,
    `⏱️ Uptime: **${fmt(h.uptimeSeconds)}**`,
    `🤖 Gemini: **${h.aiAvailable ? "Available" : "Cooling down"}**`,
    `📨 AI requests this session: **${h.aiRequests}**`,
    `⚡ Local requests this session: **${h.localRequests}**`,
    `🔐 Manage Guild permission: **${i.guild.members.me.permissions.has(PermissionFlagsBits.ManageGuild) ? "Yes" : "No"}**`,
    `🛡️ Moderate Members permission: **${i.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers) ? "Yes" : "No"}**`,
    `📁 Ticket category configured: **${db.settings(i.guild.id).ticket_category_id ? "Yes" : "No"}**`
  ];
  if (h.lastAiError) lines.push(`⚠️ Last AI error: ${h.lastAiError.message.slice(0, 120)}`);
  return i.reply({ content: lines.join("\n"), flags: MessageFlags.Ephemeral });
}

async function handlePanel(i) {
  if (!staff(i.member)) return i.reply({ content: "❌ You need Manage Server to use the control panel.", flags: MessageFlags.Ephemeral });
  const s = db.settings(i.guild.id);
  const embed = new EmbedBuilder()
    .setTitle("👁️ Overseer Control Panel")
    .setDescription("Manage Overseer's AI, actions, confirmations and logging.")
    .addFields(
      { name: "AI", value: s.ai_enabled ? "🟢 Enabled" : "🔴 Disabled", inline: true },
      { name: "Actions", value: s.actions_enabled ? "🟢 Enabled" : "🔴 Disabled", inline: true },
      { name: "Confirmations", value: s.confirmations ? "🟡 Required for bans" : "🟢 Reduced", inline: true },
      { name: "Log channel", value: s.log_channel_id ? `<#${s.log_channel_id}>` : "Not configured", inline: true },
      { name: "Tickets", value: s.ticket_category_id ? "🟢 Configured" : "⚪ Not configured", inline: true },
      { name: "Ticket AI", value: s.ticket_ai_enabled ? `🟢 ${s.ticket_ai_cooldown || 8}s cooldown` : "🔴 Disabled", inline: true },
      { name: "Memory", value: `${db.memories(i.guild.id).length} stored facts`, inline: true },
      { name: "AutoMod", value: s.automod_enabled ? `🟢 ${s.automod_mode}` : "🔴 Disabled", inline: true },
      { name: "Incidents", value: `${db.automodIncidents(i.guild.id, 100).length} recent`, inline: true }
    );
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ov_ai_toggle").setLabel("Toggle AI").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("ov_actions_toggle").setLabel("Toggle Actions").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("ov_confirm_toggle").setLabel("Toggle Confirmations").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("ov_logs").setLabel("Recent Logs").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("ov_setup").setLabel("⚙️ Setup").setStyle(ButtonStyle.Success)
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ov_emergency").setLabel("🛑 Emergency Stop").setStyle(ButtonStyle.Danger)
  );
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ov_automod_toggle").setLabel("🛡️ Toggle AutoMod").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("ov_automod_incidents").setLabel("AutoMod Incidents").setStyle(ButtonStyle.Secondary)
  );
  const row4 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ov_ticket_ai").setLabel("🎫 Toggle Ticket AI").setStyle(ButtonStyle.Primary)
  );
  await i.reply({ embeds: [embed], components: [row1, row2, row3, row4], flags: MessageFlags.Ephemeral });
}

async function handleButton(i) {
  if (!staff(i.member)) return i.reply({ content: "❌ You need Manage Server.", flags: MessageFlags.Ephemeral });
  const id = i.customId;
  const s = db.settings(i.guild.id);
  if (id === "ov_ai_toggle") {
    db.update(i.guild.id, { ai_enabled: s.ai_enabled ? 0 : 1 });
    return i.update({ content: `AI is now **${s.ai_enabled ? "disabled" : "enabled"}**.`, embeds: [], components: [] });
  }
  if (id === "ov_actions_toggle") {
    db.update(i.guild.id, { actions_enabled: s.actions_enabled ? 0 : 1 });
    return i.update({ content: `AI actions are now **${s.actions_enabled ? "disabled" : "enabled"}**.`, embeds: [], components: [] });
  }
  if (id === "ov_confirm_toggle") {
    db.update(i.guild.id, { confirmations: s.confirmations ? 0 : 1 });
    return i.update({ content: `Ban confirmations are now **${s.confirmations ? "off" : "on"}**.`, embeds: [], components: [] });
  }
  if (id === "ov_setup") {
    return handleSetup(i);
  }
  if (id === "ov_emergency") {
    db.update(i.guild.id, { actions_enabled: 0 });
    db.log(i.guild.id, i.user.id, null, "EMERGENCY_STOP", "Overseer actions disabled from control panel");
    return i.update({ content: "🛑 **Emergency stop activated.** Overseer AI actions are disabled. You can re-enable them from the control panel.", embeds: [], components: [] });
  }
  if (id === "ov_ticket_ai") {
    db.update(i.guild.id, { ticket_ai_enabled: s.ticket_ai_enabled ? 0 : 1 });
    return i.update({ content: `🎫 Ticket AI is now **${s.ticket_ai_enabled ? "disabled" : "enabled"}**.`, embeds: [], components: [] });
  }
  if (id === "ov_automod_toggle") {
    db.update(i.guild.id, { automod_enabled: s.automod_enabled ? 0 : 1 });
    return i.update({ content: `🛡️ AutoMod is now **${s.automod_enabled ? "disabled" : "enabled"}**. Default mode: **${s.automod_mode || "supervised"}**.`, embeds: [], components: [] });
  }
  if (id === "ov_automod_incidents") {
    const rows = db.automodIncidents(i.guild.id, 10);
    const text = rows.length ? rows.map(x => `**${x.type}** • <@${x.user_id}> • ${x.action} • ${x.details}`).join("\n") : "No AutoMod incidents yet.";
    return i.update({ content: `🛡️ **Recent AutoMod Incidents**\n\n${text}`.slice(0, 1900), embeds: [], components: [] });
  }
  if (id === "ov_logs") {
    const rows = db.logs(i.guild.id, 10);
    const text = rows.length ? rows.map(x => `**${x.action}** • <@${x.actor_id || "0"}> • ${x.reason || "No reason"}`).join("\n") : "No logs yet.";
    return i.update({ content: `📋 **Recent Overseer Logs**\n\n${text}`.slice(0, 1900), embeds: [], components: [] });
  }
}

async function handleStatus(i) {
  if (!staff(i.member)) return i.reply({ content: "❌ You need Manage Server.", flags: MessageFlags.Ephemeral });
  const h = runtime.health();
  const ai = h.aiAvailable ? "🟢 Available" : `🟡 Cooling down (${h.quotaCooldownSeconds}s)`;
  return i.reply({ content: `${intelligence.summary(i.guild)}\n\n🤖 AI health: **${ai}**`, flags: MessageFlags.Ephemeral });
}

async function handleReport(i) {
  if (!staff(i.member)) return i.reply({ content: "❌ You need Manage Server.", flags: MessageFlags.Ephemeral });
  const days = i.options.getInteger("days", true);
  const sinceDate = new Date(Date.now() - days * 86400000);
  const counts = db.eventCounts(i.guild.id, sinceDate.toISOString());
  const tickets = db.ticketStats(i.guild.id).map(x => `${x.status}: ${x.n}`).join(" • ") || "none";
  const giveaways = db.giveawayStats(i.guild.id).map(x => `${x.status}: ${x.n}`).join(" • ") || "none";
  const incidents = db.automodIncidents(i.guild.id, 100).filter(x => new Date(x.created_at).getTime() >= sinceDate.getTime()).length;
  const events = counts.length ? counts.map(x => `• ${x.event_type}: **${x.n}**`).join("\n") : "No recorded events.";
  return i.reply({ content: `📊 **Overseer Server Report — ${days} day${days === 1 ? "" : "s"}**\n\nMembers: **${i.guild.memberCount}**\nWarnings recorded: **${db.memberWarningsCount(i.guild.id)}**\nAutoMod incidents: **${incidents}**\nTickets: **${tickets}**\nGiveaways: **${giveaways}**\n\n**Events**\n${events}`.slice(0, 3900), flags: MessageFlags.Ephemeral });
}

async function handleMemory(i) {
  if (!staff(i.member)) return i.reply({ content: "❌ You need Manage Server.", flags: MessageFlags.Ephemeral });
  const sub = i.options.getSubcommand();
  if (sub === "list") {
    const rows = db.memories(i.guild.id);
    const text = rows.length ? rows.map(x => `• **${x.key}** — ${x.value}`).join("\n") : "No stored server memory.";
    return i.reply({ content: `🧠 **Server Memory**\n\n${text}`.slice(0, 3900), flags: MessageFlags.Ephemeral });
  }
  const key = i.options.getString("key", true).trim().slice(0, 100);
  if (sub === "delete") {
    db.deleteMemory(i.guild.id, key);
    db.log(i.guild.id, i.user.id, null, "MEMORY_DELETE", key);
    return i.reply({ content: `🗑️ Deleted memory **${key}**.`, flags: MessageFlags.Ephemeral });
  }
  const value = i.options.getString("value", true).trim().slice(0, 1000);
  db.remember(i.guild.id, key, value);
  db.log(i.guild.id, i.user.id, null, "MEMORY_SET", `${key}: ${value}`);
  return i.reply({ content: `🧠 Saved **${key}**.`, flags: MessageFlags.Ephemeral });
}

async function handleAutomod(i) {
  if (!staff(i.member)) return i.reply({ content: "❌ You need Manage Server.", flags: MessageFlags.Ephemeral });
  const sub = i.options.getSubcommand();
  const s = db.settings(i.guild.id);
  if (sub === "status") {
    const incidents = db.automodIncidents(i.guild.id, 100).length;
    return i.reply({ content: `🛡️ **AutoMod Status**\n\nStatus: ${s.automod_enabled ? "🟢 Enabled" : "🔴 Disabled"}\nMode: **${s.automod_mode || "supervised"}**\nSpam threshold: **${s.automod_spam_threshold || 6}/10s**\nMention threshold: **${s.automod_mention_threshold || 5}**\nSuspicious-link filter: **${s.automod_link_filter ? "On" : "Off"}**\nRecent incidents: **${incidents}**`, flags: MessageFlags.Ephemeral });
  }
  if (sub === "enable") db.update(i.guild.id, { automod_enabled: 1 });
  if (sub === "disable") db.update(i.guild.id, { automod_enabled: 0 });
  if (sub === "mode") db.update(i.guild.id, { automod_mode: i.options.getString("mode", true) });
  if (sub === "links") db.update(i.guild.id, { automod_link_filter: i.options.getBoolean("enabled", true) ? 1 : 0 });
  if (sub === "thresholds") db.update(i.guild.id, {
    automod_spam_threshold: i.options.getInteger("spam", true),
    automod_mention_threshold: i.options.getInteger("mentions", true)
  });
  const latest = db.settings(i.guild.id);
  return i.reply({ content: `🛡️ AutoMod updated.\nStatus: **${latest.automod_enabled ? "Enabled" : "Disabled"}**\nMode: **${latest.automod_mode}**\nSuspicious links: **${latest.automod_link_filter ? "On" : "Off"}**`, flags: MessageFlags.Ephemeral });
}

async function handleTicketButton(i) {
  await i.deferReply({ flags: MessageFlags.Ephemeral });
  try {
    const result = await tickets.openTicket({ guild: i.guild, user: i.user, member: i.member, db });
    if (result.existing) return i.editReply(`❌ You already have an open ticket: ${result.existing}`);
    return i.editReply(`🎫 Ticket created: ${result.channel}`);
  } catch (e) {
    console.error("Ticket open error:", e);
    return i.editReply(`❌ ${e.message}`);
  }
}

async function handleTicketCloseButton(i) {
  try {
    await tickets.closeTicket({ channel: i.channel, userId: i.user.id, member: i.member, db, guild: i.guild });
    await i.reply({ content: "🔒 Closing ticket...", flags: MessageFlags.Ephemeral });
  } catch (e) {
    return i.reply({ content: `❌ ${e.message}`, flags: MessageFlags.Ephemeral });
  }
}

async function handleTicket(i) {
  const sub = i.options.getSubcommand();
  if (sub === "panel") {
    if (!staff(i.member)) return i.reply({ content: "❌ You need Manage Server.", flags: MessageFlags.Ephemeral });
    return i.reply({ content: "🎫 Ticket panel created.", ...tickets.ticketPanelPayload() });
  }
  if (sub === "close") {
    try {
      await tickets.closeTicket({ channel: i.channel, userId: i.user.id, member: i.member, db, guild: i.guild });
      return i.reply("🔒 Closing ticket...");
    } catch (e) {
      return i.reply({ content: `❌ ${e.message}`, flags: MessageFlags.Ephemeral });
    }
  }
  await i.deferReply({ flags: MessageFlags.Ephemeral });
  try {
    const result = await tickets.openTicket({ guild: i.guild, user: i.user, member: i.member, db });
    if (result.existing) return i.editReply(`❌ You already have an open ticket: ${result.existing}`);
    return i.editReply(`🎫 Ticket created: ${result.channel}`);
  } catch (e) {
    return i.editReply(`❌ ${e.message}`);
  }
}



client.on("error", error => console.error("Discord client error:", error));
process.on("unhandledRejection", error => console.error("Unhandled promise rejection:", error));
process.on("uncaughtException", error => console.error("Uncaught exception:", error));

console.log("👁️ Connecting Overseer V1.7.0 to Discord...");
client.login(process.env.DISCORD_TOKEN).then(() => console.log("🔐 Discord login accepted; waiting for Ready event...")).catch(error => {
  console.error("Failed to log Overseer into Discord:", error);
  process.exitCode = 1;
});
