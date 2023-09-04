const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bothelp")
    .setDescription(
      "Lists all the commands of Peaceful Riches Bot and what they do!"
    ),

  async execute(interaction, client) {
    try {
      await interaction.reply({
        content:
          "Available commands:\n\n" +
          "/age-to-moons (age) - converts your age to age in moons\n" +
          "/quote - Displays a Random Quote\n" +
          "/helpme - Contacts one of our staff members who will get in touch with you ASAP, no matter the issue!",
        ephemeral: true,
      });
    } catch (error) {
      console.log(error);
      await interaction.reply({
        content: "BotHelp could not be displayed, sorry for the inconvenience!",
        ephemeral: true,
      });
    }
  },
};
