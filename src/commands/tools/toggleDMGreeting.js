const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("toggle-dm-greeting")
    .setDescription(
      "Toggles the automatic greeting of new people, sets a link to the greeting message you wish to use"
    )
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription("Toggles the dm Greeting feature of the bot")
        .setRequired(true)
        .addChoices({ name: "Off", value: "off" }, { name: "On", value: "on" })
    )
    .addStringOption((option) =>
      option
        .setName("message_link")
        .setDescription(
          "Here you should input the Link of the message that the bot will use to greet people"
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction, client) {
    let messageObjectToSend = null;
    let testedMessageLink = null;
    let toggledState = null;
    try {
      toggledState = interaction.options.getString("mode");

      if (toggledState === "on") {
        const messageLink = await interaction.options.getString("message_link");

        if (!messageLink) {
          // Reply with an ephemeral message for a missing message link
          await interaction.reply({
            content:
              "You must provide a valid message link when turning on DM Greeting.",
            ephemeral: true,
          });
          return;
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
          return;
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
          return;
        }

        const targetChannel = targetGuild.channels.cache.get(channelId);
        if (!targetChannel) {
          // Reply with an ephemeral message for a non-existent target channel
          await interaction.reply({
            content:
              "Target channel not found. Please provide a valid message link.",
            ephemeral: true,
          });
          return;
        }

        const targetMessage = await targetChannel.messages.fetch(messageId);
        if (!targetMessage) {
          // Reply with an ephemeral message for a non-existent target message
          await interaction.reply({
            content:
              "Target message not found. Please provide a valid message link.",
            ephemeral: true,
          });
          return;
        }

        messageObjectToSend = {
          content: targetMessage.content,
          embeds: targetMessage.embeds,
          files: targetMessage.attachments.map((attachment) => attachment.url),
        };
        testedMessageLink = messageLink;
      }
    } catch (error) {
      console.error(error);
    }

    console.log(
      messageObjectToSend,
      "messageLink has passed all tests, ready to set it as the new DMGreeting message link"
    );

    // Process the data here

    try {
      const data = fs.readFileSync("./src/StoredData.json", "utf8");
      const jsonData = JSON.parse(data);
      jsonData.isDMGreetingOn = toggledState;
      jsonData.dmGreetingMessageLink = testedMessageLink;
      fs.writeFileSync(
        "./src/StoredData.json",
        JSON.stringify(jsonData, null, 2)
      );
      console.log(
        "Updated the state of isDMGreetingOn and dmGreetingMessageLink in StoredData.json"
      );

      if (toggledState === "on") {
        await interaction.reply({
          content: `Command was successful! DMGreeting is now turned on and uses the provided message to greet people! `,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `Command was successful! DMGreeting is now turned off.`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error(
        "Failed to update the state of isDMGreetingOn and dmGreetingMessageLink in StoredData.json:",
        error
      );
    }
  },
};
