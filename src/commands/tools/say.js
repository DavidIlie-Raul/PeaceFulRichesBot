const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Send a message in the name of the bot!")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message you want the bot to say")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction, client) {
    try {
      let messageToSay = interaction.options.getString("message");
      await interaction.channel.send(messageToSay);
      interaction.reply({ content: "Message Sent", ephemeral: true });
    } catch (error) {
      console.log(
        `Sending a message using the say command has failed. Here's the error` +
          error
      );
      await interaction.reply({
        content:
          "An error has occured with saying your message, please try again later!",
        ephemeral: true,
      });
    }
  },
};
