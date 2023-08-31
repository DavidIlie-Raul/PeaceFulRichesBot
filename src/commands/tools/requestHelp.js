const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("helpme")
    .setDescription("Request help from one of our staff members!"),

  async execute(interaction, client) {
    function readTargetServerId() {
      try {
        const data = fs.readFileSync("./src/helpmeTarget.json", "utf8");
        const jsonData = JSON.parse(data);
        return jsonData.targetServerId;
      } catch (error) {
        console.error(
          "Failed to read target server ID from helpmeTarget.json:",
          error
        );
        return null;
      }
    }

    // Helper function to read the target channel ID from the JSON file
    function readTargetChannelId() {
      try {
        const data = fs.readFileSync("./src/helpmeTarget.json", "utf8");
        const jsonData = JSON.parse(data);
        return jsonData.targetChannelId;
      } catch (error) {
        console.error(
          "Failed to read target channel ID from helpmeTarget.json:",
          error
        );
        return null;
      }
    }
    const member =
      interaction.member ||
      (interaction.guild &&
        (await interaction.guild.members.fetch(interaction.user)));

    if (interaction.guild) {
      const guild = client.guilds.cache.get(interaction.guildId);
      const requestingMember =
        interaction.member ||
        (interaction.guild &&
          (await interaction.guild.members.fetch(interaction.user)));

      const targetServerId = readTargetServerId(); // Read the target server ID from the JSON file
      const targetChannelId = readTargetChannelId(); // Read the target channel ID from the JSON file

      const targetGuild = client.guilds.cache.get(targetServerId);
      const targetChannel = targetGuild?.channels.cache.get(targetChannelId);

      if (targetChannel) {
        await targetChannel.send(
          `${requestingMember} from server ${guild.name} has requested your help.`
        );
        await interaction.reply({
          content:
            "Your help request has been sent. One of our staff will be in touch soon! Have a great day filled with prosperity!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content:
            "The help request could not be sent. Please contact Tech support.",
          ephemeral: true,
        });
      }
    } else {
      let helpRequestsChannel = client.channels.cache.find(
        (channel) => channel.name === helpRequestsChannelName
      );

      if (helpRequestsChannel) {
        await helpRequestsChannel.send(
          `${interaction.user} has asked for help in a direct message towards the Peaceful Riches Bot.`
        );
        await interaction.reply({
          content:
            "Your help request has been sent. One of our staff will be in touch soon! Have a great day filled with prosperity!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content:
            "The help-request could not be sent. Please contact Tech support.",
          ephemeral: true,
        });
      }
    }
  },
};
