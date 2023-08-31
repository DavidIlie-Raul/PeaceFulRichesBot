const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("changehelpchannel")
    .setDescription("Change the channel for help requests")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The new channel for help requests")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction, client) {
    function updateTargetChannel(serverId, channelId) {
      try {
        const data = fs.readFileSync("./src/helpmeTarget.json", "utf8");
        const jsonData = JSON.parse(data);
        jsonData.targetServerId = serverId;
        jsonData.targetChannelId = channelId;
        fs.writeFileSync(
          "./src/helpmeTarget.json",
          JSON.stringify(jsonData, null, 2)
        );
        console.log("Updated target channel ID in helpmeTarget.json");
      } catch (error) {
        console.error(
          "Failed to update target channel ID in helpmeTarget.json:",
          error
        );
      }
    }

    const member =
      interaction.member ||
      (interaction.guild &&
        (await interaction.guild.members.fetch(interaction.user)));

    const newChannelId = interaction.options.getChannel("channel").id;
    const guild = client.guilds.cache.get(interaction.guildId);
    const newChannel = guild.channels.cache.get(newChannelId);

    if (newChannel) {
      const targetServerId = interaction.guildId;
      const targetChannelId = newChannelId;
      updateTargetChannel(targetServerId, targetChannelId); // Update the target channel ID in the JSON file

      let helpRequestsChannelName = newChannel.name;
      await interaction.reply(
        `The help requests channel has been updated to ${newChannel}.`
      );
      console.log(helpRequestsChannelName);
    } else {
      console.log(newChannel);
      await interaction.reply("The specified channel was not found.");
    }
  },
};
