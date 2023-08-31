const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("messageall")
    .setDescription("Send a DM to all members of the current server")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The message to send")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction, client) {
    if (!interaction.guild) {
      await interaction.reply(
        "This command can only be used in server channels by an authorised Admin."
      );
      return;
    }

    const member =
      interaction.member ||
      (interaction.guild &&
        (await interaction.guild.members.fetch(interaction.user)));

    const messageContent = interaction.options.getString("message");
    const formattedMessage = messageContent.replace(/\*\*(.*?)\*\*/g, "**$1**");

    // Fetch all members of the guild
    const guildMembers = Array.from(interaction.guild.members.cache);

    // Define the rate limit parameters
    const messagesPerMinute = 50; // Maximum number of messages per minute
    const interval = 60000 / messagesPerMinute; // Interval between each message in milliseconds

    // Iterate over each member and send the message
    // Iterate over each member and send the message
    for (const [index, guildMember] of guildMembers.entries()) {
      setTimeout(async () => {
        try {
          await guildMember[1].send(formattedMessage);
          console.log(
            "Successfully sent a message to member " + guildMember[1].user.tag
          );
          console.log(`Current Index: ${index}`);
          console.log(`Remaining: ${guildMembers.length - index - 1}`);
        } catch (error) {
          console.error(
            "Failed to send DM to member " + guildMember[1].user.tag
          );
          console.error(error); // Log the specific error
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
