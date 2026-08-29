const startedAt = Date.now();
let quotaUntil = 0;
let lastAiError = null;
let aiRequests = 0;
let localRequests = 0;

function isQuotaError(error) {
  const text = String(error?.message || error || "").toLowerCase();
  return error?.status === 429 || text.includes("quota") || text.includes("rate limit") || text.includes("resource exhausted");
}
function markAiRequest() { aiRequests++; }
function markLocalRequest() { localRequests++; }
function markAiError(error) {
  lastAiError = { at: Date.now(), message: String(error?.message || error || "Unknown AI error") };
  if (isQuotaError(error)) quotaUntil = Date.now() + 60_000;
}
function clearAiError() { lastAiError = null; }
function aiAvailable() { return Date.now() >= quotaUntil; }
function friendlyAiError(error) {
  if (isQuotaError(error) || !aiAvailable()) return "⏳ Overseer's Gemini quota or rate limit has been reached temporarily. Please try again later.";
  return "❌ I couldn't contact the AI right now. The error was logged for the server administrator.";
}
function routeLocal(guild, member, text) {
  const q = text.trim().toLowerCase().replace(/[?!.,]+$/g, "");
  const has = (...phrases) => phrases.some(p => q === p || q.includes(p));
  if (has("how many members", "member count", "how many people", "members are there")) return `👥 This server currently has **${guild.memberCount} members**.`;
  if (has("roles do i have", "what are my roles", "my roles", "tell me my roles", "which roles")) {
    const roles = member?.roles?.cache?.filter(r => r.id !== guild.id).map(r => r.toString()) || [];
    return roles.length ? `🪪 Your roles: ${roles.join(", ")}` : "🪪 You don't currently have any server roles.";
  }
  if (has("permissions do i have", "check my permissions", "my permissions", "tell me my permissions")) {
    const perms = member?.permissions?.toArray?.().filter(p => !p.startsWith("UseExternal") && !p.startsWith("SendVoiceMessages")).slice(0, 25) || [];
    return perms.length ? `🔐 Your key permissions include: **${perms.join(", ")}**.` : "🔐 I couldn't find any special permissions.";
  }
  if (has("how many channels", "channel count", "channels are there")) return `📁 This server currently has **${guild.channels.cache.size} channels/categories**.`;
  if (has("how many roles", "role count", "roles are there")) return `🪪 This server currently has **${guild.roles.cache.size - 1} roles** (excluding @everyone).`;
  if (has("what is my username", "who am i", "my username")) return `👤 You're **${member?.user?.tag || "a server member"}**.`;
  if (has("server owner", "who owns this server")) return `👑 The server owner is <@${guild.ownerId}>.`;
  return null;
}
function health() {
  return {
    aiAvailable: aiAvailable(),
    quotaCooldownSeconds: Math.max(0, Math.ceil((quotaUntil - Date.now()) / 1000)),
    lastAiError,
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    aiRequests,
    localRequests
  };
}
module.exports = { markAiRequest, markLocalRequest, markAiError, clearAiError, aiAvailable, friendlyAiError, routeLocal, health };