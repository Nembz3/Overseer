const {
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  PermissionFlagsBits, ChannelType, EmbedBuilder
} = require("discord.js");

function isStaff(member) {
  return member?.permissions.has(PermissionFlagsBits.ManageGuild)
    || member?.permissions.has(PermissionFlagsBits.Administrator);
}

function ticketPanelPayload() {
  const embed = new EmbedBuilder()
    .setTitle("🎫 Support Centre")
    .setDescription("Need help? Click the button below to open a private support ticket. Overseer can assist while you wait for staff.")
    .addFields(
      { name: "Private", value: "Only you, staff, and Overseer can see your ticket.", inline: true },
      { name: "AI support", value: "Overseer can answer questions inside the ticket when enabled.", inline: true }
    );
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ticket_open").setLabel("Open Ticket").setEmoji("🎫").setStyle(ButtonStyle.Primary)
  );
  return { embeds: [embed], components: [row] };
}

async function openTicket({ guild, user, member, db }) {
  const s = db.settings(guild.id);
  if (!s.ticket_category_id) throw new Error("Tickets aren't configured yet. Ask an administrator to run /overseer-setup.");

  const existingRows = guild.channels.cache
    .filter(c => c.type === ChannelType.GuildText)
    .map(c => ({ channel: c, ticket: db.ticketByChannel(c.id) }))
    .find(x => x.ticket?.opener_id === user.id && x.ticket?.status === "open");

  if (existingRows) return { existing: existingRows.channel };

  const support = s.ticket_support_role_id ? guild.roles.cache.get(s.ticket_support_role_id) : null;
  const me = guild.members.me;
  const overwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
    { id: me.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels] }
  ];
  if (support) overwrites.push({ id: support.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });

  const safeName = user.username.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").slice(0, 80) || "member";
  const channel = await guild.channels.create({
    name: `ticket-${safeName}`,
    type: ChannelType.GuildText,
    parent: s.ticket_category_id,
    permissionOverwrites: overwrites,
    reason: "Overseer support ticket"
  });

  const ticketId = db.createTicket(guild.id, channel.id, user.id);
  db.log(guild.id, user.id, null, "TICKET_OPEN", channel.id);

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ticket_close").setLabel("Close Ticket").setEmoji("🔒").setStyle(ButtonStyle.Danger)
  );

  await channel.send({
    content: `🎫 Welcome <@${user.id}>! Please describe what you need help with. Overseer may assist automatically, and staff can join when needed.\n\nTicket ID: **#${ticketId}**`,
    components: [closeRow]
  });

  return { channel, ticketId };
}

async function closeTicket({ channel, userId, member, db, guild }) {
  const ticket = db.ticketByChannel(channel.id);
  if (!ticket) throw new Error("This isn't an Overseer ticket.");
  if (ticket.opener_id !== userId && !isStaff(member)) throw new Error("Only the ticket opener or staff can close this ticket.");

  db.closeTicket(channel.id);
  db.log(guild.id, userId, null, "TICKET_CLOSE", channel.id);
  await channel.send("🔒 Ticket closed. This channel will be deleted in 5 seconds.").catch(() => {});
  setTimeout(() => channel.delete("Overseer ticket closed").catch(() => {}), 5000);
}

module.exports = { ticketPanelPayload, openTicket, closeTicket, isStaff };
