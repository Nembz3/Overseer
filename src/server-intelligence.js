const { PermissionFlagsBits } = require('discord.js');
const db = require('./database');

function snapshot(guild) {
  const s = db.settings(guild.id);
  const roles = [...guild.roles.cache.values()]
    .filter(r => r.id !== guild.id)
    .sort((a,b) => b.position - a.position)
    .slice(0, 40)
    .map(r => ({ name: r.name, id: r.id, position: r.position, managed: r.managed }));
  const channels = [...guild.channels.cache.values()]
    .sort((a,b) => (a.rawPosition ?? 0) - (b.rawPosition ?? 0))
    .slice(0, 80)
    .map(c => ({ name: c.name, id: c.id, type: c.type, parent: c.parent?.name || null }));
  const tickets = db.db.prepare("SELECT COUNT(*) AS n FROM tickets WHERE guild_id=? AND status='open'").get(guild.id).n;
  const giveaways = db.db.prepare("SELECT COUNT(*) AS n FROM giveaways WHERE guild_id=? AND status='running'").get(guild.id).n;
  const recentLogs = db.logs(guild.id, 8).map(x => ({ action: x.action, target_id: x.target_id, reason: x.reason, created_at: x.created_at }));
  return {
    guild: { id: guild.id, name: guild.name, owner_id: guild.ownerId, member_count: guild.memberCount },
    overseer: { ai_enabled: !!s.ai_enabled, actions_enabled: !!s.actions_enabled, confirmations: !!s.confirmations, automod_enabled: !!s.automod_enabled, automod_mode: s.automod_mode || 'supervised', tickets_ai: !!s.ticket_ai_enabled },
    roles, channels,
    rules: s.rules || 'No custom rules configured.',
    memory: db.memories(guild.id).slice(0, 50),
    open_tickets: tickets,
    active_giveaways: giveaways,
    recent_logs: recentLogs
  };
}

function summary(guild) {
  const x = snapshot(guild);
  return `👁️ **Server Intelligence**\n\n**${x.guild.name}**\nMembers: **${x.guild.member_count}**\nRoles: **${x.roles.length}**\nChannels: **${x.channels.length}**\nOpen tickets: **${x.open_tickets}**\nActive giveaways: **${x.active_giveaways}**\nAutoMod: **${x.overseer.automod_enabled ? x.overseer.automod_mode : 'disabled'}**\nAI: **${x.overseer.ai_enabled ? 'enabled' : 'disabled'}**\nActions: **${x.overseer.actions_enabled ? 'enabled' : 'disabled'}**`;
}

function permissions(member) {
  if (!member) return 'Unknown';
  const important = ['Administrator','ManageGuild','ManageChannels','ManageRoles','ModerateMembers','KickMembers','BanMembers','ManageMessages'];
  return important.filter(p => member.permissions.has(PermissionFlagsBits[p])).join(', ') || 'No elevated permissions';
}

module.exports = { snapshot, summary, permissions };
