const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { dbclient } = require("../../utils/connectToDB.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-role")
    .setDescription("Adds a Role to a user for a specified time period")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The Role that should be added to the member")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("target-member")
        .setDescription("The Member you want to add the role to.")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("duration-months")
        .setDescription(
          "Set for how many months(1-24) should this user have this role, leave empty for permanent"
        )
        .setMaxValue(24)
        .setMinValue(1)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction, client) {
    //Get the target role and member from the command options
    const roleToBeAdded = interaction.options.getRole("role");
    const targetMember = interaction.options.getMember("target-member");
    const durationMonths = interaction.options.getInteger("duration-months");
    const targetMembersUsername = targetMember.user.username;
    let UserID;
    let replyContent;

    async function registerRoleAdditionToDB(
      role,
      member,
      durationMonths,
      memberUsername
    ) {
      async function checkForUserOrAddThemToDB() {
        //Check if the user already exists in DB
        const lookUpExistingUser = await dbclient.query(
          `SELECT * FROM users WHERE discord_id = '${member}'`
        );

        //If he does not exist, add him to it, and set user id to his user id
        if (lookUpExistingUser.rowCount === 0) {
          console.log(
            "User Does not exist yet, adding him to the database, setting user_id to the new record"
          );
          //Add the user to the users table
          const addToUsersTableResult = await dbclient.query(
            `INSERT INTO users (username,discord_id) VALUES ('${memberUsername}','${member}')`
          );
          //Lookup the newly added user in the db to extract the user_id
          const lookUpNewlyAddedUserResult = await dbclient.query(
            `SELECT * FROM users WHERE discord_id = '${member}'`
          );
          UserID = lookUpNewlyAddedUserResult.rows[0].user_id;
        } else {
          console.log(
            "User already exists, using fetched record for setting the user id"
          );
          UserID = lookUpExistingUser.rows[0].user_id;
        }

        console.log(UserID);
      }

      async function addPermanentRole() {
        //Check if the user already has the permanent role that we are trying to assign
        const checkIfAlreadyExistsResult = await dbclient.query(
          `SELECT * FROM permanent_roles WHERE role = '${role}' AND user_id = '${UserID}'`
        );
        if (checkIfAlreadyExistsResult.rowCount === 0) {
          try {
            //Register a permanent role to the permanent_role table
            const addToPermanentRolesTableResult = await dbclient.query(
              `INSERT INTO permanent_roles (role, user_id) VALUES ('${role}',${UserID})`
            );
            console.log("Successfully Registered permanent role");
            replyContent = `Successfully added ${role} to ${targetMember} permanently`;
          } catch (error) {
            console.log("Could not add permanent Role: ", error);
            replyContent = `An error occurred with adding the permanent role, please try again later or contact tech support`;
          }
        } else {
          replyContent = `${member} already has the permanent ${role} role`;
        }
        return replyContent;
      }

      async function addTemporaryRole() {
        //Check if the user already has the temporary role that we are trying to assign
        const checkIfAlreadyExistsResult = await dbclient.query(
          `SELECT * FROM user_roles WHERE role = '${role}' AND user_id = '${UserID}'`
        );
        if (checkIfAlreadyExistsResult.rowCount === 0) {
          try {
            //Register the role that was added to the user in the user_roles table
            const addToUserRolesTableResult = await dbclient.query(
              `INSERT INTO user_roles (role, duration, user_id) VALUES ('${role}',${durationString},${UserID})`
            );
            console.log("Successfully Registered Temporary role");
            replyContent = `Successfully added ${role} to ${member} for ${durationMonths} months`;
          } catch (error) {
            console.log("Could not add Temporary Role: ", error);
            replyContent = `An error occurred with adding the temporary role, please try again later or contact tech support`;
          }
        } else {
          replyContent = `${member} already has the temporary ${role} role`;
        }
        return replyContent;
      }
      await checkForUserOrAddThemToDB();
      let durationString = undefined;
      if (durationMonths === 1) {
        durationString = "INTERVAL '1 month'";
        await addTemporaryRole();
      } else if (
        !durationMonths ||
        durationMonths === "" ||
        durationMonths === undefined
      ) {
        console.log("Duration not specified for user, switching to permanent");
        await addPermanentRole();
      } else {
        durationString = `INTERVAL '${durationMonths} months'`;
        await addTemporaryRole();
      }
      return replyContent;
    }

    //Add the selected Role to the user
    try {
      await targetMember.roles.add(roleToBeAdded);
      replyContent = await registerRoleAdditionToDB(
        roleToBeAdded,
        targetMember,
        durationMonths,
        targetMembersUsername
      );

      await interaction.reply({
        content: replyContent,
        ephemeral: true,
      });
    } catch (error) {
      if (error.code === 50013) {
        console.log(`Insufficient Permissions to add role`);
        await interaction.reply({
          content:
            "The Bot does not posess sufficient permissions to add this Role, Contact Tech Support for help",
          ephemeral: true,
        });
      } else {
        console.log(
          `Adding Role ${roleToBeAdded} to user ${targetMember} has failed: `,
          error
        );
        await interaction.reply({
          content:
            "Adding Role has failed, please try again, or contact Tech Support",
          ephemeral: true,
        });
      }
    }
  },
};
