require("dotenv").config();
const { token } = process.env;
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { configDotenv, config } = require("dotenv");
const fs = require("fs");
const axios = require("axios");

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

function refreshZohoAccessToken() {
  //Implement zoho token refresh handling here
  try {
    config();
    console.log("reloaded dotenv variables");
  } catch (error) {
    console.error("failed to reload dotenv variables:", error);
  }
  const zohoRefreshToken = process.env.zoho_refresh_token;
  let zohoClientSecret = process.env.zoho_client_secret;

  const baseUrl = "https://accounts.zoho.eu/oauth/v2/token";
  const queryParams = {
    client_id: "1000.H5RFTNXMCQ3SXKVQNOQ0UW6D5KLWLX",
    grant_type: "refresh_token",
    client_secret: zohoClientSecret,
    refresh_token: zohoRefreshToken,
  };

  // Construct the URL with query parameters
  const urlWithParams = `${baseUrl}?${Object.entries(queryParams)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&")}`;

  axios
    .post(urlWithParams)
    .then((response) => {
      let responseData = response.data;
      console.log(responseData);
      try {
        if (response.data && responseData.access_token) {
          process.env.zoho_access_token = responseData.access_token;
          // Read the existing content of the .env file
          const existingEnvContent = fs.readFileSync(".env", "utf-8");

          // Split the content into lines
          const lines = existingEnvContent.split("\n");

          // Find and replace the line with the updated access token
          const updatedEnvContent = lines
            .map((line) => {
              if (line.startsWith("zoho_access_token=")) {
                return `zoho_access_token="${responseData.access_token}"`;
              }
              return line;
            })
            .join("\n");

          // Write the updated content back to the .env file
          fs.writeFileSync(".env", updatedEnvContent);
          console.log("successfully refreshed zoho access token");
        }
      } catch (error) {
        console.log("could not refresh access token for zoho", error);
      }
    })
    .catch((error) => {
      console.log(error, error.data);
    });
}

refreshZohoAccessToken();
try {
  setInterval(refreshZohoAccessToken, 3600000);
  console.log("Succesfully set zoho access token to refresh every 2 minutes");
} catch (error) {
  console.log(
    "Did not manage to set zoho access token to refresh every 2 minutes",
    error
  );
}

client.handleEvents();
client.handleCommands();
client.login(token);
