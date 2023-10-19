const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

module.exports = (client) => {
  client.handleCommands = async () => {
    const commandFolders = fs.readdirSync(`./src/commands`);
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));

      const { commands, commandsArray } = client;
      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        commands.set(command.data.name, command);
        commandsArray.push(command.data.toJSON());
        console.log(
          `Command:${command.data.name} has passed through handler of commands`
        );
      }
    }

    const clientID = process.env.clientid;
    const guildID = process.env.guildid;
    const rest = new REST({ version: "9" }).setToken(process.env.token);

    try {
      console.log("Started refreshing applcation (/) commands.");

      await rest.put(Routes.applicationGuildCommands(clientID, guildID), {
        body: client.commandsArray,
      });
    } catch (error) {}
  };
};
