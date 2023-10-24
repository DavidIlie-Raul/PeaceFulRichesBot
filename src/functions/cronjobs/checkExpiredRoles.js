const { cancelJob, scheduleJob } = require("node-schedule");
const { dbclient } = require("../../utils/connectToDB");
require("dotenv").config();

module.exports = (client) => {
  client.dbChecking = async (mode) => {
    switch (mode) {
      case "On":
        await on();
        console.log("Periodic checking of expired roles has been turned on");
        break;

      case "Off":
        await off();
        console.log("Periodic checking of expired roles has been turned off");
        break;
    }

    async function on() {
      scheduleJob("checkForExpiredRoles", "0 0 * * *", async function () {
        //Find all expired Roles
        const queryAllTemporaryRolesResult = await dbclient.query(
          "SELECT * FROM user_roles WHERE created_at + duration < CURRENT_TIMESTAMP"
        );
        let arrayOfExpiredRoles = queryAllTemporaryRolesResult.rows;
        console.log(arrayOfExpiredRoles);

        //Loop over all the objects in the received expired roles rows array and remove the discord role and the db entry for them
        for (const expiredRole of arrayOfExpiredRoles) {
          let expiredRoleUserID = expiredRole.user_id;
          let userThatTheRoleBelongsTo = await dbclient.query(
            `SELECT * FROM users WHERE user_id = '${expiredRoleUserID}'`
          );
          let discordIDOfUserThatTheRoleBelongsTO =
            userThatTheRoleBelongsTo.rows[0].discord_id;
          let formattedDiscordIDOfUserThatTheRoleBelongsTo =
            discordIDOfUserThatTheRoleBelongsTO.match(/\d+/)[0];
          let roleToBeRemoved = expiredRole.role;
          let formattedRoleToBeRemoved = roleToBeRemoved.match(/\d+/)[0];

          //Remove role of user here, guildid accessed with process.env.guildid;
          try {
            const guildId = process.env.guildid;
            const guild = client.guilds.cache.get(guildId);

            if (guild) {
              const member = await guild.members.fetch(
                formattedDiscordIDOfUserThatTheRoleBelongsTo
              );
              await member.roles.remove(formattedRoleToBeRemoved);
            }
            console.log("removed expired role of a member");

            await dbclient.query(
              `DELETE FROM user_roles WHERE user_id = '${expiredRoleUserID}'`
            );
          } catch (error) {
            console.log("Error removing expired role from Discord", error);
          }
        }

        //Loop through each expired role, find the user associated to their id, remove their discord role, remove them from database
      });
    }
    async function off() {
      await cancelJob("checkForExpiredRoles");
      return console.log(
        "Successfully Cancelled checking for Expired Roles Cron Job"
      );
    }
  };
};
