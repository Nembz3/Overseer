const Database = require("better-sqlite3");

const db = new Database(process.env.DB_PATH || "overseer.sqlite");
db.pragma("journal_mode=WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS guild_settings(
  guild_id TEXT PRIMARY KEY,
  rules TEXT DEFAULT '',
  ai_enabled INTEGER DEFAULT 1,
  actions_enabled INTEGER DEFAULT 1,
  confirmations INTEGER DEFAULT 1,
  log_channel_id TEXT,
  mod_channel_id TEXT,
  ticket_category_id TEXT,
  ticket_support_role_id TEXT,
  giveaway_channel_id TEXT,
  ticket_ai_enabled INTEGER DEFAULT 1,
  ticket_ai_cooldown INTEGER DEFAULT 8,
  autonomous_enabled INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS memory(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  key TEXT,
  value TEXT,
  UNIQUE(guild_id,key)
);
CREATE TABLE IF NOT EXISTS logs(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  actor_id TEXT,
  target_id TEXT,
  action TEXT,
  reason TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS warnings(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  user_id TEXT,
  moderator_id TEXT,
  reason TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS tickets(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  channel_id TEXT UNIQUE,
  opener_id TEXT,
  status TEXT DEFAULT 'open',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  closed_at TEXT
);
CREATE TABLE IF NOT EXISTS giveaways(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  channel_id TEXT,
  message_id TEXT UNIQUE,
  prize TEXT,
  winners INTEGER,
  ends_at INTEGER,
  status TEXT DEFAULT 'running',
  winner_ids TEXT DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS pending_actions(
  id TEXT PRIMARY KEY,
  guild_id TEXT,
  actor_id TEXT,
  action TEXT,
  payload TEXT,
  created_at INTEGER
);
CREATE TABLE IF NOT EXISTS cooldowns(
  guild_id TEXT,
  actor_id TEXT,
  action TEXT,
  last_used INTEGER,
  PRIMARY KEY(guild_id,actor_id,action)
);
`);

// V1.3 migrations for databases created by older versions.
for (const sql of [
  "ALTER TABLE guild_settings ADD COLUMN automod_enabled INTEGER DEFAULT 0",
  "ALTER TABLE guild_settings ADD COLUMN automod_mode TEXT DEFAULT 'supervised'",
  "ALTER TABLE guild_settings ADD COLUMN automod_timeout_minutes INTEGER DEFAULT 5",
  "ALTER TABLE guild_settings ADD COLUMN automod_spam_threshold INTEGER DEFAULT 6",
  "ALTER TABLE guild_settings ADD COLUMN automod_mention_threshold INTEGER DEFAULT 5",
  "ALTER TABLE guild_settings ADD COLUMN automod_link_filter INTEGER DEFAULT 0",
  "ALTER TABLE guild_settings ADD COLUMN automod_ai_review INTEGER DEFAULT 0",
  "ALTER TABLE guild_settings ADD COLUMN ticket_ai_enabled INTEGER DEFAULT 1",
  "ALTER TABLE guild_settings ADD COLUMN ticket_ai_cooldown INTEGER DEFAULT 8",
  "ALTER TABLE guild_settings ADD COLUMN autonomous_enabled INTEGER DEFAULT 0"
]) { try { db.exec(sql); } catch (_) {} }

db.exec(`
CREATE TABLE IF NOT EXISTS automod_incidents(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  user_id TEXT,
  channel_id TEXT,
  type TEXT,
  severity INTEGER DEFAULT 1,
  details TEXT,
  action TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS event_stats(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT,
  event_type TEXT,
  actor_id TEXT,
  details TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

function ensure(guildId) {
  db.prepare("INSERT INTO guild_settings(guild_id) VALUES(?) ON CONFLICT DO NOTHING").run(guildId);
}
function settings(guildId) { ensure(guildId); return db.prepare("SELECT * FROM guild_settings WHERE guild_id=?").get(guildId); }
function update(guildId, patch) {
  ensure(guildId);
  const allowed = new Set([
    "rules","ai_enabled","actions_enabled","confirmations","log_channel_id","mod_channel_id","ticket_category_id","ticket_support_role_id","giveaway_channel_id",
    "automod_enabled","automod_mode","automod_timeout_minutes","automod_spam_threshold","automod_mention_threshold","automod_link_filter","automod_ai_review",
    "ticket_ai_enabled","ticket_ai_cooldown","autonomous_enabled"
  ]);
  const entries = Object.entries(patch).filter(([k]) => allowed.has(k));
  if (!entries.length) return;
  const sql = entries.map(([k]) => `${k}=@${k}`).join(", ");
  db.prepare(`UPDATE guild_settings SET ${sql} WHERE guild_id=@guild_id`).run(Object.fromEntries([...entries,["guild_id",guildId]]));
}
function remember(guildId,key,value){ db.prepare(`INSERT INTO memory(guild_id,key,value) VALUES(?,?,?) ON CONFLICT(guild_id,key) DO UPDATE SET value=excluded.value`).run(guildId,key,value); }
function memories(guildId){ return db.prepare("SELECT key,value FROM memory WHERE guild_id=? ORDER BY key").all(guildId); }
function deleteMemory(guildId,key){ return db.prepare("DELETE FROM memory WHERE guild_id=? AND key=?").run(guildId,key); }
function log(guildId,actorId,targetId,action,reason){ db.prepare("INSERT INTO logs(guild_id,actor_id,target_id,action,reason) VALUES(?,?,?,?,?)").run(guildId,actorId||null,targetId||null,action,reason||""); }
function logs(guildId,limit=25){ return db.prepare("SELECT * FROM logs WHERE guild_id=? ORDER BY id DESC LIMIT ?").all(guildId,limit); }
function addWarning(guildId,userId,moderatorId,reason){ db.prepare("INSERT INTO warnings(guild_id,user_id,moderator_id,reason) VALUES(?,?,?,?)").run(guildId,userId,moderatorId,reason); }
function warnings(guildId,userId,limit=20){ return db.prepare("SELECT * FROM warnings WHERE guild_id=? AND user_id=? ORDER BY id DESC LIMIT ?").all(guildId,userId,limit); }
function createTicket(guildId,channelId,openerId){ return db.prepare("INSERT INTO tickets(guild_id,channel_id,opener_id) VALUES(?,?,?)").run(guildId,channelId,openerId).lastInsertRowid; }
function ticketByChannel(channelId){ return db.prepare("SELECT * FROM tickets WHERE channel_id=?").get(channelId); }
function closeTicket(channelId){ db.prepare("UPDATE tickets SET status='closed', closed_at=CURRENT_TIMESTAMP WHERE channel_id=?").run(channelId); }
function ticketStats(guildId){ return db.prepare("SELECT status,COUNT(*) AS n FROM tickets WHERE guild_id=? GROUP BY status").all(guildId); }
function createGiveaway(data){ return db.prepare(`INSERT INTO giveaways(guild_id,channel_id,message_id,prize,winners,ends_at) VALUES(@guild_id,@channel_id,@message_id,@prize,@winners,@ends_at)`).run(data).lastInsertRowid; }
function runningGiveaways(){ return db.prepare("SELECT * FROM giveaways WHERE status='running'").all(); }
function finishGiveaway(messageId,winnerIds){ db.prepare("UPDATE giveaways SET status='ended',winner_ids=? WHERE message_id=?").run(JSON.stringify(winnerIds),messageId); }
function giveawayStats(guildId){ return db.prepare("SELECT status,COUNT(*) AS n FROM giveaways WHERE guild_id=? GROUP BY status").all(guildId); }
function createPending(id,guildId,actorId,action,payload){ db.prepare("INSERT INTO pending_actions(id,guild_id,actor_id,action,payload,created_at) VALUES(?,?,?,?,?,?)").run(id,guildId,actorId,action,JSON.stringify(payload),Date.now()); }
function getPending(id){ const row=db.prepare("SELECT * FROM pending_actions WHERE id=?").get(id); if(!row)return null; if(Date.now()-row.created_at>300000){deletePending(id);return null;} return {...row,payload:JSON.parse(row.payload)}; }
function deletePending(id){db.prepare("DELETE FROM pending_actions WHERE id=?").run(id);}
function cooldownReady(guildId,actorId,action,seconds){ const now=Date.now(); const row=db.prepare("SELECT last_used FROM cooldowns WHERE guild_id=? AND actor_id=? AND action=?").get(guildId,actorId,action); if(row&&now-row.last_used<seconds*1000)return false; db.prepare(`INSERT INTO cooldowns(guild_id,actor_id,action,last_used) VALUES(?,?,?,?) ON CONFLICT(guild_id,actor_id,action) DO UPDATE SET last_used=excluded.last_used`).run(guildId,actorId,action,now); return true; }
function addAutomodIncident(data){return db.prepare(`INSERT INTO automod_incidents(guild_id,user_id,channel_id,type,severity,details,action) VALUES(@guild_id,@user_id,@channel_id,@type,@severity,@details,@action)`).run(data).lastInsertRowid;}
function automodIncidents(guildId,limit=25){return db.prepare("SELECT * FROM automod_incidents WHERE guild_id=? ORDER BY id DESC LIMIT ?").all(guildId,limit);}
function recordEvent(guildId,eventType,actorId,details){db.prepare("INSERT INTO event_stats(guild_id,event_type,actor_id,details) VALUES(?,?,?,?)").run(guildId,eventType,actorId||null,details||"");}
function eventCounts(guildId,since){return db.prepare("SELECT event_type,COUNT(*) AS n FROM event_stats WHERE guild_id=? AND created_at>=? GROUP BY event_type ORDER BY n DESC").all(guildId,since);}
function memberWarningsCount(guildId){return db.prepare("SELECT COUNT(*) AS n FROM warnings WHERE guild_id=?").get(guildId).n;}
module.exports={db,settings,update,remember,memories,deleteMemory,log,logs,addWarning,warnings,createTicket,ticketByChannel,closeTicket,ticketStats,createGiveaway,runningGiveaways,finishGiveaway,giveawayStats,createPending,getPending,deletePending,cooldownReady,addAutomodIncident,automodIncidents,recordEvent,eventCounts,memberWarningsCount};
