const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("toggle-auto-threads")
    .setDescription(
      "Toggles the creation of threads for each message in selected channels"
    )
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription(
          "Toggles the Auto Threads feature of the bot. Off deletes all auto thread channels"
        )
        .setRequired(true)
        .addChoices({ name: "Off", value: "off" }, { name: "On", value: "on" })
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction, client) {
    let toggledState = interaction.options.getString("mode");

    // Process the data here

    try {
      const data = fs.readFileSync("./src/StoredData.json", "utf8");
      const jsonData = JSON.parse(data);
      jsonData.isAutoThreadOn = toggledState;
      if (toggledState === "off") {
        jsonData.autoThreadChannelsByID = [];
      }
      fs.writeFileSync(
        "./src/StoredData.json",
        JSON.stringify(jsonData, null, 2)
      );
      console.log(
        "Updated the state of AutoThreads and autoThreadChannels in StoredData.json"
      );

      if (toggledState === "on") {
        await interaction.reply({
          content: `Command was successful! Auto Threads is now turned on `,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `Command was successful! Auto Threads is now turned off.`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("Failed to update the state of Auto Threads:", error);
    }
  },
};
