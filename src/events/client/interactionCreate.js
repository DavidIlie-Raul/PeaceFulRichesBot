const addToMailList = require("../../utils/handleMailSub.js");
const handleButtonInteraction = require("../../utils/handleButton.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      //Get the command and it's name, then check if it exists, if no, return, otherwise proceed
      const { commands } = client;
      const { commandName } = interaction;
      const command = commands.get(commandName);
      if (!command) return;

      //Here we do something with the command
      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.log(error);
        await interaction.reply({
          content: `Something went wrong while executing this command...`,
          ephemeral: true,
        });
      }
    }
    if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
    }
    if (interaction.isModalSubmit()) {
      try {
        const name = interaction.fields.getTextInputValue("nameInput");
        const email = interaction.fields.getTextInputValue("emailInput");
        console.log(name, email);

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
          const user = interaction.user;
          await interaction.reply({
            content: `${user}, The Email address you have provided is invalid! Please try again!`,
            ephemeral: true,
          });
          return;
        }

        const response = await addToMailList(name, email);
        console.log("MailList(zoho) response:", response); // Log the entire response object
        const user = interaction.user;
        if (
          response.code === "200" ||
          (response.code === "0" &&
            response.message === "User successfully subscribed.")
        ) {
          await interaction.reply({
            content: `${user} You have successfully subscribed to the Peaceful Riches Newsletter! Thank you!`,
            ephemeral: true,
          });
        } else if (
          response.code === "0" &&
          response.message ===
            "This email address already exists in the list. However, any additional information will be updated in the existing contact."
        ) {
          await interaction.reply({
            content: `${user} The Email you have provided is already signed up. Thank you!`,
            ephemeral: true,
          });
        } else if (
          response.code === "2007" &&
          response.message === "Invalid Contact Email address."
        ) {
          await interaction.reply({
            content: `${user} The Email you have provided is invalid. Please try again!`,
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: ` Sorry, ${user}! The subscription has failed! Please try again later!`,
            ephemeral: true,
          });
        }
      } catch (error) {
        console.error("Error submitting data to MailingList(zoho):", error);
        console.log("Error details:", error.response); // Log the error details

        let errorMessage;

        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          const errorCode = error.response?.data?.code;
          const errorMessage = error.response?.data?.message;

          if (errorCode === "2007") {
            errorMessage =
              "You have provided an invalid Email, please try again!";
          }
        }

        if (errorMessage) {
          const user = interaction.user;
          await interaction.reply({
            content: `${user} ${errorMessage}`,
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "An error occurred. Please try again later.",
            ephemeral: true,
          });
        }
      }
    }
  },
};
