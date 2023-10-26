const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-auto-thread-channel")
    .setDescription("Adds a channel to the auto threads feature")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel you want to add to auto threads")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction, client) {
    const pathToJsonStorage = "./src/StoredData.json";
    try {
      let selectedChannel = interaction.options.getChannel("channel");
      const storageFile = await fs.readFileSync(pathToJsonStorage, "utf-8");
      const jsonData = JSON.parse(storageFile);
      let autoThreadChannels = jsonData.autoThreadChannelsByID;
      // Check if the selected channel ID already exists in the array
      if (autoThreadChannels.includes(selectedChannel.id)) {
        await interaction.reply({
          content:
            "This channel is already selected for the auto threads feature",
          ephemeral: true,
        });
        console.log("Channel already selected for auto threads, returning");
        return;
      }
      jsonData.autoThreadChannelsByID = [
        ...autoThreadChannels,
        selectedChannel.id,
      ];
      fs.writeFileSync(
        "./src/StoredData.json",
        JSON.stringify(jsonData, null, 2)
      );
      interaction.reply({
        content: "Added channel to the auto threads feature! Have a great day.",
        ephemeral: true,
      });
    } catch (error) {
      console.log(
        `Sending a message using the say command has failed. Here's the error` +
          error
      );
      await interaction.reply({
        content:
          "An error has occured with adding the channel to auto threads, please try again later!",
        ephemeral: true,
      });
    }
  },
};
