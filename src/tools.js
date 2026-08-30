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
  functionTool("timeout_user", "Timeout a member for a clear rule violation.", {
    user_id: { type: "string" },
    duration_minutes: { type: "integer", minimum: 1, maximum: 40320 },
    reason: { type: "string" }
  }, ["user_id", "duration_minutes", "reason"]),

  functionTool("kick_user", "Kick a member for a clear rule violation.", {
    user_id: { type: "string" }, reason: { type: "string" }
  }, ["user_id", "reason"]),

  functionTool("ban_user", "Ban a member for a severe established violation.", {
    user_id: { type: "string" }, reason: { type: "string" }
  }, ["user_id", "reason"]),

  functionTool("warn_user", "Issue a formal warning to a member.", {
    user_id: { type: "string" }, reason: { type: "string" }
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
