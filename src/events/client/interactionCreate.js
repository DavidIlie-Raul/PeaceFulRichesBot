const addToMailchimp = require("../../utils/handleMailSub.js");
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

        const response = await addToMailchimp(name, email);
        console.log("Mailchimp response:", response); // Log the entire response object
        const user = interaction.user;
        if (response.status === "subscribed") {
          await interaction.reply({
            content: `${user} You have successfully subscribed to the Peaceful Riches Newsletter! Thank you!`,
            ephemeral: true,
          });
        } else if (response.status === "unsubscribed") {
          await interaction.reply({
            content: `${user}You have successfully unsubscribed from the Peaceful Riches Newsletter!`,
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: ` Sorry, ${user}! The subscription has failed! Please try again later!`,
            ephemeral: true,
          });
        }
      } catch (error) {
        console.error("Error submitting data to Mailchimp:", error);
        console.log("Error details:", error.response.data); // Log the error details

        let errorMessage;

        if (
          error.response &&
          error.response.data &&
          error.response.data.title
        ) {
          const errorTitle = error.response.data.title;

          switch (errorTitle) {
            case "Member Exists":
              errorMessage =
                "You are already subscribed to the newsletter, thank you!";
              break;
            case "Invalid Resource":
              errorMessage =
                "The Email you have entered looks fake or invalid, please enter a real email address.";
              break;
            // Add more cases for different error titles as needed

            default:
              // No specific error message found
              break;
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
