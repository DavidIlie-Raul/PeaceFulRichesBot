require("dotenv").config();
const fs = require("fs");
const { ChannelType } = require("discord.js");

module.exports = {
  name: "messageCreate",
  async execute(message) {
    //Execute some code when the messageCreate event is received
    if (
      message.system === true ||
      message.type !== 0 ||
      message.author.bot === true
    ) {
      return;
    }
    //define the path of the dataStorageJsonFile
    const pathOfJsonStorageFile = "src/StoredData.json";

    //Check if auto-thread is on, if on, continue, else return
    const result = await fs.readFileSync(pathOfJsonStorageFile, "utf-8");
    const jsonData = JSON.parse(result);
    if (
      jsonData?.isAutoThreadOn === "off" ||
      message.type === "APPLICATION_COMMAND" ||
      message.ephemeral
    ) {
      return;
    }

    //define a function to get from the storage file, the array of channels to listen to(id)
    async function getChannelsToListenToArrayFromFile(path) {
      try {
        const result = await fs.readFileSync(path, "utf-8");
        const jsonData = JSON.parse(result);
        return jsonData.autoThreadChannelsByID;
      } catch (error) {
        return console.error(
          "Error occurred in reading the auto thread channels, returning."
        );
      }
    }
    let isChannelValid = false;

    const idOfTheChannelThatTheMessageWasSentIn = message.channelId;
    const autoThreadChannels = await getChannelsToListenToArrayFromFile(
      pathOfJsonStorageFile
    );

    //Loop over the channels to listen to and see if any of them matches the id of the channel that the message was sent in.
    for (let index = 0; index <= autoThreadChannels.length; index++) {
      if (autoThreadChannels[index] === idOfTheChannelThatTheMessageWasSentIn) {
        isChannelValid = true;
        break;
      }
    }

    if (isChannelValid) {
      const thread = await message.startThread({
        name: `Reply to ${message.author.username}`,
        autoArchiveDuration: 1440,
        reason: "Reply",
      });
      await thread.setArchived(true);
    }
  },
};
