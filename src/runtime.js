let quotaUntil = 0;
let lastAiError = null;

function isQuotaError(error) {
  const text = String(error?.message || error || "").toLowerCase();
  return error?.status === 429 || text.includes("quota") || text.includes("rate limit") || text.includes("resource exhausted");
}

function markAiError(error) {
  lastAiError = { at: Date.now(), message: String(error?.message || error || "Unknown AI error") };
  if (isQuotaError(error)) quotaUntil = Date.now() + 60_000;
}

function clearAiError() { lastAiError = null; }

function aiAvailable() { return Date.now() >= quotaUntil; }

function friendlyAiError(error) {
  if (isQuotaError(error) || !aiAvailable()) {
    return "⏳ Overseer's Gemini quota or rate limit has been reached temporarily. Please try again later.";
  }
  return "❌ I couldn't contact the AI right now. The error was logged for the server administrator.";
}

function routeLocal(guild, member, text) {
  const q = text.trim().toLowerCase().replace(/[?!.,]+$/g, "");
  if (/^(how many members|member count|how many people)/.test(q)) return `👥 This server currently has **${guild.memberCount} members**.`;
  if (/^(what roles do i have|what are my roles|my roles)$/.test(q)) {
    const roles = member?.roles?.cache?.filter(r => r.id !== guild.id).map(r => r.toString()) || [];
    return roles.length ? `🪪 Your roles: ${roles.join(", ")}` : "🪪 You don't currently have any server roles.";
  }
  if (/^(what permissions do i have|check my permissions|my permissions)$/.test(q)) {
    const perms = member?.permissions?.toArray?.().filter(p => !p.startsWith("UseExternal") && !p.startsWith("SendVoiceMessages")).slice(0, 25) || [];
    return perms.length ? `🔐 Your key permissions include: **${perms.join(", ")}**.` : "🔐 I couldn't find any special permissions.";
  }
  if (/^(how many channels|channel count)$/.test(q)) {
    return `📁 This server currently has **${guild.channels.cache.size} channels/categories**.`;
  }
  if (/^(what is my username|who am i)$/.test(q)) return `👤 You're **${member?.user?.tag || "a server member"}**.`;
  return null;
}

function health() {
  return { aiAvailable: aiAvailable(), quotaCooldownSeconds: Math.max(0, Math.ceil((quotaUntil - Date.now()) / 1000)), lastAiError };
}

module.exports = { markAiError, clearAiError, aiAvailable, friendlyAiError, routeLocal, health };
