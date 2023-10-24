const { SlashCommandBuilder } = require("discord.js");
const { dbclient } = require("../../utils/connectToDB.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove-role")
    .setDescription("Removes the Role of a user")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The Role that should be removed from the member")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("target-member")
        .setDescription("The Member you want to remove the role from.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction, client) {
    //Get the target role and member from the command options
    const roleToBeRemoved = interaction.options.getRole("role");
    const targetMember = interaction.options.getMember("target-member");

    async function removeRoleOfUserFromDB(role, discordID) {
      try {
        const lookUpResult = await dbclient.query(
          `SELECT * FROM users WHERE discord_id = '${discordID}'`
        );
        const userID = lookUpResult.rows[0].user_id;

        await dbclient.query(
          `DELETE FROM user_roles WHERE role = '${role}' AND user_id = ${userID}`
        );
        await dbclient.query(
          `DELETE FROM permanent_roles WHERE role = '${role}' AND user_id = ${userID}`
        );
      } catch (error) {
        console.log("Could not delete roles of user from the database");
      }
    }

    //Add the selected Role to the user
    try {
      await targetMember.roles.remove(roleToBeRemoved);
      await removeRoleOfUserFromDB(roleToBeRemoved, targetMember);
      await interaction.reply({
        content: `${roleToBeRemoved} successfully removed from ${targetMember}`,
        ephemeral: true,
      });
      console.log(
        `Successfully removed ${roleToBeRemoved} role from ${targetMember}`
      );
    } catch (error) {
      if (error.code === 50013) {
        console.log(`Insufficient Permissions to remove role`);
        await interaction.reply({
          content:
            "The Bot does not posess sufficient permissions to remove this Role, Contact Tech Support for help",
          ephemeral: true,
        });
      } else {
        console.log(
          `Removing Role ${roleToBeRemoved} from user ${targetMember} has failed: `,
          error
        );
        await interaction.reply({
          content:
            "Removing Role has failed, please try again, or contact Tech Support",
          ephemeral: true,
        });
      }
    }
  },
};
