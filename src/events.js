const { Events, EmbedBuilder } = require("discord.js");
const { ask } = require("./ai");
const db = require("./database");
const automod = require("./automod");
const runtime = require("./runtime");
const proactive = require("./proactive");

function registerEventHandlers(client, { sendLog, staff }) {
  const ticketAiCooldown = new Map();

  client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.guild || !client.user) return;
  const s = db.settings(message.guild.id);
  proactive.onMessage(message, sendLog).catch(e => console.error("Proactive message monitor error:", e));
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

// V1.8 activity logging
  client.on(Events.GuildMemberAdd, async member => {
  db.log(member.guild.id, null, member.id, "MEMBER_JOIN", member.user.tag);
  db.recordEvent(member.guild.id, "MEMBER_JOIN", member.id, member.user.tag);
  proactive.onMemberJoin(member, sendLog).catch(e => console.error("Proactive join monitor error:", e));
  await sendLog(member.guild, new EmbedBuilder().setDescription(`📥 **Member joined:** ${member.user.tag}`).setTimestamp());
  });

  client.on(Events.GuildMemberRemove, async member => {
  db.log(member.guild.id, null, member.id, "MEMBER_LEAVE", member.user?.tag || "Unknown");
  db.recordEvent(member.guild.id, "MEMBER_LEAVE", member.id, member.user?.tag || "Unknown");
  await sendLog(member.guild, new EmbedBuilder().setDescription(`📤 **Member left:** ${member.user?.tag || member.id}`).setTimestamp());
  });

  client.on(Events.MessageDelete, async message => {
  if (message.partial) await message.fetch().catch(() => {});
  if (!message.guild || message.author?.bot) return;
  db.log(message.guild.id, null, message.author?.id || null, "MESSAGE_DELETE", String(message.channel?.id || ""));
  db.recordEvent(message.guild.id, "MESSAGE_DELETE", message.author?.id || null, String(message.channel?.id || ""));
  const description = `🗑️ **Message deleted**\nChannel: <#${message.channel.id}>\nAuthor: **${message.author?.tag || "Unknown (message was not cached)"}**${message.content ? `\n\n> ${message.content.slice(0, 800)}` : ""}`;
  await sendLog(message.guild, new EmbedBuilder().setDescription(description).setTimestamp());
  });

  client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
  if (newMessage.partial) await newMessage.fetch().catch(() => {});
  if (!newMessage.guild || newMessage.author?.bot) return;
  if (oldMessage.partial) await oldMessage.fetch().catch(() => {});
  if (newMessage.partial) await newMessage.fetch().catch(() => {});
  if (oldMessage.content === newMessage.content) return;
  db.log(newMessage.guild.id, null, newMessage.author?.id || null, "MESSAGE_EDIT", String(newMessage.channel?.id || ""));
  db.recordEvent(newMessage.guild.id, "MESSAGE_EDIT", newMessage.author?.id || null, String(newMessage.channel?.id || ""));
  const description = `✏️ **Message edited**\nChannel: <#${newMessage.channel.id}>\nAuthor: **${newMessage.author?.tag || "Unknown"}**\n\n**Before:** ${String(oldMessage.content || "[unavailable]").slice(0, 500)}\n**After:** ${String(newMessage.content || "[empty]").slice(0, 500)}`;
  await sendLog(newMessage.guild, new EmbedBuilder().setDescription(description).setTimestamp());
});


}

module.exports = { registerEventHandlers };
