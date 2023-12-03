const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("messageall")
    .setDescription("Send a DM to all members of the current server")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message to send")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("link-of-message-to-send")
        .setDescription(
          "A link towards a discord message, the bot will use the message from the link, with email capture."
        )
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction, client) {
    if (!interaction.guild) {
      // Reply with an ephemeral message for non-server channels
      await interaction.reply({
        content:
          "This command can only be used in server channels by an authorized Admin.",
        ephemeral: true,
      });
      return;
    }

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
        };
      } catch (error) {
        console.error(error);
      }
      return messageObjectToSend;
    };

    const member =
      interaction.member ||
      (interaction.guild &&
        (await interaction.guild.members.fetch(interaction.user)));

    let isUsingLinkAsMessage = false;
    let formattedMessage = null;

    const messageContent = interaction.options.getString("message");
    const messageLink = interaction.options.getString(
      "link-of-message-to-send"
    );

    if (messageContent === null || messageContent === undefined) {
      isUsingLinkAsMessage = true;
    } else {
      isUsingLinkAsMessage = false;
      formattedMessage = messageContent
        .replace(/\*\*(.*?)\*\*/g, "**$1**")
        .replace(/lb/g, "\n");
    }

    if (messageContent !== null && messageLink !== null) {
      // Reply with an ephemeral message for incorrect options
      await interaction.deferReply({
        ephemeral: true,
        content:
          "Wrong options, you cannot specify both a text message to send and a link to a different message.\nChoose one or the other: either send a text message or use the link function to send a message from a link and attach an email capture widget to it.",
      });
      return;
    }

    let messageObjectToSend = null;

    if (isUsingLinkAsMessage === true) {
      try {
        messageObjectToSend = await retrieveMessageFromlink(messageLink);
        console.log(messageObjectToSend);
      } catch (error) {
        console.error(error);
        // Reply with an ephemeral error message for message link processing
        await interaction.reply({
          content:
            "An error occurred while processing the message link. Please try again later.",
          ephemeral: true,
        });
        return;
      }
    } else if (isUsingLinkAsMessage === false) {
      messageObjectToSend = { content: formattedMessage };
    }

    //Fetch the latest version of all guild members
    await interaction.guild.members.fetch();
    // Fetch all members of the guild
    const guildMembers = Array.from(interaction.guild.members.cache);

    // Define the rate limit parameters
    const messagesPerMinute = 20; // Maximum number of messages per minute
    const interval = 60000 / messagesPerMinute; // Interval between each message in milliseconds

    // Iterate over each member and send the message
    for (const [index, guildMember] of guildMembers.entries()) {
      setTimeout(async () => {
        try {
          // Clone the original messageObjectToSend to avoid affecting other users
          const personalizedMessage = { ...messageObjectToSend };
          // Add "Hello [username]" to the message content
          personalizedMessage.content =
            `Hello <@${guildMember[1].user.id}>, \n` +
            personalizedMessage.content;

          // Send the message
          await guildMember[1].send(personalizedMessage);
          console.log(
            "Successfully sent a message to member " + guildMember[1].user.tag
          );
          console.log(`Current Index: ${index}`);
          console.log(`Remaining: ${guildMembers.length - index - 1}`);
        } catch (error) {
          console.error(
            "Failed to send DM to member " + guildMember[1].user.tag
          );
          console.error(error);
        }

        // Check if it's the last member or if the interval has passed
        if (
          index === guildMembers.length - 1 ||
          (index + 1) % messagesPerMinute === 0
        ) {
          console.log("Waiting for the next batch of messages...");
          await new Promise((resolve) => setTimeout(resolve, interval));
        }
      }, index * interval); // Set individual timeouts for each member
    }

    try {
      await interaction.reply({
        content:
          "Message sent to all members successfully! Have a Wonderful day filled with prosperity!",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Failed to send reply:", error);
    }
  },
};
