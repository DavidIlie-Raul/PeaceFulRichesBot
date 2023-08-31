const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-email-button")
    .setDescription(
      "Adds a button to a message using the messageID of it that allows for EmailCapture"
    )
    .addStringOption((option) =>
      option
        .setName("message_link")
        .setDescription(
          "Here you should input the Link of the message you wish to copy and add the button to"
        )
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction, client) {
    try {
      const messageLink = interaction.options.getString("message_link");
      if (!messageLink) {
        return interaction.reply(
          "Invalid message link. Please provide a valid message link."
        );
      }

      // Extract the guild ID, channel ID, and message ID from the message link
      const match = messageLink.match(/channels\/(\d+)\/(\d+)\/(\d+)/);
      if (!match) {
        return interaction.reply(
          "Invalid message link format. Please provide a valid message link."
        );
      }

      const [_, guildId, channelId, messageId] = match;

      const targetGuild = client.guilds.cache.get(guildId);
      if (!targetGuild) {
        return interaction.reply(
          "Target guild not found. Please provide a valid message link."
        );
      }

      const targetChannel = targetGuild.channels.cache.get(channelId);
      if (!targetChannel) {
        return interaction.reply(
          "Target channel not found. Please provide a valid message link."
        );
      }

      const targetMessage = await targetChannel.messages.fetch(messageId);
      if (!targetMessage) {
        return interaction.reply(
          "Target message not found. Please provide a valid message link."
        );
      }

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("email_capture")
          .setLabel("Sign up to our Newsletter!")
          .setStyle("3")
      );

      // Defer the reply to indicate the bot is processing
      await interaction.deferReply();

      await interaction.channel.send({
        content: targetMessage.content,
        embeds: targetMessage.embeds,
        files: targetMessage.attachments.map((attachment) => attachment.url),
        components: [row],
      });

      // Respond to the interaction after processing is complete
      await interaction.editReply(
        "Button added successfully to the targeted message."
      );
    } catch (error) {
      console.log(error);
      await interaction.editReply(
        "An error has occurred while adding the button. Please contact Tech Support!"
      );
    }
  },
};
