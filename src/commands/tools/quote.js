const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Displays a random Quote"),

  async execute(interaction, client) {
    function getQuote() {
      return fetch("https://zenquotes.io/api/random")
        .then((res) => res.json())
        .then((data) => data[0]["q"] + "-" + data[0]["a"])
        .catch((error) => {
          console.log("An error has occurred:", error);
          return "An error has occured with supplying your quote!, please try again later!";
          // Handle the error here, such as providing a fallback quote or taking alternative actions
        });
    }
    try {
      const quote = await getQuote();
      await interaction.reply(quote);
    } catch (error) {
      await interaction.reply(
        "Invalid age provided. Please provide a valid integer."
      );
    }
  },
};
