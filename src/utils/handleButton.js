const {
  ActionRowBuilder,
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

module.exports = async (interaction) => {
  if (interaction.customId === "email_capture") {
    console.log("Email Capture Button Was Clicked");
    // Create the modal
    const modal = new ModalBuilder()
      .setCustomId("emailCaptureModal")
      .setTitle("Sign up to our newsletter!");

    // Add components to modal

    // Create the text input components
    const nameInput = new TextInputBuilder()
      .setCustomId("nameInput")
      // The label is the prompt the user sees for this input
      .setLabel("Please enter your name:")
      // Short means only a single line of text
      .setStyle(TextInputStyle.Short);

    const emailInput = new TextInputBuilder()
      .setCustomId("emailInput")
      .setLabel("Please enter your E-mail")
      // Paragraph means multiple lines of text.
      .setStyle(TextInputStyle.Short);

    // An action row only holds one text input,
    // so you need one action row per text input.
    const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
    const secondActionRow = new ActionRowBuilder().addComponents(emailInput);

    // Add inputs to the modal
    modal.addComponents(firstActionRow, secondActionRow);

    // Show the modal to the user
    await interaction.showModal(modal);
  }
};
