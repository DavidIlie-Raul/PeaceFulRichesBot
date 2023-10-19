const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say-from-link")
    .setDescription(
      "Send a message in the name of the bot! from a message link"
    )
    .addStringOption((option) =>
      option
        .setName("messagelink")
        .setDescription("The link of the message you want the bot to say")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction, client) {
    const retrieveMessageFromlink = async (linkToMessage) => {
      let messageObjectToSend = null;
      try {
        const messageLink = linkToMessage;

        if (!messageLink) {
          // Reply with an ephemeral message for an invalid message link
          await interaction.reply({
            content:
              "Invalid message link. Please provide a valid message link.",
            ephemeral: true,
          });
          return null;
        }

        // Extract the guild ID, channel ID, and message ID from the message link
        const match = messageLink.match(/channels\/(\d+)\/(\d+)\/(\d+)/);
        if (!match) {
          // Reply with an ephemeral message for an invalid message link format
          await interaction.reply({
            content:
              "Invalid message link format. Please provide a valid message link.",
            ephemeral: true,
          });
          return null;
        }

        const [_, guildId, channelId, messageId] = match;

        const targetGuild = client.guilds.cache.get(guildId);
        if (!targetGuild) {
          // Reply with an ephemeral message for a non-existent target guild
          await interaction.reply({
            content:
              "Target guild not found. Please provide a valid message link.",
            ephemeral: true,
          });
          return null;
        }

        const targetChannel = targetGuild.channels.cache.get(channelId);
        if (!targetChannel) {
          // Reply with an ephemeral message for a non-existent target channel
          await interaction.reply({
            content:
              "Target channel not found. Please provide a valid message link.",
            ephemeral: true,
          });
          return null;
        }

        const targetMessage = await targetChannel.messages.fetch(messageId);
        if (!targetMessage) {
          // Reply with an ephemeral message for a non-existent target message
          await interaction.reply({
            content:
              "Target message not found. Please provide a valid message link.",
            ephemeral: true,
          });
          return null;
        }

        messageObjectToSend = {
          content: targetMessage.content,
          embeds: targetMessage.embeds,
          files: targetMessage.attachments.map((attachment) => attachment.url),
          components: targetMessage.components,
        };
      } catch (error) {
        console.error(error);
      }
      return messageObjectToSend;
    };
    try {
      const messageLink = interaction.options.getString("messagelink");
      messageObjectToSend = await retrieveMessageFromlink(messageLink);
      await interaction.channel.send(messageObjectToSend);
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
