const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removerole")
    .setDescription("Removes a role from a user"),

  async execute(interaction, client) {
    console.log("remove-role is being used");
    await interaction.reply("remove-role was used successfully");
  },
};
