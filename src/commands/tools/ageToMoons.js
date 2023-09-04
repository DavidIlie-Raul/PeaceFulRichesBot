const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("age-to-moons")
    .setDescription("Converts your age from years to moons")
    .addIntegerOption((option) =>
      option
        .setName("age")
        .setDescription("Your age in years")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    function getAgeInMoons(age) {
      try {
        const birthDate = new Date(
          Date.now() - age * 365 * 24 * 60 * 60 * 1000
        );
        const currentDate = new Date();
        const timeDiff = currentDate.getTime() - birthDate.getTime();
        const daysOld = timeDiff / (1000 * 3600 * 24);
        const moonsOld = Math.floor(daysOld / 29.5305882);
        return moonsOld;
      } catch (error) {
        console.log("An error has occurred:", error);
        // Handle the error here, such as providing a default value or taking alternative actions
        // Return a default value or an indication of the error condition
        return "An error has occurred while calculating the age in moons. Please try again later.";
      }
    }
    try {
      const age = interaction.options.getInteger("age");
      const moonsOld = getAgeInMoons(age);
      await interaction.reply(`You have lived through ${moonsOld} full moons!`);
    } catch (error) {
      await interaction.reply({
        content:
          "Invalid age provided. Please provide a valid integer (eg. 60, 24, 53).",
        ephemeral: true,
      });
    }
  },
};
