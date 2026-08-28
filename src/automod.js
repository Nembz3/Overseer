const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const db = require("./database");

const history = new Map();
const duplicateHistory = new Map();

function key(guildId, userId) { return `${guildId}:${userId}`; }

function getBucket(guildId, userId) {
  const k = key(guildId, userId);
  let b = history.get(k);
  if (!b) { b = []; history.set(k, b); }
  const now = Date.now();
  while (b.length && now - b[0] > 10000) b.shift();
  return b;
}

function isDuplicate(guildId, userId, content) {
  if (!content) return false;
  const k = key(guildId, userId);
  const now = Date.now();
  const arr = duplicateHistory.get(k) || [];
  const recent = arr.filter(x => now - x.time < 15000);
  recent.push({ content: content.slice(0, 500), time: now });
  duplicateHistory.set(k, recent.slice(-10));
  return recent.filter(x => x.content === content.slice(0, 500)).length >= 3;
}

function suspiciousLink(content) {
  return /https?:\/\/\S+/i.test(content) && /(discord\.gg\/|bit\.ly\/|tinyurl\.com\/|grabify|iplogger|webhook\.site)/i.test(content);
}

function isStaff(member) {
  return member.permissions.has(PermissionFlagsBits.ManageGuild) ||
    member.permissions.has(PermissionFlagsBits.ModerateMembers) ||
    member.permissions.has(PermissionFlagsBits.Administrator);
}

async function sendModNotice(message, incident, action) {
  const s = db.settings(message.guild.id);
  if (!s.mod_channel_id) return;
  const channel = message.guild.channels.cache.get(s.mod_channel_id) ||
    await message.guild.channels.fetch(s.mod_channel_id).catch(() => null);
  if (!channel?.isTextBased()) return;
  const embed = new EmbedBuilder()
    .setTitle("🛡️ Overseer AutoMod Incident")
    .setDescription(`Detected **${incident.type}** from <@${message.author.id}> in ${message.channel}.`)
    .addFields(
      { name: "Severity", value: `${incident.severity}/5`, inline: true },
      { name: "Mode", value: s.automod_mode || "supervised", inline: true },
      { name: "Action", value: action || "LOGGED", inline: true },
      { name: "Details", value: incident.details.slice(0, 900), inline: false }
    )
    .setTimestamp();
  await channel.send({ embeds: [embed] }).catch(() => {});
}

async function handle(message) {
  if (!message.guild || message.author.bot) return;
  const s = db.settings(message.guild.id);
  if (!s.automod_enabled) return;
  const member = message.member || await message.guild.members.fetch(message.author.id).catch(() => null);
  if (!member || isStaff(member) || member.id === message.guild.ownerId) return;

  const bucket = getBucket(message.guild.id, member.id);
  bucket.push(Date.now());

  const mentions = message.mentions.users.size + message.mentions.roles.size;
  const duplicate = isDuplicate(message.guild.id, member.id, message.content);
  const link = s.automod_link_filter && suspiciousLink(message.content);

  let incident = null;
  if (bucket.length >= Number(s.automod_spam_threshold || 6)) {
    incident = { type: "MESSAGE_SPAM", severity: 3, details: `${bucket.length} messages in ~10 seconds.` };
  } else if (mentions >= Number(s.automod_mention_threshold || 5)) {
    incident = { type: "MENTION_SPAM", severity: 4, details: `${mentions} user/role mentions in one message.` };
  } else if (duplicate) {
    incident = { type: "DUPLICATE_FLOOD", severity: 3, details: "Repeated the same message at least 3 times in 15 seconds." };
  } else if (link) {
    incident = { type: "SUSPICIOUS_LINK", severity: 4, details: "Message contains a link pattern commonly associated with link shorteners or IP-logging/scam domains." };
  }
  if (!incident) return;

  // Reset the spam bucket after an incident to avoid repeated actions every message.
  bucket.length = 0;
  let action = "LOGGED";
  const mode = s.automod_mode || "supervised";

  if (mode === "autonomous" && incident.severity >= 3 && member.moderatable &&
      message.guild.members.me?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    const minutes = Math.max(1, Math.min(60, Number(s.automod_timeout_minutes || 5)));
    await member.timeout(minutes * 60000, `Overseer AutoMod: ${incident.type}`).catch(() => {});
    action = `TIMEOUT ${minutes}m`;
  } else if (mode === "supervised") {
    action = "STAFF REVIEW";
  }

  db.addAutomodIncident({
    guild_id: message.guild.id,
    user_id: member.id,
    channel_id: message.channel.id,
    type: incident.type,
    severity: incident.severity,
    details: incident.details,
    action
  });
  db.log(message.guild.id, message.client.user.id, member.id, "AUTOMOD", `${incident.type}: ${action}`);
  await sendModNotice(message, incident, action);

  if (mode === "autonomous" && action.startsWith("TIMEOUT")) {
    await message.channel.send(`🛡️ <@${member.id}> has been temporarily timed out by Overseer AutoMod for suspected **${incident.type.toLowerCase().replaceAll("_", " ")}**.`).catch(() => {});
  }
}

function clearGuild(guildId) {
  for (const k of history.keys()) if (k.startsWith(`${guildId}:`)) history.delete(k);
  for (const k of duplicateHistory.keys()) if (k.startsWith(`${guildId}:`)) duplicateHistory.delete(k);
}

module.exports = { handle, clearGuild };
