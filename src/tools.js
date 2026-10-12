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

  functionTool("assign_role", "Give an existing server role to a member. Accept role ID or exact role name and member ID, mention, username or nickname.", {
    user_id: { type: "string", description: "Member ID, mention, username or nickname" },
    role_id: { type: "string", description: "Existing role ID or exact role name" }
  }, ["user_id", "role_id"]),

  functionTool("remove_role", "Remove an existing server role from a member. Accept role ID or exact role name and member ID, mention, username or nickname.", {
    user_id: { type: "string", description: "Member ID, mention, username or nickname" },
    role_id: { type: "string", description: "Existing role ID or exact role name" }
  }, ["user_id", "role_id"]),

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

  functionTool("list_roles", "List existing server roles with IDs.", {}, []),
  functionTool("list_channels", "List server channels and IDs.", {}, []),
  functionTool("member_info", "Get member profile, roles and join date.", {"user_id":{"type":"string"}}, ["user_id"]),
  functionTool("server_info", "Get server overview, member count and role/channel counts.", {}, []),
  functionTool("rename_member", "Change a member's server nickname.", {"user_id":{"type":"string"},"nickname":{"type":"string"}}, ["user_id","nickname"]),
  functionTool("edit_role", "Rename an existing role.", {"role_id":{"type":"string"},"name":{"type":"string"}}, ["role_id","name"]),
  functionTool("rename_channel", "Rename an existing channel.", {"channel_id":{"type":"string"},"name":{"type":"string"}}, ["channel_id","name"]),
  functionTool("set_channel_topic", "Set a text channel topic.", {"channel_id":{"type":"string"},"topic":{"type":"string"}}, ["channel_id","topic"]),
  functionTool("set_channel_slowmode", "Set slowmode in seconds (0-21600).", {"channel_id":{"type":"string"},"seconds":{"type":"integer","minimum":0,"maximum":21600}}, ["channel_id","seconds"]),
  functionTool("lock_channel", "Lock a channel against @everyone sending messages.", {"channel_id":{"type":"string"}}, ["channel_id"]),
  functionTool("unlock_channel", "Restore @everyone ability to send messages in a channel.", {"channel_id":{"type":"string"}}, ["channel_id"]),
  functionTool("move_channel", "Move a channel into an existing category.", {"channel_id":{"type":"string"},"category_id":{"type":"string"}}, ["channel_id","category_id"]),
  functionTool("send_message", "Post a message to a specified text channel on explicit staff request.", {"channel_id":{"type":"string"},"content":{"type":"string"}}, ["channel_id","content"]),
  functionTool("purge_messages", "Bulk-delete 1-100 recent messages younger than 14 days in a channel. Destructive: only on explicit staff request.", {"channel_id":{"type":"string"},"count":{"type":"integer","minimum":1,"maximum":100}}, ["channel_id","count"]),
  functionTool("unban_user", "Unban a user by Discord ID.", {"user_id":{"type":"string"},"reason":{"type":"string"}}, ["user_id"]),
  functionTool("remove_timeout", "Remove a member's timeout.", {"user_id":{"type":"string"}}, ["user_id"]),

  functionTool("remember", "Remember a non-sensitive server fact.", {
    key: { type: "string" }, value: { type: "string" }
  }, ["key", "value"])
];
