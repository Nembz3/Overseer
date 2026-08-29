require("dotenv").config();
const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const overseer = new SlashCommandBuilder()
  .setName("overseer")
  .setDescription("Talk to Overseer")
  .addStringOption(o => o.setName("question").setDescription("Question or request").setRequired(true));

const panel = new SlashCommandBuilder()
  .setName("overseer-panel")
  .setDescription("Open the Overseer control panel")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString());

const diagnostics = new SlashCommandBuilder()
  .setName("overseer-diagnostics")
  .setDescription("View Overseer runtime diagnostics")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString());

const ticket = new SlashCommandBuilder()
  .setName("ticket")
  .setDescription("Open or manage an Overseer support ticket")
  .addSubcommand(s => s.setName("open").setDescription("Open a private support ticket"))
  .addSubcommand(s => s.setName("close").setDescription("Close the current ticket"))
  .addSubcommand(s => s.setName("panel").setDescription("Post a ticket opener panel"));

const giveaway = new SlashCommandBuilder()
  .setName("giveaway")
  .setDescription("Manage giveaways")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString())
  .addSubcommand(s => s.setName("start").setDescription("Start a giveaway")
    .addStringOption(o => o.setName("prize").setDescription("Giveaway prize").setRequired(true))
    .addIntegerOption(o => o.setName("minutes").setDescription("Duration in minutes").setRequired(true).setMinValue(1).setMaxValue(10080))
    .addIntegerOption(o => o.setName("winners").setDescription("Number of winners").setRequired(true).setMinValue(1).setMaxValue(20)))
  .addSubcommand(s => s.setName("end").setDescription("End a giveaway")
    .addStringOption(o => o.setName("message_id").setDescription("Giveaway message ID").setRequired(true)))
  .addSubcommand(s => s.setName("reroll").setDescription("Reroll a giveaway")
    .addStringOption(o => o.setName("message_id").setDescription("Giveaway message ID").setRequired(true)));



const automod = new SlashCommandBuilder()
  .setName("automod")
  .setDescription("Configure Overseer Smart AutoMod")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString())
  .addSubcommand(s => s.setName("status").setDescription("View AutoMod status"))
  .addSubcommand(s => s.setName("enable").setDescription("Enable AutoMod"))
  .addSubcommand(s => s.setName("disable").setDescription("Disable AutoMod"))
  .addSubcommand(s => s.setName("mode").setDescription("Set AutoMod mode")
    .addStringOption(o => o.setName("mode").setDescription("How AutoMod responds").setRequired(true)
      .addChoices({ name: "Supervised — log and alert staff", value: "supervised" },
                  { name: "Autonomous — timeout qualifying incidents", value: "autonomous" })))
  .addSubcommand(s => s.setName("links").setDescription("Toggle suspicious-link detection")
    .addBooleanOption(o => o.setName("enabled").setDescription("Enable detection").setRequired(true)))
  .addSubcommand(s => s.setName("thresholds").setDescription("Configure basic detection thresholds")
    .addIntegerOption(o => o.setName("spam").setDescription("Messages per 10 seconds").setMinValue(3).setMaxValue(20).setRequired(true))
    .addIntegerOption(o => o.setName("mentions").setDescription("Mentions in one message").setMinValue(2).setMaxValue(20).setRequired(true)));

const status = new SlashCommandBuilder()
  .setName("overseer-status")
  .setDescription("View Overseer's live server intelligence")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString());

const report = new SlashCommandBuilder()
  .setName("overseer-report")
  .setDescription("View a local server activity report")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString())
  .addIntegerOption(o => o.setName("days").setDescription("Report window in days").setRequired(true).setMinValue(1).setMaxValue(30));

const memory = new SlashCommandBuilder()
  .setName("overseer-memory")
  .setDescription("Manage Overseer's server memory")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString())
  .addSubcommand(s => s.setName("list").setDescription("List stored memory"))
  .addSubcommand(s => s.setName("set").setDescription("Save a memory")
    .addStringOption(o => o.setName("key").setDescription("Memory key").setRequired(true))
    .addStringOption(o => o.setName("value").setDescription("Memory value").setRequired(true)))
  .addSubcommand(s => s.setName("delete").setDescription("Delete a memory")
    .addStringOption(o => o.setName("key").setDescription("Memory key").setRequired(true)));

const confirm = new SlashCommandBuilder()
  .setName("overseer-confirm")
  .setDescription("Confirm a pending Overseer moderation action")
  .addStringOption(o => o.setName("id").setDescription("Confirmation ID shown by Overseer").setRequired(true));

const setup = new SlashCommandBuilder()
  .setName("overseer-setup")
  .setDescription("Configure Overseer server infrastructure")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString());

const commands = [overseer, panel, diagnostics, status, report, memory, confirm, setup, ticket, giveaway, automod].map(x => x.toJSON());
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  const route = process.env.DISCORD_GUILD_ID
    ? Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID)
    : Routes.applicationCommands(process.env.DISCORD_CLIENT_ID);
  await rest.put(route, { body: commands });
  console.log("Overseer V1.7.0 commands deployed.");
})().catch(console.error);
