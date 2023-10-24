require("dotenv").config();
const { token } = process.env;
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const { connect } = require("./utils/connectToDB");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildIntegrations,
  ],
});

client.commands = new Collection();
client.commandsArray = [];

const functionFolders = fs.readdirSync("./src/functions");
for (const folder of functionFolders) {
  const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter((File) => File.endsWith(".js"));

  for (const file of functionFiles) {
    require(`./functions/${folder}/${file}`)(client);
  }
}

connect();
client.handleEvents();
client.handleCommands();
client.dbChecking("On");
client.login(token);

module.exports = { client };
