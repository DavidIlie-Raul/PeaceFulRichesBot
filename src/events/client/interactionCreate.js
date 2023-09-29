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
        console.log(response?.data);
        const user = interaction.user;

        if (
          response?.message &&
          response?.message === "E-mail already exists."
        ) {
          await interaction.reply({
            content: `${user}, The Email address you have provided is already registered! Thank you!`,
            ephemeral: true,
          });
          return;
        } else if (
          response?.data?.uuid &&
          response?.data?.created_at &&
          response?.data?.status
        ) {
          await interaction.reply({
            content: `${user}, You have successfully registered! Thanks!`,
            ephemeral: true,
          });
          return;
        } else {
          await interaction.reply({
            content: `${user}, An unexpected error occured while trying to sign you up! Please try again later, or contact tech support`,
            ephemeral: true,
          });

          return;
        }
      } catch (error) {
        console.log("Registering email to list has failed" + error);
        await interaction.reply({
          content: `${user}, An unexpected error occured while trying to sign you up! Please try again later, or contact tech support`,
          ephemeral: true,
        });
      }
    }
  },
};
