const { SlashCommandBuilder } = require("discord.js");
const { dbclient } = require("../../utils/connectToDB.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-role")
    .setDescription("Adds a Role to a user for a specified time period"),

  async execute(interaction, client) {
    try {
      let results = await dbclient.query("SELECT * FROM users");
      console.log(results.rows);
      if (results.rows !== "" && results.rows !== undefined) {
        const mappedResults = results.rows.map(function (item) {
          return `${item.user_id} ${item.username}`;
        });
        await interaction.reply(
          "These are the results of the query: " + `${mappedResults}`
        );
      } else {
        await interaction.reply("An error has occurred");
      }
    } catch (error) {
      console.log("An error has occurred:", error);
    }
  },
};
