const functionTool = (name, description, properties, required) => ({
  name,
  description,
  parameters: {
    type: "object",
    properties,
    required,
    additionalProperties: false
  }
});

module.exports.tools = [
  functionTool("timeout_user", "Timeout a member at an authorised moderator's request; usernames are accepted.", {
    user_id: { type: "string", description: "Discord user ID, mention, exact username, global display name or server nickname; ask if the name is ambiguous." },
    duration_minutes: { type: "integer", minimum: 1, maximum: 40320 },
    reason: { type: "string" }
  }, ["user_id", "duration_minutes", "reason"]),

  functionTool("kick_user", "Kick a member at an authorised moderator's request; usernames are accepted.", {
    user_id: { type: "string", description: "Discord user ID, mention, exact username, global display name or server nickname; ask if the name is ambiguous." }, reason: { type: "string" }
  }, ["user_id", "reason"]),

  functionTool("ban_user", "Ban a member when an authorised moderator explicitly requests it. Accept username, nickname, mention or ID; do not invent reasons.", {
    user_id: { type: "string", description: "Discord user ID, mention, exact username, global display name or server nickname; ask if the name is ambiguous." }, reason: { type: "string" }
  }, ["user_id", "reason"]),

  functionTool("warn_user", "Warn a member at an authorised moderator's request; usernames are accepted.", {
    user_id: { type: "string", description: "Discord user ID, mention, exact username, global display name or server nickname; ask if the name is ambiguous." }, reason: { type: "string" }
  }, ["user_id", "reason"]),

  functionTool("create_role", "Create a server role.", {
    name: { type: "string" }, color: { type: "string" }
  }, ["name"]),

  functionTool("create_channel", "Create a text or voice channel. Use this for a single channel.", {
    name: { type: "string" }, type: { type: "string", enum: ["text", "voice"] }
  }, ["name", "type"]),

  functionTool("create_category", "Create a Discord category for organising channels.", {
    name: { type: "string" }
  }, ["name"]),

  functionTool("create_channel_group", "Create a category and multiple text or voice channels inside it as one planned action. Use for requests that clearly ask for a group of related channels.", {
    category_name: { type: "string" },
    channels: { type: "array", minItems: 1, maxItems: 15, items: { type: "object", properties: { name: { type: "string" }, type: { type: "string", enum: ["text", "voice"] } }, required: ["name", "type"], additionalProperties: false } }
  }, ["category_name", "channels"]),

  functionTool("remember", "Remember a non-sensitive server fact.", {
    key: { type: "string" }, value: { type: "string" }
  }, ["key", "value"])
];
