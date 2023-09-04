const { Client } = require("discord.js");
const fs = require("fs");

module.exports = {
  name: "guildMemberAdd",

  async execute(member) {
    const storedDataFile = fs.readFileSync("src/StoredData.json", "utf-8");
    const dataFromLocalStorage = JSON.parse(storedDataFile);

    const messageLink = dataFromLocalStorage.dmGreetingMessageLink;
    const isDMGreetingOn = dataFromLocalStorage.isDMGreetingOn;

    let messageObjectToSend = null;
    try {
      if (!messageLink) {
        // Reply with an ephemeral message for an invalid message link
        console.log(
          "No message link has been provided for greeting a new member"
        );
        return null;
      }

      // Extract the guild ID, channel ID, and message ID from the message link
      const match = messageLink.match(/channels\/(\d+)\/(\d+)\/(\d+)/);
      if (!match) {
        console.error(
          "The message link provided for greeting a new member is invalid"
        );
        return null;
      }

      const [_, guildId, channelId, messageId] = match;

      const targetGuild = member.guild; // Use member.guild instead of client.guilds.cache.get(guildId)
      if (!targetGuild) {
        // Reply with an ephemeral message for a non-existent target guild
        console.error(
          "Target guild for messageLink of Greeting has not been found"
        );
        return null;
      }

      const targetChannel = targetGuild.channels.cache.get(channelId);
      if (!targetChannel) {
        console.error(
          "The target channel for messageLink of Greeting has not been found"
        );
        return null;
      }

      const targetMessage = await targetChannel.messages.fetch(messageId);
      if (!targetMessage) {
        console.error(
          "The target message for messageLink of Greeting has not been found"
        );
        return null;
      }

      messageObjectToSend = {
        content: `Welcome to the ${member.guild.name} server, <@!${member.id}>! ${targetMessage.content}`,
        embeds: targetMessage.embeds,
        files: targetMessage.attachments.map((attachment) => attachment.url),
      };
      if (targetMessage.components && targetMessage.components.length > 0) {
        messageObjectToSend.components = targetMessage.components;
      }
    } catch (error) {
      console.error(error);
    }

    if (
      isDMGreetingOn === "off" ||
      isDMGreetingOn === null ||
      isDMGreetingOn === ""
    ) {
      console.log("DMGreeting is off, returning");
      return;
    }

    const user = member.user;
    user.send(messageObjectToSend).catch((error) => {
      console.error(`Failed to send DM to ${user.tag}: ${error}`);
    });
  },
};
