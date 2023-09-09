const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("quote")
    .setDescription("Displays a random Quote"),

  async execute(interaction, client) {
    const axios = require("axios");

    async function getQuote() {
      try {
        console.log("Fetching quote...");
        const response = await axios.get("https://zenquotes.io/api/random");
        const data = response.data;
        console.log("Received data from API:", data);

        if (data && data.length > 0) {
          return data[0]["q"] + "-" + data[0]["a"];
        } else {
          throw new Error("No data received from the API");
        }
      } catch (error) {
        console.error("An error has occurred:", error);
        throw new Error(
          "An error has occurred with supplying your quote!, please try again later!"
        );
      }
    }

    try {
      console.log("Attempting to get a quote...");
      const quote = await getQuote();
      console.log("Received quote:", quote);
      await interaction.reply(quote);
    } catch (error) {
      console.error("Error while getting quote:", error);
      await interaction.reply({
        content:
          "Sorry, An error has occurred with displaying a quote, please try again later!",
        ephemeral: true,
      });
    }
  },
};
